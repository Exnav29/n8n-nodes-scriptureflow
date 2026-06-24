import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestOptions,
	type INode,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';
import { bookDescription } from './resources/book';
import { scriptureDescription } from './resources/scripture';
import { translationDescription } from './resources/translation';

const API_BASE_URL = 'https://scriptureflow-api-preview.pages.dev';
const TRANSLATIONS_URL = `${API_BASE_URL}/translations.json`;

const SCRIPTURE_FIELDS = [
	'ok',
	'type',
	'version',
	'reference',
	'book',
	'book_slug',
	'canonical_book',
	'chapter',
	'verse',
	'text',
	'source',
	'lookup',
	'served_at_utc',
	'source_path',
	'api_path',
];

function simplify(data: IDataObject, fields: string[]): IDataObject {
	const result: IDataObject = {};

	for (const field of fields) {
		if (data[field] !== undefined && data[field] !== null) {
			result[field] = data[field];
		}
	}

	return result;
}

function asObjectArray(value: unknown, endpoint: string, node: INode, itemIndex: number): IDataObject[] {
	if (!Array.isArray(value) || value.some((entry) => !entry || typeof entry !== 'object' || Array.isArray(entry))) {
		throw new NodeOperationError(node, 'ScriptureFlow returned an unexpected catalog response.', {
			itemIndex,
			description: `Expected an array of JSON objects from ${endpoint}.`,
		});
	}

	return value as IDataObject[];
}

function positiveInteger(value: unknown, displayName: string, node: INode, itemIndex: number): number {
	const numberValue = typeof value === 'number' ? value : Number(value);

	if (!Number.isInteger(numberValue) || numberValue < 1) {
		throw new NodeOperationError(node, `${displayName} must be a positive whole number.`, {
			itemIndex,
			description: `Enter a valid ${displayName.toLowerCase()} and try again.`,
		});
	}

	return numberValue;
}

function validateText(
	value: unknown,
	displayName: string,
	node: INode,
	itemIndex: number,
): string {
	if (typeof value !== 'string' || value.trim() === '') {
		const versionDescription =
			displayName === 'Version Key'
				? `Enter an exact Version Key from ${TRANSLATIONS_URL}.`
				: `Enter a ${displayName.toLowerCase()} and try again.`;

		throw new NodeOperationError(node, `${displayName} is required.`, {
			itemIndex,
			description: versionDescription,
		});
	}

	return value.trim();
}

function apiErrorMessage(response: IDataObject): string {
	for (const field of ['message', 'error', 'detail']) {
		if (typeof response[field] === 'string' && response[field].trim() !== '') {
			return response[field];
		}
	}

	return 'ScriptureFlow reported that the request could not be completed.';
}

function assertSuccessfulResponse(
	response: IDataObject,
	node: INode,
	itemIndex: number,
	version: string,
): void {
	if (response.ok === false) {
		throw new NodeOperationError(node, apiErrorMessage(response), {
			itemIndex,
			description: `Check the requested reference and confirm that Version Key "${version}" is listed at ${TRANSLATIONS_URL}. Some translations are partial.`,
		});
	}
}

async function requestJson(
	context: IExecuteFunctions,
	options: IHttpRequestOptions,
	itemIndex: number,
	description: string,
): Promise<unknown> {
	try {
		return await context.helpers.httpRequest({
			...options,
			baseURL: options.baseURL ?? API_BASE_URL,
		});
	} catch (error) {
		throw new NodeApiError(context.getNode(), error as JsonObject, {
			itemIndex,
			message: 'ScriptureFlow API request failed',
			description,
		});
	}
}

export class Scriptureflow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ScriptureFlow',
		name: 'scriptureflow',
		icon: 'file:scriptureflow.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get multilingual Bible data from ScriptureFlow.',
		defaults: {
			name: 'ScriptureFlow',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [],
		requestDefaults: {
			baseURL: API_BASE_URL,
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Book', value: 'book' },
					{ name: 'Scripture', value: 'scripture' },
					{ name: 'Translation', value: 'translation' },
				],
				default: 'scripture',
			},
			...bookDescription,
			...scriptureDescription,
			...translationDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
				const shouldSimplify = options.simplify === true;

				if (resource === 'translation' && operation === 'getMany') {
					const response = await requestJson(
						this,
						{ method: 'GET', url: '/translations.json', json: true },
						itemIndex,
						`Could not retrieve translations. Try again or open ${TRANSLATIONS_URL} to confirm the catalog is available.`,
					);
					const translations = asObjectArray(response, '/translations.json', this.getNode(), itemIndex);
					const returnAll = options.returnAll === true;
					const limit = positiveInteger(options.limit ?? 50, 'Limit', this.getNode(), itemIndex);
					const selected = returnAll ? translations : translations.slice(0, limit);

					returnData.push(
						...selected.map((translation) => ({
							json: translation,
							pairedItem: { item: itemIndex },
						})),
					);
					continue;
				}

				const version = validateText(
					this.getNodeParameter('version', itemIndex),
					'Version Key',
					this.getNode(),
					itemIndex,
				);

				if (resource === 'book' && operation === 'getMany') {
					const path = `/${encodeURIComponent(version)}/books.json`;
					const response = await requestJson(
						this,
						{ method: 'GET', url: path, json: true },
						itemIndex,
						`Could not retrieve books for Version Key "${version}". Confirm the key at ${TRANSLATIONS_URL}; some translations are partial.`,
					);
					const books = asObjectArray(response, path, this.getNode(), itemIndex);
					const returnAll = options.returnAll === true;
					const limit = positiveInteger(options.limit ?? 50, 'Limit', this.getNode(), itemIndex);
					const selected = returnAll ? books : books.slice(0, limit);

					returnData.push(
						...selected.map((book) => ({
							json: book,
							pairedItem: { item: itemIndex },
						})),
					);
					continue;
				}

				if (resource === 'scripture' && operation === 'getVerse') {
					const book = validateText(
						this.getNodeParameter('book', itemIndex),
						'Book',
						this.getNode(),
						itemIndex,
					);
					const chapter = positiveInteger(
						this.getNodeParameter('chapter', itemIndex),
						'Chapter',
						this.getNode(),
						itemIndex,
					);
					const verse = positiveInteger(
						this.getNodeParameter('verse', itemIndex),
						'Verse',
						this.getNode(),
						itemIndex,
					);
					const response = (await requestJson(
						this,
						{
							method: 'GET',
							url: '/api/verse',
							qs: { version, book, chapter, verse },
							json: true,
						},
						itemIndex,
						`Could not retrieve ${book} ${chapter}:${verse}. Confirm Version Key "${version}" at ${TRANSLATIONS_URL} and check that the translation contains the requested verse.`,
					)) as IDataObject;
					assertSuccessfulResponse(response, this.getNode(), itemIndex, version);
					returnData.push({
						json: shouldSimplify ? simplify(response, SCRIPTURE_FIELDS) : response,
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				let path: string;
				let failureDescription: string;

				if (resource === 'scripture' && operation === 'getQuickVerse') {
					path = '/api/quick-verse';
					failureDescription = `Could not retrieve a Quick Verse for Version Key "${version}". Confirm the key at ${TRANSLATIONS_URL}.`;
				} else if (resource === 'scripture' && operation === 'getGeneratedVerseOfTheDay') {
					path = `/${encodeURIComponent(version)}/random.json`;
					failureDescription = `Could not retrieve the generated Verse of the Day for Version Key "${version}". Confirm the key at ${TRANSLATIONS_URL}.`;
				} else {
					throw new NodeOperationError(this.getNode(), 'Unsupported ScriptureFlow operation.', {
						itemIndex,
						description: 'Choose one of the available v1 resources and operations.',
					});
				}

				const response = (await requestJson(
					this,
					{
						method: 'GET',
						url: path,
						...(operation === 'getQuickVerse' ? { qs: { version } } : {}),
						json: true,
					},
					itemIndex,
					failureDescription,
				)) as IDataObject;
				assertSuccessfulResponse(response, this.getNode(), itemIndex, version);
				returnData.push({
					json: shouldSimplify ? simplify(response, SCRIPTURE_FIELDS) : response,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				const nodeError =
					error instanceof NodeOperationError || error instanceof NodeApiError
						? error
						: new NodeApiError(this.getNode(), error as JsonObject, {
								itemIndex,
								message: 'ScriptureFlow API request failed',
								description: 'Could not retrieve the requested data from ScriptureFlow.',
							});

				if (this.continueOnFail()) {
					returnData.push({
						json: { error: nodeError.message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				throw nodeError;
			}
		}

		return [returnData];
	}
}

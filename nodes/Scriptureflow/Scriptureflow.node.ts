import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestOptions,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';
import { bookDescription } from './resources/book';
import { passageDescription } from './resources/passage';
import { randomDescription } from './resources/random';
import { translationDescription } from './resources/translation';

const API_BASE_URL = 'https://scriptureflow-api-preview.pages.dev';
const VERSE_ENDPOINT = '/api/verse';
const TRANSLATIONS_ENDPOINT = '/translations.json';

type OutputFormat = 'rawJson' | 'plainText' | 'formattedCitation';
type BookOutputFormat = 'rawJson' | 'simplifiedList';
type BookReturnMode = 'items' | 'list';
type TranslationOutputFormat = 'rawJson' | 'simplifiedList';
type TranslationReturnMode = 'items' | 'list';
type StatusFilter = 'all' | 'ready' | 'warning';
type UnavailablePassageBehavior = 'error' | 'returnErrorItem';
type ReferenceInputMode = 'guided' | 'manual';
type PassageLookupMethod = 'staticIndex' | 'api';
type RandomSource = 'fresh' | 'generated';

interface TranslationEntry extends IDataObject {
	version: string;
	language_code?: string;
	translation_name?: string;
	status?: string;
	books_found?: number;
	chapters_found?: number;
	verses_found?: number;
	verses_index_type?: string;
}

interface BookEntry extends IDataObject {
	id?: string;
	version?: string;
	book: string;
	book_slug?: string;
	canonical_book?: string;
	chapter_count?: number;
	verse_count?: number;
	source_path?: string;
	api_path?: string;
}

interface ChapterEntry extends IDataObject {
	id?: string;
	version?: string;
	book: string;
	book_slug?: string;
	canonical_book?: string;
	chapter: number;
	reference?: string;
	api_path?: string;
	source_path?: string;
	verse_count: number;
}

interface RequestMetadata extends IDataObject {
	version: string;
	book: string;
	chapter: number;
	verse: number;
	end_verse?: number;
	lookupMethod?: PassageLookupMethod;
	indexUrl?: string;
	requestUrl?: string;
}

interface PassageValidationData extends IDataObject {
	version: string;
	book: string;
	chapter: number;
	verse: number;
	end_verse?: number;
	lookupMethod?: PassageLookupMethod;
	indexUrl?: string;
	requestUrl?: string;
}

interface RandomRequestMetadata extends IDataObject {
	version: string;
	randomSource?: RandomSource;
	chaptersUrl?: string;
	chapterUrl?: string;
	verseIndexUrl?: string;
	requestUrl: string;
	selectedBook?: string;
	selectedBookSlug?: string;
	selectedChapter?: number;
	selectedVerse?: number;
	totalVerses?: number;
	lookupMethod?: string;
}

interface FreshRandomSelection {
	book: string;
	bookSlug: string;
	canonicalBook?: string;
	chapter: number;
	verse: number;
	totalVerses: number;
	chapterApiPath?: string;
	chapterSourcePath?: string;
}

interface FreshRandomSelectionResult {
	selection?: FreshRandomSelection;
	error?: string;
}

function getVerseText(response: IDataObject): string | undefined {
	const result = response.result;

	if (Array.isArray(result)) {
		const texts = result
			.map((entry) => {
				if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
					return undefined;
				}

				const text = (entry as IDataObject).text;

				return typeof text === 'string' && text.trim() !== '' ? text : undefined;
			})
			.filter((text): text is string => typeof text === 'string');

		if (texts.length === result.length && texts.length > 0) {
			return texts.join('\n');
		}
	}

	if (result && typeof result === 'object' && !Array.isArray(result)) {
		const text = (result as IDataObject).text;

		if (typeof text === 'string' && text.trim() !== '') {
			return text;
		}
	}

	return undefined;
}

function getReference(response: IDataObject, request: RequestMetadata): string {
	if (request.end_verse) {
		const result = response.result;

		if (Array.isArray(result) && result.length > 0) {
			const firstEntry = result[0];

			if (firstEntry && typeof firstEntry === 'object' && !Array.isArray(firstEntry)) {
				const book = (firstEntry as IDataObject).book;

				if (typeof book === 'string' && book.trim() !== '') {
					return `${book} ${request.chapter}:${request.verse}-${request.end_verse}`;
				}
			}
		}

		return `${request.book} ${request.chapter}:${request.verse}-${request.end_verse}`;
	}

	const result = response.result;

	if (result && typeof result === 'object' && !Array.isArray(result)) {
		const reference = (result as IDataObject).reference;

		if (typeof reference === 'string' && reference.trim() !== '') {
			return reference;
		}
	}

	if (typeof response.reference === 'string' && response.reference.trim() !== '') {
		return response.reference;
	}

	return `${request.book} ${request.chapter}:${request.verse}`;
}

function withMetadata(data: IDataObject, request: RequestMetadata, includeRequestMetadata: boolean): IDataObject {
	if (!includeRequestMetadata) {
		return data;
	}

	return {
		request,
		...data,
	};
}

function buildOutput(
	response: IDataObject,
	request: RequestMetadata,
	outputFormat: OutputFormat,
	includeRequestMetadata: boolean,
): IDataObject {
	if (outputFormat === 'rawJson') {
		if (!includeRequestMetadata) {
			return response;
		}

		return {
			request,
			data: response,
		};
	}

	const text = getVerseText(response);

	if (!text) {
		return {
			...(includeRequestMetadata ? { request } : {}),
			warning: 'The verse text could not be confidently identified in the ScriptureFlow API response.',
			data: response,
		};
	}

	if (outputFormat === 'plainText') {
		return withMetadata({ text }, request, includeRequestMetadata);
	}

	return withMetadata(
		{
			formattedText: `${getReference(response, request)} (${request.version})\n\n${text}`,
		},
		request,
		includeRequestMetadata,
	);
}

function getRandomVerseText(response: IDataObject): string | undefined {
	const text = response.text;

	if (typeof text === 'string' && text.trim() !== '') {
		return text;
	}

	return getVerseText(response);
}

function getRandomReference(response: IDataObject): string | undefined {
	const reference = response.reference;

	if (typeof reference === 'string' && reference.trim() !== '') {
		return reference;
	}

	const result = response.result;

	if (result && typeof result === 'object' && !Array.isArray(result)) {
		const resultReference = (result as IDataObject).reference;

		if (typeof resultReference === 'string' && resultReference.trim() !== '') {
			return resultReference;
		}
	}

	return undefined;
}

function buildRandomOutput(
	response: IDataObject,
	request: RandomRequestMetadata,
	outputFormat: OutputFormat,
	includeRequestMetadata: boolean,
): IDataObject {
	if (outputFormat === 'rawJson') {
		if (!includeRequestMetadata) {
			return response;
		}

		return {
			request,
			data: response,
		};
	}

	const text = getRandomVerseText(response);
	const reference = getRandomReference(response);

	if (!text) {
		return {
			...(includeRequestMetadata ? { request } : {}),
			warning: 'The verse text could not be confidently identified in the ScriptureFlow random verse response.',
			data: response,
		};
	}

	if (outputFormat === 'plainText') {
		if (!includeRequestMetadata) {
			return { text };
		}

		return {
			request,
			text,
		};
	}

	if (!reference) {
		return {
			...(includeRequestMetadata ? { request } : {}),
			warning: 'The reference could not be confidently identified in the ScriptureFlow random verse response.',
			data: response,
		};
	}

	if (!includeRequestMetadata) {
		return {
			formattedText: `${reference} (${request.version})\n\n${text}`,
		};
	}

	return {
		request,
		formattedText: `${reference} (${request.version})\n\n${text}`,
	};
}

function buildUnavailablePassageItem(error: string, data: PassageValidationData): IDataObject {
	return {
		ok: false,
		errorType: 'unavailable_passage',
		error,
		version: data.version,
		book: data.book,
		chapter: data.chapter,
		verse: data.verse,
		...(data.end_verse ? { end_verse: data.end_verse } : {}),
		...(data.lookupMethod ? { lookupMethod: data.lookupMethod } : {}),
		...(data.indexUrl ? { indexUrl: data.indexUrl } : {}),
		...(data.requestUrl ? { requestUrl: data.requestUrl } : {}),
	};
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) {
		return error.message;
	}

	if (typeof error === 'string') {
		return error;
	}

	return 'ScriptureFlow API request failed.';
}

function getErrorField(error: unknown, field: string): unknown {
	if (!error || typeof error !== 'object') {
		return undefined;
	}

	return (error as IDataObject)[field];
}

function getStatusCode(error: unknown): number | undefined {
	const directStatusCode = getErrorField(error, 'statusCode') ?? getErrorField(error, 'httpCode');
	const response = getErrorField(error, 'response');

	if (typeof directStatusCode === 'number') {
		return directStatusCode;
	}

	if (response && typeof response === 'object') {
		const responseStatusCode = (response as IDataObject).statusCode ?? (response as IDataObject).status;

		if (typeof responseStatusCode === 'number') {
			return responseStatusCode;
		}
	}

	return undefined;
}

function getStatusText(error: unknown): string | undefined {
	const directStatusText = getErrorField(error, 'statusText') ?? getErrorField(error, 'statusMessage');
	const response = getErrorField(error, 'response');

	if (typeof directStatusText === 'string') {
		return directStatusText;
	}

	if (response && typeof response === 'object') {
		const responseStatusText = (response as IDataObject).statusText ?? (response as IDataObject).statusMessage;

		if (typeof responseStatusText === 'string') {
			return responseStatusText;
		}
	}

	return undefined;
}

function getResponseBody(error: unknown): unknown {
	const responseBody =
		getErrorField(error, 'responseBody') ??
		getErrorField(error, 'errorResponse') ??
		getErrorField(error, 'body') ??
		((getErrorField(error, 'response') as IDataObject | undefined)?.body as unknown);

	if (responseBody === undefined || responseBody === null) {
		return undefined;
	}

	if (typeof responseBody === 'string') {
		return responseBody.length <= 2000 ? responseBody : `${responseBody.slice(0, 2000)}...`;
	}

	try {
		const serialized = JSON.stringify(responseBody);

		return serialized.length <= 2000 ? responseBody : `${serialized.slice(0, 2000)}...`;
	} catch {
		return undefined;
	}
}

function buildApiRequestFailedItem(error: unknown, data: PassageValidationData): IDataObject {
	const statusCode = getStatusCode(error);
	const statusText = getStatusText(error);
	const responseBody = getResponseBody(error);

	return {
		ok: false,
		errorType: 'api_request_failed',
		error: getErrorMessage(error),
		version: data.version,
		book: data.book,
		chapter: data.chapter,
		verse: data.verse,
		...(data.end_verse ? { end_verse: data.end_verse } : {}),
		...(data.lookupMethod ? { lookupMethod: data.lookupMethod } : {}),
		...(data.indexUrl ? { indexUrl: data.indexUrl } : {}),
		...(data.requestUrl ? { requestUrl: data.requestUrl } : {}),
		...(statusCode !== undefined ? { statusCode } : {}),
		...(statusText ? { statusText } : {}),
		...(responseBody !== undefined ? { responseBody } : {}),
	};
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

function asPositiveInteger(value: unknown): number {
	const numberValue = typeof value === 'number' ? value : Number(value);

	if (!Number.isInteger(numberValue) || numberValue < 1) {
		return 0;
	}

	return numberValue;
}

function asNonNegativeInteger(value: unknown): number {
	if (value === '' || value === undefined || value === null) {
		return 0;
	}

	const numberValue = typeof value === 'number' ? value : Number(value);

	if (!Number.isInteger(numberValue) || numberValue < 0) {
		return 0;
	}

	return numberValue;
}

function normalizeBibleIdentifier(value: unknown): string {
	return typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
}

function simplifyTranslation(translation: TranslationEntry): IDataObject {
	const simplified: IDataObject = {};

	for (const field of [
		'version',
		'language_code',
		'translation_name',
		'status',
		'books_found',
		'chapters_found',
		'verses_found',
		'verses_index_type',
	]) {
		const value = translation[field];

		if (value !== undefined && value !== null) {
			simplified[field] = value;
		}
	}

	return simplified;
}

function simplifyBook(book: BookEntry): IDataObject {
	const simplified: IDataObject = {};

	for (const field of [
		'id',
		'version',
		'book',
		'book_slug',
		'canonical_book',
		'chapter_count',
		'verse_count',
		'source_path',
		'api_path',
	]) {
		const value = book[field];

		if (value !== undefined && value !== null) {
			simplified[field] = value;
		}
	}

	return simplified;
}

function simplifyChapter(chapter: ChapterEntry): IDataObject {
	const simplified: IDataObject = {};

	for (const field of [
		'id',
		'version',
		'book',
		'book_slug',
		'canonical_book',
		'chapter',
		'reference',
		'verse_count',
		'source_path',
		'api_path',
	]) {
		const value = chapter[field];

		if (value !== undefined && value !== null) {
			simplified[field] = value;
		}
	}

	return simplified;
}

function sumBookField(books: BookEntry[], field: 'chapter_count' | 'verse_count'): number {
	return books.reduce((total, book) => {
		const value = Number(book[field]);

		return Number.isFinite(value) ? total + value : total;
	}, 0);
}

function sumChapterVerses(chapters: ChapterEntry[]): number {
	return chapters.reduce((total, chapter) => {
		const value = Number(chapter.verse_count);

		return Number.isFinite(value) ? total + value : total;
	}, 0);
}

function filterTranslations(
	translations: TranslationEntry[],
	statusFilter: StatusFilter,
	languageCodeFilter: string,
): TranslationEntry[] {
	const normalizedLanguageCodeFilter = languageCodeFilter.trim().toLowerCase();

	return translations.filter((translation) => {
		const status = typeof translation.status === 'string' ? translation.status.toLowerCase() : '';
		const languageCode =
			typeof translation.language_code === 'string' ? translation.language_code.toLowerCase() : '';
		const version = typeof translation.version === 'string' ? translation.version.toLowerCase() : '';

		if (statusFilter !== 'all' && status !== statusFilter) {
			return false;
		}

		if (
			normalizedLanguageCodeFilter &&
			languageCode !== normalizedLanguageCodeFilter &&
			!version.startsWith(`${normalizedLanguageCodeFilter}-`)
		) {
			return false;
		}

		return true;
	});
}

function matchesBook(entry: ChapterEntry, selectedBook: string): boolean {
	const normalizedSelectedBook = normalizeBibleIdentifier(selectedBook);

	return [entry.canonical_book, entry.book_slug, entry.book].some(
		(bookValue) => normalizeBibleIdentifier(bookValue) === normalizedSelectedBook,
	);
}

function getChapterLabel(chapter: number): string {
	return `Chapter ${chapter}`;
}

function getVerseLabel(verse: number): string {
	return `Verse ${verse}`;
}

function getValidChapters(chapters: ChapterEntry[]): ChapterEntry[] {
	return chapters.filter((chapter) => {
		const book = chapter.book_slug ?? chapter.canonical_book ?? chapter.book;

		return (
			typeof book === 'string' &&
			book.trim() !== '' &&
			Number.isInteger(Number(chapter.chapter)) &&
			Number(chapter.chapter) > 0 &&
			Number.isInteger(Number(chapter.verse_count)) &&
			Number(chapter.verse_count) > 0
		);
	});
}

function selectFreshRandomVerse(chapters: ChapterEntry[]): FreshRandomSelectionResult {
	const validChapters = getValidChapters(chapters);
	const totalVerses = validChapters.reduce((total, chapter) => total + Number(chapter.verse_count), 0);

	if (totalVerses < 1) {
		return {
			error: 'ScriptureFlow chapters catalog does not contain any valid chapters with verse counts.',
		};
	}

	let selectedPosition = Math.floor(Math.random() * totalVerses) + 1;

	for (const chapter of validChapters) {
		const verseCount = Number(chapter.verse_count);

		if (selectedPosition <= verseCount) {
			return {
				selection: {
					book: chapter.book,
					bookSlug: chapter.book_slug ?? chapter.canonical_book ?? chapter.book,
					...(chapter.canonical_book ? { canonicalBook: chapter.canonical_book } : {}),
					chapter: Number(chapter.chapter),
					verse: selectedPosition,
					totalVerses,
					...(chapter.api_path ? { chapterApiPath: chapter.api_path } : {}),
					...(chapter.source_path ? { chapterSourcePath: chapter.source_path } : {}),
				},
			};
		}

		selectedPosition -= verseCount;
	}

	return {
		error: 'ScriptureFlow random verse selection failed.',
	};
}

async function loadCatalog<T>(context: ILoadOptionsFunctions | IExecuteFunctions, path: string): Promise<T> {
	const requestOptions: IHttpRequestOptions = {
		method: 'GET',
		baseURL: API_BASE_URL,
		url: path,
		json: true,
	};

	return (await context.helpers.httpRequest(requestOptions)) as T;
}

function getCatalogPartPath(version: string, part: unknown): string | undefined {
	let partPath: unknown = part;

	if (isDataObject(part)) {
		partPath = part.path ?? part.url ?? part.href ?? part.api_path ?? part.file;
	}

	if (typeof partPath !== 'string' || partPath.trim() === '') {
		return undefined;
	}

	const trimmedPartPath = partPath.trim();

	if (trimmedPartPath.startsWith(API_BASE_URL)) {
		return new URL(trimmedPartPath).pathname;
	}

	if (trimmedPartPath.startsWith('http://') || trimmedPartPath.startsWith('https://')) {
		return undefined;
	}

	if (trimmedPartPath.startsWith('/')) {
		return trimmedPartPath;
	}

	return `/${encodeURIComponent(version)}/${trimmedPartPath.replace(/^\.?\//, '')}`;
}

function isDataObject(value: unknown): value is IDataObject {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeVerseObject(value: IDataObject, fallback: FreshRandomSelection): IDataObject {
	return {
		...value,
		version: typeof value.version === 'string' ? value.version : undefined,
		book: typeof value.book === 'string' ? value.book : fallback.book,
		book_slug: typeof value.book_slug === 'string' ? value.book_slug : fallback.bookSlug,
		...(typeof value.canonical_book === 'string' ? { canonical_book: value.canonical_book } : {}),
		chapter: typeof value.chapter === 'number' ? value.chapter : fallback.chapter,
		verse: typeof value.verse === 'number' ? value.verse : fallback.verse,
		reference:
			typeof value.reference === 'string' && value.reference.trim() !== ''
				? value.reference
				: `${typeof value.book === 'string' ? value.book : fallback.book} ${fallback.chapter}:${fallback.verse}`,
	};
}

function findVerseInValue(value: unknown, selectedVerse: number): IDataObject | undefined {
	if (Array.isArray(value)) {
		for (const item of value) {
			const found = findVerseInValue(item, selectedVerse);

			if (found) {
				return found;
			}
		}

		return undefined;
	}

	if (!isDataObject(value)) {
		return undefined;
	}

	const verse = Number(value.verse);
	const text = value.text;

	if (verse === selectedVerse && typeof text === 'string' && text.trim() !== '') {
		return value;
	}

	for (const child of Object.values(value)) {
		const found = findVerseInValue(child, selectedVerse);

		if (found) {
			return found;
		}
	}

	return undefined;
}

function buildFreshRandomResponse(
	version: string,
	selection: FreshRandomSelection,
	selectedVerse: IDataObject,
	lookupMethod: string,
): IDataObject {
	const result = normalizeVerseObject(
		{
			...selectedVerse,
			version,
		},
		selection,
	);
	const reference =
		typeof result.reference === 'string' && result.reference.trim() !== ''
			? result.reference
			: `${result.book} ${selection.chapter}:${selection.verse}`;

	return {
		ok: true,
		query: {
			version,
			book: selection.book,
			canonical_book: selection.canonicalBook ?? null,
			chapter: selection.chapter,
			verse: selection.verse,
		},
		reference,
		result,
		lookup: {
			method: lookupMethod,
		},
	};
}

function verseIndexEntryMatches(
	entry: IDataObject,
	version: string,
	book: string,
	chapter: number,
	verse: number,
): boolean {
	const normalizedBook = normalizeBibleIdentifier(book);

	return (
		entry.version === version &&
		[entry.book, entry.book_slug, entry.canonical_book].some(
			(bookValue) => normalizeBibleIdentifier(bookValue) === normalizedBook,
		) &&
		Number(entry.chapter) === chapter &&
		Number(entry.verse) === verse
	);
}

function findVerseIndexEntry(
	entries: unknown[],
	version: string,
	book: string,
	chapter: number,
	verse: number,
): IDataObject | undefined {
	return entries.find((entry) => isDataObject(entry) && verseIndexEntryMatches(entry, version, book, chapter, verse)) as
		| IDataObject
		| undefined;
}

function findVerseIndexRangeEntries(
	entries: unknown[],
	version: string,
	book: string,
	chapter: number,
	startVerse: number,
	endVerse: number,
): IDataObject[] {
	const normalizedBook = normalizeBibleIdentifier(book);

	return entries
		.filter((entry): entry is IDataObject => {
			if (!isDataObject(entry)) {
				return false;
			}

			const verse = Number(entry.verse);

			return (
				entry.version === version &&
				[entry.book, entry.book_slug, entry.canonical_book].some(
					(bookValue) => normalizeBibleIdentifier(bookValue) === normalizedBook,
				) &&
				Number(entry.chapter) === chapter &&
				verse >= startVerse &&
				verse <= endVerse
			);
		})
		.sort((a, b) => Number(a.verse) - Number(b.verse));
}

function buildStaticPassageResponse(
	version: string,
	book: string,
	chapter: number,
	verse: number,
	selectedVerse: IDataObject,
): IDataObject {
	const reference =
		typeof selectedVerse.reference === 'string' && selectedVerse.reference.trim() !== ''
			? selectedVerse.reference
			: `${typeof selectedVerse.book === 'string' ? selectedVerse.book : book} ${chapter}:${verse}`;

	return {
		ok: true,
		query: {
			version,
			book,
			canonical_book: selectedVerse.canonical_book ?? null,
			chapter,
			verse,
		},
		reference,
		result: selectedVerse,
		lookup: {
			method: 'static-index',
		},
	};
}

function buildStaticPassageRangeResponse(
	version: string,
	book: string,
	chapter: number,
	startVerse: number,
	endVerse: number,
	selectedVerses: IDataObject[],
): IDataObject {
	const firstVerse = selectedVerses[0];
	const reference = `${typeof firstVerse?.book === 'string' ? firstVerse.book : book} ${chapter}:${startVerse}-${endVerse}`;

	return {
		ok: true,
		query: {
			version,
			book,
			canonical_book: firstVerse?.canonical_book ?? null,
			chapter,
			verse: startVerse,
			end_verse: endVerse,
		},
		reference,
		result: selectedVerses,
		lookup: {
			method: 'static-index-range',
		},
	};
}

async function loadStaticVerseIndexChunks(
	context: IExecuteFunctions,
	version: string,
): Promise<unknown[][]> {
	const indexPath = `/${encodeURIComponent(version)}/verses-index.json`;
	const index = await loadCatalog<unknown>(context, indexPath);

	if (Array.isArray(index)) {
		return [index];
	}

	if (!isDataObject(index) || index.type !== 'split-index' || !Array.isArray(index.parts)) {
		throw new NodeOperationError(
			context.getNode(),
			`ScriptureFlow verses index for version "${version}" is not an array or split-index manifest.`,
		);
	}

	const chunks: unknown[][] = [];

	for (const part of index.parts) {
		const partPath = getCatalogPartPath(version, part);

		if (!partPath) {
			throw new NodeOperationError(
				context.getNode(),
				`ScriptureFlow split verses index for version "${version}" contains an unsupported part reference.`,
			);
		}

		let partData: unknown;

		try {
			partData = await loadCatalog<unknown>(context, partPath);
		} catch (error) {
			throw new NodeOperationError(
				context.getNode(),
				`ScriptureFlow split verses index part request failed for version "${version}" at "${partPath}". ${getErrorMessage(error)}`,
			);
		}

		if (!Array.isArray(partData)) {
			throw new NodeOperationError(
				context.getNode(),
				`ScriptureFlow split verses index part for version "${version}" at "${partPath}" did not return a verse array.`,
			);
		}

		chunks.push(partData);
	}

	return chunks;
}

async function loadStaticPassage(
	context: IExecuteFunctions,
	version: string,
	book: string,
	chapter: number,
	verse: number,
	endVerse?: number,
): Promise<IDataObject | undefined> {
	const chunks = await loadStaticVerseIndexChunks(context, version);

	if (!endVerse) {
		for (const chunk of chunks) {
			const selectedVerse = findVerseIndexEntry(chunk, version, book, chapter, verse);

			if (selectedVerse) {
				return buildStaticPassageResponse(version, book, chapter, verse, selectedVerse);
			}
		}

		return undefined;
	}

	const selectedVerses: IDataObject[] = [];
	const expectedCount = endVerse - verse + 1;

	for (const chunk of chunks) {
		selectedVerses.push(...findVerseIndexRangeEntries(chunk, version, book, chapter, verse, endVerse));

		if (selectedVerses.length >= expectedCount) {
			break;
		}
	}

	const orderedVerses = selectedVerses
		.filter((entry, index, entries) => entries.findIndex((candidate) => Number(candidate.verse) === Number(entry.verse)) === index)
		.sort((a, b) => Number(a.verse) - Number(b.verse));

	if (orderedVerses.length !== expectedCount) {
		return undefined;
	}

	return buildStaticPassageRangeResponse(version, book, chapter, verse, endVerse, orderedVerses);
}

async function loadFreshRandomVerseFromIndex(
	context: IExecuteFunctions,
	version: string,
	selection: FreshRandomSelection,
): Promise<IDataObject> {
	const versesIndex = await loadCatalog<unknown>(context, `/${encodeURIComponent(version)}/verses-index.json`);

	if (!Array.isArray(versesIndex)) {
		throw new NodeOperationError(
			context.getNode(),
			`ScriptureFlow verses index for version "${version}" is not a single-file verse array.`,
		);
	}

	const selectedVerse = versesIndex.find((entry) => {
		if (!isDataObject(entry)) {
			return false;
		}

		return (
			(entry.book_slug === selection.bookSlug ||
				(selection.canonicalBook && entry.canonical_book === selection.canonicalBook) ||
				entry.book === selection.book) &&
			Number(entry.chapter) === selection.chapter &&
			Number(entry.verse) === selection.verse
		);
	});

	if (!isDataObject(selectedVerse)) {
		throw new NodeOperationError(
			context.getNode(),
			`Could not find ${selection.bookSlug} ${selection.chapter}:${selection.verse} in ScriptureFlow verses index for version "${version}".`,
		);
	}

	return buildFreshRandomResponse(version, selection, selectedVerse, 'static-verses-index');
}

async function loadFreshRandomVerse(
	context: IExecuteFunctions,
	version: string,
	selection: FreshRandomSelection,
): Promise<{ response: IDataObject; lookupMethod: string }> {
	const chapterPath =
		selection.chapterApiPath ??
		`/${encodeURIComponent(version)}/books/${encodeURIComponent(selection.bookSlug)}/chapters/${selection.chapter}.json`;
	let chapterJson: unknown;

	try {
		chapterJson = await loadCatalog<unknown>(context, chapterPath);
	} catch {
		const response = await loadFreshRandomVerseFromIndex(context, version, selection);

		return {
			response,
			lookupMethod: 'static-verses-index',
		};
	}

	if (!Array.isArray(chapterJson) && !isDataObject(chapterJson)) {
		const response = await loadFreshRandomVerseFromIndex(context, version, selection);

		return {
			response,
			lookupMethod: 'static-verses-index',
		};
	}

	const selectedVerse = findVerseInValue(chapterJson, selection.verse);

	if (!selectedVerse) {
		throw new NodeOperationError(
			context.getNode(),
			`Could not find verse ${selection.verse} in static chapter JSON for ${selection.bookSlug} ${selection.chapter}.`,
		);
	}

	return {
		response: buildFreshRandomResponse(version, selection, selectedVerse, 'static-chapter'),
		lookupMethod: 'static-chapter',
	};
}

async function loadChapters(
	context: ILoadOptionsFunctions | IExecuteFunctions,
	version: string,
): Promise<ChapterEntry[]> {
	return await loadCatalog<ChapterEntry[]>(context, `/${encodeURIComponent(version)}/chapters.json`);
}

async function getChapterEntry(
	context: ILoadOptionsFunctions | IExecuteFunctions,
	version: string,
	book: string,
	chapter: number,
): Promise<ChapterEntry | undefined> {
	const chapters = await loadChapters(context, version);

	return chapters.find((entry) => matchesBook(entry, book) && Number(entry.chapter) === chapter);
}

export class Scriptureflow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ScriptureFlow',
		name: 'scriptureflow',
		icon: { light: 'file:scriptureflow-book.svg', dark: 'file:scriptureflow-book.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the ScriptureFlow API',
		defaults: {
			name: 'ScriptureFlow',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [],
		requestDefaults: {
			baseURL: 'https://scriptureflow-api-preview.pages.dev',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Book',
						value: 'book',
					},
					{
						name: 'Passage',
						value: 'passage',
					},
					{
						name: 'Random',
						value: 'random',
					},
					{
						name: 'Translation',
						value: 'translation',
					},
				],
				default: 'book',
			},
			...bookDescription,
			...passageDescription,
			...randomDescription,
			...translationDescription,
		],
	};

	methods = {
		loadOptions: {
			async getVersions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const translations = await loadCatalog<TranslationEntry[]>(this, '/translations.json');

				return translations
					.filter((translation) => translation.status === 'ready' && typeof translation.version === 'string')
					.map((translation) => {
						const languageCode = translation.language_code ?? 'unknown';
						const translationName = translation.translation_name ?? translation.version;

						return {
							name: `[${languageCode}] ${translationName} (${translation.version})`,
							value: translation.version,
						};
					});
			},

			async getBooks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const version = asString(this.getCurrentNodeParameter('version')) || 'en-kjv';
				const books = await loadCatalog<BookEntry[]>(this, `/${encodeURIComponent(version)}/books.json`);

				return books
					.filter((book) => typeof book.book === 'string')
					.map((book) => ({
						name: book.book,
						value: book.canonical_book ?? book.book_slug ?? book.book,
						description:
							typeof book.chapter_count === 'number' ? `${book.chapter_count} chapters` : undefined,
					}));
			},

			async getBooksWithAll(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const version = asString(this.getCurrentNodeParameter('version')) || 'en-kjv';
				const books = await loadCatalog<BookEntry[]>(this, `/${encodeURIComponent(version)}/books.json`);
				const options = books
					.filter((book) => typeof book.book === 'string')
					.map((book) => ({
						name: book.book,
						value: book.canonical_book ?? book.book_slug ?? book.book,
						description:
							typeof book.chapter_count === 'number' ? `${book.chapter_count} chapters` : undefined,
					}));

				return [
					{
						name: 'All Books',
						value: '',
						description: 'Return chapters for every book in this version',
					},
					...options,
				];
			},

			async getChapters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const version = asString(this.getCurrentNodeParameter('version')) || 'en-kjv';
				const book = asString(this.getCurrentNodeParameter('book')) || 'john';

				const chapters = await loadChapters(this, version);

				return chapters
					.filter((chapter) => matchesBook(chapter, book))
					.map((chapter) => ({
						name: getChapterLabel(Number(chapter.chapter)),
						value: Number(chapter.chapter),
						description: chapter.reference,
					}));
			},

			async getVerses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const version = asString(this.getCurrentNodeParameter('version')) || 'en-kjv';
				const book = asString(this.getCurrentNodeParameter('book')) || 'john';
				const chapter = asPositiveInteger(this.getCurrentNodeParameter('chapter')) || 3;
				const chapterEntry = await getChapterEntry(this, version, book, chapter);

				if (!chapterEntry) {
					return [];
				}

				return Array.from({ length: Number(chapterEntry.verse_count) }, (_, index) => {
					const verse = index + 1;

					return {
						name: getVerseLabel(verse),
						value: verse,
					};
				});
			},

			async getEndingVerses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const version = asString(this.getCurrentNodeParameter('version')) || 'en-kjv';
				const book = asString(this.getCurrentNodeParameter('book')) || 'john';
				const chapter = asPositiveInteger(this.getCurrentNodeParameter('chapter')) || 3;
				const startingVerse = asPositiveInteger(this.getCurrentNodeParameter('verse')) || 1;
				const chapterEntry = await getChapterEntry(this, version, book, chapter);

				if (!chapterEntry) {
					return [];
				}

				return Array.from({ length: Number(chapterEntry.verse_count) }, (_, index) => index + 1)
					.filter((verse) => verse >= startingVerse)
					.map((verse) => ({
						name: getVerseLabel(verse),
						value: verse,
					}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				if (resource === 'book' && operation === 'listBooks') {
					const version = this.getNodeParameter('version', itemIndex) as string;
					const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
					const outputFormat = (options.outputFormat ?? 'simplifiedList') as BookOutputFormat;
					const returnMode = (options.returnMode ?? 'items') as BookReturnMode;
					const includeSummary = Boolean(options.includeSummary);

					if (!version) {
						throw new NodeOperationError(this.getNode(), 'Version is required.', { itemIndex });
					}

					const booksPath = `/${encodeURIComponent(version)}/books.json`;
					const requestUrl = `${API_BASE_URL}${booksPath}`;
					let books: BookEntry[];

					try {
						books = await loadCatalog<BookEntry[]>(this, booksPath);
					} catch (error) {
						throw new NodeApiError(this.getNode(), error as JsonObject, {
							message: 'ScriptureFlow books catalog request failed',
							description: `Could not retrieve books for version "${version}" from ${requestUrl}.`,
							itemIndex,
						});
					}

					const outputBooks = outputFormat === 'simplifiedList' ? books.map(simplifyBook) : books;

					if (returnMode === 'list') {
						returnData.push({
							json: {
								...(includeSummary
									? {
											summary: {
												version,
												totalBooks: books.length,
												totalChapters: sumBookField(books, 'chapter_count'),
												totalVerses: sumBookField(books, 'verse_count'),
											},
										}
									: {}),
								books: outputBooks,
							},
							pairedItem: {
								item: itemIndex,
							},
						});
					} else {
						// In item mode, summary is intentionally omitted so each book stays easy to chain.
						returnData.push(
							...outputBooks.map((book) => ({
								json: book,
								pairedItem: {
									item: itemIndex,
								},
							})),
						);
					}

					continue;
				}

				if (resource === 'book' && operation === 'listChapters') {
					const version = this.getNodeParameter('version', itemIndex) as string;
					const book = this.getNodeParameter('book', itemIndex, '') as string;
					const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
					const outputFormat = (options.outputFormat ?? 'simplifiedList') as BookOutputFormat;
					const returnMode = (options.returnMode ?? 'items') as BookReturnMode;
					const includeSummary = Boolean(options.includeSummary);
					const maxResults = asNonNegativeInteger(options.maxResults);

					if (!version) {
						throw new NodeOperationError(this.getNode(), 'Version is required.', { itemIndex });
					}

					const chaptersPath = `/${encodeURIComponent(version)}/chapters.json`;
					const requestUrl = `${API_BASE_URL}${chaptersPath}`;
					let chapters: ChapterEntry[];

					try {
						chapters = await loadCatalog<ChapterEntry[]>(this, chaptersPath);
					} catch (error) {
						throw new NodeApiError(this.getNode(), error as JsonObject, {
							message: 'ScriptureFlow chapters catalog request failed',
							description: `Could not retrieve chapters for version "${version}" from ${requestUrl}.`,
							itemIndex,
						});
					}

					const filteredChapters = book ? chapters.filter((chapter) => matchesBook(chapter, book)) : chapters;
					const limitedChapters =
						maxResults > 0 ? filteredChapters.slice(0, maxResults) : filteredChapters;
					const outputChapters =
						outputFormat === 'simplifiedList' ? limitedChapters.map(simplifyChapter) : limitedChapters;

					if (returnMode === 'list') {
						returnData.push({
							json: {
								...(includeSummary
									? {
											summary: {
												version,
												book: book || 'all',
												totalChapters: limitedChapters.length,
												totalVerses: sumChapterVerses(limitedChapters),
											},
										}
									: {}),
								chapters: outputChapters,
							},
							pairedItem: {
								item: itemIndex,
							},
						});
					} else {
						// In item mode, summary is intentionally omitted so each chapter stays easy to chain.
						returnData.push(
							...outputChapters.map((chapter) => ({
								json: chapter,
								pairedItem: {
									item: itemIndex,
								},
							})),
						);
					}

					continue;
				}

				if (resource === 'translation' && operation === 'listTranslations') {
					const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
					const outputFormat = (options.outputFormat ?? 'rawJson') as TranslationOutputFormat;
					const returnMode = (options.returnMode ?? 'items') as TranslationReturnMode;
					const statusFilter = (options.statusFilter ?? 'all') as StatusFilter;
					const languageCodeFilter = asString(options.languageCodeFilter);
					const includeSummary = Boolean(options.includeSummary);
					const maxResults = asNonNegativeInteger(options.maxResults);

					const translations = await loadCatalog<TranslationEntry[]>(this, TRANSLATIONS_ENDPOINT);
					const filteredTranslations = filterTranslations(translations, statusFilter, languageCodeFilter);
					const limitedTranslations =
						maxResults > 0 ? filteredTranslations.slice(0, maxResults) : filteredTranslations;
					const outputTranslations =
						outputFormat === 'simplifiedList'
							? limitedTranslations.map(simplifyTranslation)
							: limitedTranslations;

					if (returnMode === 'list') {
						returnData.push({
							json: {
								...(includeSummary
									? {
											summary: {
												totalAvailable: translations.length,
												totalFiltered: filteredTranslations.length,
												totalReturned: outputTranslations.length,
												statusFilter,
												languageCodeFilter: languageCodeFilter.trim(),
											},
										}
									: {}),
								translations: outputTranslations,
							},
							pairedItem: {
								item: itemIndex,
							},
						});
					} else {
						// In item mode, summary is intentionally omitted so each translation stays easy to chain.
						returnData.push(
							...outputTranslations.map((translation) => ({
								json: translation,
								pairedItem: {
									item: itemIndex,
								},
							})),
						);
					}

					continue;
				}

				if (resource === 'random' && operation === 'getRandomVerse') {
					const version = this.getNodeParameter('version', itemIndex) as string;
					const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
					const outputFormat = (options.outputFormat ?? 'rawJson') as OutputFormat;
					const includeRequestMetadata = Boolean(options.includeRequestMetadata);
					const randomSource = (options.randomSource ?? 'fresh') as RandomSource;

					if (!version) {
						throw new NodeOperationError(this.getNode(), 'Version is required.', { itemIndex });
					}

					let response: IDataObject;
					let request: RandomRequestMetadata;

					if (randomSource === 'generated') {
						const randomPath = `/${encodeURIComponent(version)}/random.json`;
						const requestUrl = `${API_BASE_URL}${randomPath}`;

						request = {
							version,
							randomSource,
							requestUrl,
						};
						response = await loadCatalog<IDataObject>(this, randomPath);
					} else {
						const chaptersPath = `/${encodeURIComponent(version)}/chapters.json`;
						const chaptersUrl = `${API_BASE_URL}${chaptersPath}`;
						let chapters: ChapterEntry[];

						try {
							chapters = await loadCatalog<ChapterEntry[]>(this, chaptersPath);
						} catch (error) {
							throw new NodeApiError(this.getNode(), error as JsonObject, {
								message: 'ScriptureFlow random chapter catalog request failed',
								description: `Could not retrieve chapters for version "${version}" from ScriptureFlow.`,
								itemIndex,
							});
						}

						const selectionResult = selectFreshRandomVerse(chapters);

						if (!selectionResult.selection) {
							throw new NodeOperationError(
								this.getNode(),
								selectionResult.error ?? 'ScriptureFlow random verse selection failed.',
								{ itemIndex },
							);
						}

						const selection = selectionResult.selection;
						const chapterPath =
							selection.chapterApiPath ??
							`/${encodeURIComponent(version)}/books/${encodeURIComponent(selection.bookSlug)}/chapters/${selection.chapter}.json`;
						const chapterUrl = `${API_BASE_URL}${chapterPath}`;
						const verseIndexPath = `/${encodeURIComponent(version)}/verses-index.json`;
						const verseIndexUrl = `${API_BASE_URL}${verseIndexPath}`;
						let lookupMethod: string;

						try {
							const freshRandomVerse = await loadFreshRandomVerse(this, version, selection);

							response = freshRandomVerse.response;
							lookupMethod = freshRandomVerse.lookupMethod;
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`ScriptureFlow fresh random verse lookup failed for version "${version}", book slug "${selection.bookSlug}", chapter ${selection.chapter}, verse ${selection.verse}. Static chapter URL: ${chapterUrl}. ${getErrorMessage(error)}`,
								{ itemIndex },
							);
						}

						request = {
							version,
							randomSource,
							chaptersUrl,
							chapterUrl,
							...(lookupMethod === 'static-verses-index' ? { verseIndexUrl } : {}),
							requestUrl: lookupMethod === 'static-verses-index' ? verseIndexUrl : chapterUrl,
							selectedBook: selection.book,
							selectedBookSlug: selection.bookSlug,
							selectedChapter: selection.chapter,
							selectedVerse: selection.verse,
							totalVerses: selection.totalVerses,
							lookupMethod,
						};
					}

					const json = buildRandomOutput(response, request, outputFormat, includeRequestMetadata);

					returnData.push({
						json,
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}

				if (resource !== 'passage' || !['getVerse', 'getVerseRange'].includes(operation)) {
					throw new NodeOperationError(
						this.getNode(),
						'Only Book > List Books, Book > List Chapters, Passage > Get Verse, Passage > Get Verse Range, Random > Get Random Verse, and Translation > List Translations are implemented in this early ScriptureFlow node.',
						{ itemIndex },
					);
				}

				const referenceInputMode = this.getNodeParameter(
					'referenceInputMode',
					itemIndex,
					'guided',
				) as ReferenceInputMode;
				const version =
					referenceInputMode === 'manual'
						? (this.getNodeParameter('versionManual', itemIndex) as string)
						: (this.getNodeParameter('version', itemIndex) as string);
				const book =
					referenceInputMode === 'manual'
						? (this.getNodeParameter('bookManual', itemIndex) as string)
						: (this.getNodeParameter('book', itemIndex) as string);
				const chapter =
					referenceInputMode === 'manual'
						? asPositiveInteger(this.getNodeParameter('chapterManual', itemIndex))
						: asPositiveInteger(this.getNodeParameter('chapter', itemIndex));
				const verse =
					referenceInputMode === 'manual'
						? asPositiveInteger(this.getNodeParameter('verseManual', itemIndex))
						: asPositiveInteger(this.getNodeParameter('verse', itemIndex));
				const endVerse =
					operation === 'getVerseRange'
						? referenceInputMode === 'manual'
							? asPositiveInteger(this.getNodeParameter('endVerseManual', itemIndex))
							: asPositiveInteger(this.getNodeParameter('endVerse', itemIndex))
						: undefined;
				const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
				const outputFormat = (options.outputFormat ?? 'rawJson') as OutputFormat;
				const includeRequestMetadata = Boolean(options.includeRequestMetadata);
				const lookupMethod = (options.lookupMethod ?? 'staticIndex') as PassageLookupMethod;
				const unavailablePassageBehavior = (options.unavailablePassageBehavior ??
					'error') as UnavailablePassageBehavior;
				const indexPath = `/${encodeURIComponent(version)}/verses-index.json`;
				const indexUrl = `${API_BASE_URL}${indexPath}`;
				const validationData: PassageValidationData = {
					version,
					book,
					chapter,
					verse,
					...(endVerse ? { end_verse: endVerse } : {}),
					lookupMethod,
					indexUrl,
				};
				const handleUnavailablePassage = (message: string): boolean => {
					if (unavailablePassageBehavior === 'error') {
						throw new NodeOperationError(this.getNode(), message, { itemIndex });
					}

					returnData.push({
						json: buildUnavailablePassageItem(message, validationData),
						pairedItem: {
							item: itemIndex,
						},
					});

					return true;
				};

				if (!version && handleUnavailablePassage('Version is required.')) {
					continue;
				}

				if (!book && handleUnavailablePassage('Book is required.')) {
					continue;
				}

				if (!chapter && handleUnavailablePassage('Chapter must be a positive whole number.')) {
					continue;
				}

				if (!verse && handleUnavailablePassage('Verse must be a positive whole number.')) {
					continue;
				}

				if (
					operation === 'getVerseRange' &&
					!endVerse &&
					handleUnavailablePassage('Ending Verse must be a positive whole number.')
				) {
					continue;
				}

				if (
					endVerse &&
					endVerse < verse &&
					handleUnavailablePassage(
						'Ending Verse must be greater than or equal to Starting Verse. Reselect Ending Verse after changing Starting Verse.',
					)
				) {
					continue;
				}

				const queryParameters: Record<string, string> = {
					version,
					book,
					chapter: String(chapter),
					verse: String(verse),
				};

				if (endVerse) {
					queryParameters.end_verse = String(endVerse);
				}

				const requestUrl = `${API_BASE_URL}${VERSE_ENDPOINT}?${new URLSearchParams(queryParameters).toString()}`;

				if (lookupMethod === 'api') {
					validationData.requestUrl = requestUrl;
				}

				let chapterEntry: ChapterEntry | undefined;

				try {
					chapterEntry = await getChapterEntry(this, version, book, chapter);
				} catch (error) {
					if (unavailablePassageBehavior === 'returnErrorItem') {
						returnData.push({
							json: buildApiRequestFailedItem(error, validationData),
							pairedItem: {
								item: itemIndex,
							},
						});
						continue;
					}

					throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
				}

				if (
					!chapterEntry &&
					handleUnavailablePassage(
						`Chapter ${chapter} is not available for book "${book}" in version "${version}". Reselect Book and Chapter after changing Version or Book.`,
					)
				) {
					continue;
				}

				if (!chapterEntry) {
					throw new NodeOperationError(this.getNode(), 'Chapter validation failed.', { itemIndex });
				}

				const availableChapterEntry = chapterEntry;

				if (
					verse > Number(availableChapterEntry.verse_count) &&
					handleUnavailablePassage(
						`Verse ${verse} is not available for ${availableChapterEntry.book} ${chapter} in version "${version}". The chapter has ${availableChapterEntry.verse_count} verses. Reselect Verse after changing Version, Book, or Chapter.`,
					)
				) {
					continue;
				}

				if (
					endVerse &&
					endVerse > Number(availableChapterEntry.verse_count) &&
					handleUnavailablePassage(
						`Ending Verse ${endVerse} is not available for ${availableChapterEntry.book} ${chapter} in version "${version}". The chapter has ${availableChapterEntry.verse_count} verses. Reselect Ending Verse after changing Version, Book, Chapter, or Starting Verse.`,
					)
				) {
					continue;
				}

				const request: RequestMetadata = {
					version,
					book,
					chapter,
					verse,
					...(endVerse ? { end_verse: endVerse } : {}),
					lookupMethod,
					...(lookupMethod === 'staticIndex' ? { indexUrl } : {}),
					...(lookupMethod === 'api' ? { requestUrl } : {}),
				};

				let response: IDataObject;

				if (lookupMethod === 'staticIndex') {
					let staticResponse: IDataObject | undefined;

					try {
						staticResponse = await loadStaticPassage(this, version, book, chapter, verse, endVerse);
					} catch (error) {
						throw new NodeApiError(this.getNode(), error as JsonObject, {
							message: 'ScriptureFlow static verse index request failed',
							description: `Could not retrieve static verse index data for version "${version}" from ${indexUrl}.`,
							itemIndex,
						});
					}

					if (
						!staticResponse &&
						handleUnavailablePassage(
							`Passage ${book} ${chapter}:${verse}${endVerse ? `-${endVerse}` : ''} is not available in the static verse index for version "${version}".`,
						)
					) {
						continue;
					}

					if (!staticResponse) {
						throw new NodeOperationError(this.getNode(), 'Static passage lookup failed.', { itemIndex });
					}

					response = staticResponse;
					const json = buildOutput(response, request, outputFormat, includeRequestMetadata);

					returnData.push({
						json,
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}

				const requestOptions: IHttpRequestOptions = {
					method: 'GET',
					baseURL: API_BASE_URL,
					url: VERSE_ENDPOINT,
					qs: {
						version,
						book,
						chapter,
						verse,
						...(endVerse ? { end_verse: endVerse } : {}),
					},
					json: true,
				};

				try {
					response = (await this.helpers.httpRequest(requestOptions)) as IDataObject;
				} catch (error) {
					if (unavailablePassageBehavior === 'returnErrorItem') {
						returnData.push({
							json: buildApiRequestFailedItem(error, validationData),
							pairedItem: {
								item: itemIndex,
							},
						});
						continue;
					}

					throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
				}

				const json = buildOutput(response, request, outputFormat, includeRequestMetadata);

				returnData.push({
					json,
					pairedItem: {
						item: itemIndex,
					},
				});
			} catch (error) {
				const nodeError =
					error instanceof NodeOperationError
						? error
						: new NodeApiError(this.getNode(), error as JsonObject, {
								message: 'ScriptureFlow API request failed',
								description: 'Could not retrieve the requested data from ScriptureFlow.',
								itemIndex,
							});

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: nodeError.message,
						},
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}

				throw nodeError;
			}
		}

		return [returnData];
	}
}

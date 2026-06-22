import type { INodeProperties } from 'n8n-workflow';

const scriptureOperations = ['getVerse', 'getQuickVerse', 'getGeneratedVerseOfTheDay'];

export const scriptureDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['scripture'] } },
		options: [
			{
				name: 'Get Generated Verse of the Day',
				value: 'getGeneratedVerseOfTheDay',
				action: 'Get generated verse of the day',
				description:
					'Get the generated static Verse of the Day resource for a translation. This is separate from Quick Verse.',
			},
			{
				name: 'Get Quick Verse',
				value: 'getQuickVerse',
				action: 'Get a quick verse',
				description: 'Get a verse selected at request time. The result may differ between executions.',
			},
			{
				name: 'Get Verse',
				value: 'getVerse',
				action: 'Get a verse',
				description: 'Get one verse from the ScriptureFlow public API',
			},
		],
		default: 'getVerse',
	},
	{
		displayName: 'Version Key',
		name: 'version',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. en-kjv',
		description: 'Exact translation version key from the ScriptureFlow translation catalog',
		displayOptions: { show: { resource: ['scripture'], operation: scriptureOperations } },
	},
	{
		displayName: 'Book',
		name: 'book',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. John',
		description: 'Book name accepted by ScriptureFlow',
		displayOptions: { show: { resource: ['scripture'], operation: ['getVerse'] } },
	},
	{
		displayName: 'Chapter',
		name: 'chapter',
		type: 'number',
		required: true,
		default: 0,
		placeholder: 'e.g. 3',
		typeOptions: { minValue: 1 },
		description: 'Positive whole chapter number',
		displayOptions: { show: { resource: ['scripture'], operation: ['getVerse'] } },
	},
	{
		displayName: 'Verse',
		name: 'verse',
		type: 'number',
		required: true,
		default: 0,
		placeholder: 'e.g. 16',
		typeOptions: { minValue: 1 },
		description: 'Positive whole verse number',
		displayOptions: { show: { resource: ['scripture'], operation: ['getVerse'] } },
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: { show: { resource: ['scripture'], operation: scriptureOperations } },
		options: [
			{
				displayName: 'Simplify',
				name: 'simplify',
				type: 'boolean',
				default: false,
				description: 'Whether to return a simplified version of the response instead of the raw data',
			},
		],
	},
];

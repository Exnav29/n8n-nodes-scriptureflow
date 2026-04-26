import type { INodeProperties } from 'n8n-workflow';

export const passageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['passage'],
			},
		},
		options: [
			{
				name: 'Get Verse',
				value: 'getVerse',
				action: 'Get a verse',
				description: 'Recommended one-node path for retrieving a single verse from ScriptureFlow',
			},
			{
				name: 'Get Verse Range',
				value: 'getVerseRange',
				action: 'Get a verse range',
				description: 'Recommended one-node path for retrieving a same-chapter passage range from ScriptureFlow',
			},
		],
		default: 'getVerse',
	},
	{
		displayName: 'Reference Input Mode',
		name: 'referenceInputMode',
		type: 'options',
		noDataExpression: true,
		required: true,
		default: 'guided',
		description: 'Choose guided dropdowns for manual selection or plain fields for expressions and automation',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse', 'getVerseRange'],
			},
		},
		options: [
			{
				name: 'Guided Selection',
				value: 'guided',
				description: 'Best for one-node manual passage lookup using dropdowns',
			},
			{
				name: 'Manual / Expression',
				value: 'manual',
				description: 'Best when values come from forms, webhooks, sheets, or previous nodes',
			},
		],
	},
	{
		displayName: 'Version Name or ID',
		name: 'version',
		type: 'options',
		required: true,
		default: 'en-kjv',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsMethod: 'getVersions',
		},
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse', 'getVerseRange'],
				referenceInputMode: ['guided'],
			},
		},
	},
	{
		displayName: 'Book Name or ID',
		name: 'book',
		type: 'options',
		required: true,
		default: 'john',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsDependsOn: ['version'],
			loadOptionsMethod: 'getBooks',
		},
		hint: 'Reloads after Version changes. If an old selection remains visible, open this field and choose a valid book for the selected version.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse', 'getVerseRange'],
				referenceInputMode: ['guided'],
			},
		},
	},
	{
		displayName: 'Chapter Name or ID',
		name: 'chapter',
		type: 'options',
		required: true,
		default: 3,
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsDependsOn: ['version', 'book'],
			loadOptionsMethod: 'getChapters',
		},
		hint: 'Reloads after Version or Book changes. Reselect the chapter if you changed either parent field.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse', 'getVerseRange'],
				referenceInputMode: ['guided'],
			},
		},
	},
	{
		displayName: 'Verse Name or ID',
		name: 'verse',
		type: 'options',
		required: true,
		default: 16,
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsDependsOn: ['version', 'book', 'chapter'],
			loadOptionsMethod: 'getVerses',
		},
		hint: 'Reloads after Version, Book, or Chapter changes. Reselect the verse if you changed a parent field.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse'],
				referenceInputMode: ['guided'],
			},
		},
	},
	{
		displayName: 'Starting Verse Name or ID',
		name: 'verse',
		type: 'options',
		required: true,
		default: 16,
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsDependsOn: ['version', 'book', 'chapter'],
			loadOptionsMethod: 'getVerses',
		},
		hint: 'Reloads after Version, Book, or Chapter changes. Reselect the starting verse if you changed a parent field.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerseRange'],
				referenceInputMode: ['guided'],
			},
		},
	},
	{
		displayName: 'Ending Verse Name or ID',
		name: 'endVerse',
		type: 'options',
		required: true,
		default: 18,
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsDependsOn: ['version', 'book', 'chapter', 'verse'],
			loadOptionsMethod: 'getEndingVerses',
		},
		hint: 'Reloads after Version, Book, Chapter, or Starting Verse changes. Only valid ending verses are shown.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerseRange'],
				referenceInputMode: ['guided'],
			},
		},
	},
	{
		displayName: 'Version Name or ID',
		name: 'versionManual',
		type: 'string',
		required: true,
		default: 'en-kjv',
		description: 'Version ID such as en-kjv. Supports expressions.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse', 'getVerseRange'],
				referenceInputMode: ['manual'],
			},
		},
	},
	{
		displayName: 'Book Name or ID',
		name: 'bookManual',
		type: 'string',
		required: true,
		default: 'John',
		description:
			'Book name, canonical book, or slug accepted by ScriptureFlow, such as John, john, or 1-peter. Supports expressions.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse', 'getVerseRange'],
				referenceInputMode: ['manual'],
			},
		},
	},
	{
		displayName: 'Chapter',
		name: 'chapterManual',
		type: 'number',
		required: true,
		default: 3,
		description: 'Chapter number. Supports expressions.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse', 'getVerseRange'],
				referenceInputMode: ['manual'],
			},
		},
	},
	{
		displayName: 'Verse',
		name: 'verseManual',
		type: 'number',
		required: true,
		default: 16,
		description: 'Verse number. Supports expressions.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse'],
				referenceInputMode: ['manual'],
			},
		},
	},
	{
		displayName: 'Starting Verse',
		name: 'verseManual',
		type: 'number',
		required: true,
		default: 16,
		description: 'Starting verse number. Supports expressions.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerseRange'],
				referenceInputMode: ['manual'],
			},
		},
	},
	{
		displayName: 'Ending Verse',
		name: 'endVerseManual',
		type: 'number',
		required: true,
		default: 18,
		description: 'Ending verse number. Supports expressions.',
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerseRange'],
				referenceInputMode: ['manual'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				resource: ['passage'],
				operation: ['getVerse', 'getVerseRange'],
			},
		},
		options: [
			{
				displayName: 'Include Request Metadata',
				name: 'includeRequestMetadata',
				type: 'boolean',
				default: false,
				description: 'Whether to include the request parameters and API URL in the output',
			},
			{
				displayName: 'Lookup Method',
				name: 'lookupMethod',
				type: 'options',
				default: 'staticIndex',
				description:
					'Choose how ScriptureFlow retrieves passage data. Static Index First avoids Cloudflare Worker limits by using static JSON indexes.',
				options: [
					{
						name: 'API Endpoint',
						value: 'api',
					},
					{
						name: 'Static Index First',
						value: 'staticIndex',
					},
				],
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				default: 'rawJson',
				description: 'Choose how the ScriptureFlow response should be returned',
				options: [
					{
						name: 'Formatted Citation',
						value: 'formattedCitation',
					},
					{
						name: 'Plain Text',
						value: 'plainText',
					},
					{
						name: 'Raw JSON',
						value: 'rawJson',
					},
				],
			},
			{
				displayName: 'Unavailable Passage Behavior',
				name: 'unavailablePassageBehavior',
				type: 'options',
				default: 'error',
				description: 'Choose what to do when a selected passage is not available in the selected version',
				options: [
					{
						name: 'Error',
						value: 'error',
					},
					{
						name: 'Return Error Item',
						value: 'returnErrorItem',
					},
				],
			},
		],
	},
];

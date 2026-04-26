import type { INodeProperties } from 'n8n-workflow';

export const bookDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['book'],
			},
		},
		options: [
			{
				name: 'List Books',
				value: 'listBooks',
				action: 'List books',
				description: 'List books available in a selected ScriptureFlow version',
			},
			{
				name: 'List Chapters',
				value: 'listChapters',
				action: 'List chapters',
				description: 'List chapters available in a selected ScriptureFlow version, optionally filtered by book',
			},
		],
		default: 'listBooks',
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
				resource: ['book'],
				operation: ['listBooks', 'listChapters'],
			},
		},
	},
	{
		displayName: 'Book Name or ID',
		name: 'book',
		type: 'options',
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsDependsOn: ['version'],
			loadOptionsMethod: 'getBooksWithAll',
		},
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['listChapters'],
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
				resource: ['book'],
				operation: ['listBooks'],
			},
		},
		options: [
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				default: 'simplifiedList',
				description: 'Choose how the ScriptureFlow books catalog should be returned',
				options: [
					{
						name: 'Raw JSON',
						value: 'rawJson',
					},
					{
						name: 'Simplified List',
						value: 'simplifiedList',
					},
				],
			},
			{
				displayName: 'Return Mode',
				name: 'returnMode',
				type: 'options',
				default: 'items',
				description: 'Choose whether to return one n8n item per book or one item containing a books array',
				options: [
					{
						name: 'One Item Per Book',
						value: 'items',
					},
					{
						name: 'Single Item With List',
						value: 'list',
					},
				],
			},
			{
				displayName: 'Include Summary',
				name: 'includeSummary',
				type: 'boolean',
				default: false,
				description: 'Whether to include version, total book, chapter, and verse counts in list mode',
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				resource: ['book'],
				operation: ['listChapters'],
			},
		},
		options: [
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				default: 'simplifiedList',
				description: 'Choose how the ScriptureFlow chapters catalog should be returned',
				options: [
					{
						name: 'Raw JSON',
						value: 'rawJson',
					},
					{
						name: 'Simplified List',
						value: 'simplifiedList',
					},
				],
			},
			{
				displayName: 'Return Mode',
				name: 'returnMode',
				type: 'options',
				default: 'items',
				description: 'Choose whether to return one n8n item per chapter or one item containing a chapters array',
				options: [
					{
						name: 'One Item Per Chapter',
						value: 'items',
					},
					{
						name: 'Single Item With List',
						value: 'list',
					},
				],
			},
			{
				displayName: 'Include Summary',
				name: 'includeSummary',
				type: 'boolean',
				default: false,
				description: 'Whether to include version, book, total chapter, and verse counts in list mode',
			},
			{
				displayName: 'Maximum Results',
				name: 'maxResults',
				type: 'number',
				default: 0,
				description: 'Optional maximum number of chapters to return. Use 0 for no limit.',
			},
		],
	},
];

import type { INodeProperties } from 'n8n-workflow';

export const translationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['translation'],
			},
		},
		options: [
			{
				name: 'List Translations',
				value: 'listTranslations',
				action: 'List translations',
				description:
					'List many ScriptureFlow translations for discovery, comparison, audits, or bulk workflows. Downstream nodes run once per returned item.',
			},
		],
		default: 'listTranslations',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				resource: ['translation'],
				operation: ['listTranslations'],
			},
		},
		options: [
			{
				displayName: 'Include Summary',
				name: 'includeSummary',
				type: 'boolean',
				default: false,
				description: 'Whether to include a summary object with total count and filtered count',
			},
			{
				displayName: 'Language Code Filter',
				name: 'languageCodeFilter',
				type: 'string',
				default: '',
				placeholder: 'en',
				description: 'Optional language code filter, for example en',
			},
			{
				displayName: 'Maximum Results',
				name: 'maxResults',
				type: 'number',
				default: 0,
				description: 'Optional maximum number of translations to return. Use 0 for no limit.',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				default: 'rawJson',
				description: 'Choose how the ScriptureFlow translations should be returned',
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
				description: 'Choose whether translations should be returned as separate n8n items or one list item',
				options: [
					{
						name: 'One Item Per Translation',
						value: 'items',
					},
					{
						name: 'Single Item With List',
						value: 'list',
					},
				],
			},
			{
				displayName: 'Status Filter',
				name: 'statusFilter',
				type: 'options',
				default: 'all',
				description: 'Filter translations by catalog status',
				options: [
					{
						name: 'All',
						value: 'all',
					},
					{
						name: 'Ready',
						value: 'ready',
					},
					{
						name: 'Warning',
						value: 'warning',
					},
				],
			},
		],
	},
];

import type { INodeProperties } from 'n8n-workflow';

export const randomDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['random'],
			},
		},
		options: [
			{
				name: 'Get Random Verse',
				value: 'getRandomVerse',
				action: 'Get a random verse',
				description: 'Get a random verse from a selected ScriptureFlow version',
			},
		],
		default: 'getRandomVerse',
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
				resource: ['random'],
				operation: ['getRandomVerse'],
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
				resource: ['random'],
				operation: ['getRandomVerse'],
			},
		},
		options: [
			{
				displayName: 'Include Request Metadata',
				name: 'includeRequestMetadata',
				type: 'boolean',
				default: false,
				description: 'Whether to include version and request URL in the output',
			},
			{
				displayName: 'Random Source',
				name: 'randomSource',
				type: 'options',
				default: 'fresh',
				description: 'Choose whether to generate a fresh random verse or use ScriptureFlow generated random file',
				options: [
					{
						name: 'Current Generated Random Verse',
						value: 'generated',
					},
					{
						name: 'Fresh Random Verse',
						value: 'fresh',
					},
				],
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				default: 'rawJson',
				description: 'Choose how the random ScriptureFlow verse should be returned',
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
		],
	},
];

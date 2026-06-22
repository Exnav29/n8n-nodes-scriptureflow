import type { INodeProperties } from 'n8n-workflow';

export const translationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['translation'] } },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many translations',
				description: 'Get published translation keys and metadata from ScriptureFlow',
			},
		],
		default: 'getMany',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: { show: { resource: ['translation'], operation: ['getMany'] } },
		options: [
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				displayOptions: { show: { returnAll: [false] } },
				description: 'Max number of results to return',
			},
		],
	},
];

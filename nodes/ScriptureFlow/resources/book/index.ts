import type { INodeProperties } from 'n8n-workflow';

export const bookDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['book'] } },
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many books',
				description: 'Get books available in a ScriptureFlow translation',
			},
		],
		default: 'getMany',
	},
	{
		displayName: 'Version Key',
		name: 'version',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. en-kjv',
		description: 'Exact translation version key from the ScriptureFlow translation catalog',
		displayOptions: { show: { resource: ['book'], operation: ['getMany'] } },
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: { show: { resource: ['book'], operation: ['getMany'] } },
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

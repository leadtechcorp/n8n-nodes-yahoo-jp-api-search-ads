import { IExecuteFunctions } from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import axios from 'axios';

import FormData from 'form-data';

import { signRequestObject } from './GenericFunctions';

export class YahooJpAds implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Yahoo Japan Ads',
		name: 'yahooJpAds',
		icon: 'file:yahoo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"]}}',
		description: 'Operations on Yahoo! JAPAN Ads',
		defaults: {
			name: 'Yahoo Japan Ads',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'yahooJpAdsOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Upload Offline Conversion',
						value: 'uploadOfflineConversion',
					},
				],
				default: 'uploadOfflineConversion',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['uploadOfflineConversion'],
					},
				},
				default: '',
			},
			{
				displayName: 'Upload File Name',
				name: 'uploadFileName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['uploadOfflineConversion'],
					},
				},
				default: '',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				required: true,
				default: 'data',
				displayOptions: {
					show: {
						resource: ['uploadOfflineConversion'],
					},
				},
				description: 'Name of the binary property which contains the data for the file to be uploaded',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const item = this.getInputData()[0];
		const returnData: IDataObject[] = [];
		const BASE_URL = 'https://ads-search.yahooapis.jp/api/v8';

		try {
			const resource = this.getNodeParameter('resource', 0);

			if (resource === 'uploadOfflineConversion') {
				const qs: IDataObject = {
					accountId: this.getNodeParameter('accountId', 0) as string,
					uploadType: 'NEW',
					uploadFileName: this.getNodeParameter('uploadFileName', 0) as string,
				};

				// Convert to query string into a format the API can read
				const queryStringElements: string[] = [];
				for (const key of Object.keys(qs)) {
					queryStringElements.push(`${key}=${qs[key]}`);
				}

				const URL = `${BASE_URL}/OfflineConversionService/upload?${queryStringElements.join('&')}`;

				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;

				if (item.binary === undefined || item.binary[binaryPropertyName] === undefined) {
					throw new NodeOperationError(
						this.getNode(),
						`No binary data property "${binaryPropertyName}" does not exists on item!`,
					);
				}

				const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);

				const formData = new FormData();
				formData.append('file', binaryDataBuffer);

				const credentials = await this.getCredentials('yahooJpAdsOAuth2Api');

				const signedRequestObject = await signRequestObject(
					this,
					{ headers: formData.getHeaders() },
					credentials,
				);

				const response = await axios.post(URL, formData, signedRequestObject);

				returnData.push({ json: response.data });
			}
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ error: error.message });
			} else {
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}

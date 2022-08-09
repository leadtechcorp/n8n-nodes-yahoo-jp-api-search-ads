import { IExecuteFunctions } from 'n8n-core';
import { IDataObject, LoggerProxy as Logger, WorkflowOperationError } from 'n8n-workflow';

import clientOAuth2 from 'client-oauth2';

import { OptionsWithUri } from 'request';

type RequestObject = {
	headers: IDataObject
};

export async function signRequestObject(
	iExecuteFunctions: IExecuteFunctions,
	requestObject: RequestObject,
	credentials: IDataObject,
) {
	const oAuthClient = new clientOAuth2({
		clientId: credentials.clientId as string,
		clientSecret: credentials.clientSecret as string,
		accessTokenUri: credentials.accessTokenUrl as string,
		scopes: (credentials.scope as string).split(' '),
	});

	const oauthTokenData = credentials.oauthTokenData as clientOAuth2.Data;

	const token = oAuthClient.createToken(
		await getAccessToken(iExecuteFunctions, credentials),
		oauthTokenData.refreshToken,
		oauthTokenData.tokenType,
		oauthTokenData,
	);

	return token.sign(requestObject as clientOAuth2.RequestObject);
}

async function getAccessToken(
	iExecuteFunctions: IExecuteFunctions,
	credentials: IDataObject,
): Promise<string> {
	const BASE_URL = 'https://biz-oauth.yahoo.co.jp/oauth/v1/token';

	const oauthTokenData = credentials.oauthTokenData as clientOAuth2.Data;

	const qs: IDataObject = {
		grant_type: 'refresh_token',
		client_id: credentials.clientId as string,
		client_secret: credentials.clientSecret as string,
		refresh_token: oauthTokenData.refresh_token,
	};

	// Convert to query string into a format the API can read
	const queryStringElements: string[] = [];
	for (const key of Object.keys(qs)) {
		queryStringElements.push(`${key}=${qs[key]}`);
	}

	const options: OptionsWithUri = {
		uri: `${BASE_URL}?${queryStringElements.join('&')}`,
		json: true,
	};

	try {
		const response = await iExecuteFunctions.helpers.request!(options);

		return response.access_token;
	} catch (e) {
		console.log(e);
		throw new WorkflowOperationError('Failed to refresh Yahoo Jp token, please reconnect the app.');
	}
}

import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class YahooJpAdsOAuth2Api implements ICredentialType {
	name = 'yahooJpAdsOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Yahoo Jp Ads OAuth2 API';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://biz-oauth.yahoo.co.jp/oauth/v1/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://biz-oauth.yahoo.co.jp/oauth/v1/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'yahooads',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
	];
}

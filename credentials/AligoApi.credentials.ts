import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class AligoApi implements ICredentialType {
	name = 'aligoApi';
	displayName = 'Aligo API';
	documentationUrl = 'https://smartsms.aligo.in/admin/api/info.html';
	icon: Icon = 'file:../nodes/Aligo/aligo.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Aligo SMS API Key (발급받은 API 키)',
		},
		{
			displayName: 'User ID',
			name: 'userId',
			type: 'string',
			default: '',
			required: true,
			description: 'Aligo User ID (사용자 아이디)',
		},
	];
	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			baseURL: 'https://apis.aligo.in',
			url: '/remain/',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: 'key={{$credentials.apiKey}}&user_id={{$credentials.userId}}',
		},
	};
}

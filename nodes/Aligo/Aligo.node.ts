import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class Aligo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Aligo SMS',
		name: 'aligo',
		icon: 'file:aligo.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send SMS via Aligo API (알리고 문자 발송)',
		defaults: {
			name: 'Aligo SMS',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'aligoApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Cancel Reservation',
						value: 'cancel',
						description: '예약 발송 취소',
						action: 'Cancel reservation',
					},
					{
						name: 'Get Remaining Count',
						value: 'remain',
						description: '발송 가능 잔여 건수 조회',
						action: 'Get remaining count',
					},
					{
						name: 'Get Send Detail',
						value: 'smsList',
						description: '전송 결과 상세 조회',
						action: 'Get send detail',
					},
					{
						name: 'Get Send History',
						value: 'list',
						description: '전송 결과 목록 조회',
						action: 'Get send history',
					},
					{
						name: 'Send Bulk SMS',
						value: 'sendMass',
						description: '대량 문자 발송 (최대 500건)',
						action: 'Send bulk SMS',
					},
					{
						name: 'Send SMS',
						value: 'send',
						description: '문자 발송 (단건/다중 수신자)',
						action: 'Send SMS',
					},
				],
				default: 'send',
			},
			// Send SMS fields
			{
				displayName: 'Sender',
				name: 'sender',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['send', 'sendMass'],
					},
				},
				default: '',
				placeholder: '01012345678',
				description: '발신자 전화번호 (사전 등록 필요)',
			},
			{
				displayName: 'Receiver',
				name: 'receiver',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
				default: '',
				placeholder: '01098765432,01011112222',
				description: '수신자 전화번호 (쉼표로 구분, 최대 1,000명)',
			},
			{
				displayName: 'Message',
				name: 'msg',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
				default: '',
				description: '메시지 내용 (최대 2,000byte)',
			},
			// Send Bulk SMS fields
			{
				displayName: 'Message Type',
				name: 'msgType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						operation: ['sendMass'],
					},
				},
				options: [
					{ name: 'SMS (단문)', value: 'SMS' },
					{ name: 'LMS (장문)', value: 'LMS' },
					{ name: 'MMS (그림문자)', value: 'MMS' },
				],
				default: 'SMS',
				description: '메시지 유형',
			},
			{
				displayName: 'Recipients',
				name: 'recipients',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						operation: ['sendMass'],
					},
				},
				default:
					'[\n  {"receiver": "01012345678", "msg": "메시지1"},\n  {"receiver": "01087654321", "msg": "메시지2"}\n]',
				description: '수신자 목록 (JSON 배열: [{receiver, msg}, ...], 최대 500건)',
			},
			// Get Send Detail & Cancel fields
			{
				displayName: 'Message ID',
				name: 'mid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['smsList', 'cancel'],
					},
				},
				default: '',
				description: '메시지 고유 ID',
			},
			// Additional Fields for Send SMS
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['send'],
					},
				},
				options: [
					{
						displayName: 'Message Type',
						name: 'msg_type',
						type: 'options',
						options: [
							{ name: 'LMS (장문)', value: 'LMS' },
							{ name: 'MMS (그림문자)', value: 'MMS' },
							{ name: 'SMS (단문)', value: 'SMS' },
						],
						default: 'SMS',
						description: '메시지 유형 (90byte 초과 시 자동 LMS 전환)',
					},
					{
						displayName: 'Reservation Date',
						name: 'rdate',
						type: 'string',
						default: '',
						placeholder: 'YYYYMMDD',
						description: '예약 발송일 (현재일 이상)',
					},
					{
						displayName: 'Reservation Time',
						name: 'rtime',
						type: 'string',
						default: '',
						placeholder: 'HHMM',
						description: '예약 발송 시간 (현재 시간 기준 10분 이후)',
					},
					{
						displayName: 'Test Mode',
						name: 'testmode_yn',
						type: 'boolean',
						default: false,
						description: 'Whether to enable test mode (실제 발송하지 않음)',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: '문자 제목 (LMS/MMS만 해당, 최대 44byte)',
					},
				],
			},
			// Additional Fields for Send Bulk SMS
			{
				displayName: 'Additional Fields',
				name: 'additionalFieldsMass',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['sendMass'],
					},
				},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: '문자 제목 (LMS/MMS만 해당, 최대 44byte)',
					},
					{
						displayName: 'Reservation Date',
						name: 'rdate',
						type: 'string',
						default: '',
						placeholder: 'YYYYMMDD',
						description: '예약 발송일 (현재일 이상)',
					},
					{
						displayName: 'Reservation Time',
						name: 'rtime',
						type: 'string',
						default: '',
						placeholder: 'HHMM',
						description: '예약 발송 시간 (현재 시간 기준 10분 이후)',
					},
					{
						displayName: 'Test Mode',
						name: 'testmode_yn',
						type: 'boolean',
						default: false,
						description: 'Whether to enable test mode (실제 발송하지 않음)',
					},
				],
			},
			// Additional Fields for Get Send History
			{
				displayName: 'Additional Fields',
				name: 'additionalFieldsList',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: '페이지 번호',
					},
					{
						displayName: 'Page Size',
						name: 'page_size',
						type: 'number',
						default: 30,
						description: '페이지당 출력 갯수 (30~500)',
					},
					{
						displayName: 'Start Date',
						name: 'start_date',
						type: 'string',
						default: '',
						placeholder: 'YYYYMMDD',
						description: '조회 시작 일자',
					},
					{
						displayName: 'Limit Day',
						name: 'limit_day',
						type: 'string',
						default: '',
						placeholder: 'YYYYMMDD',
						description: '조회 마감 일자',
					},
				],
			},
			// Additional Fields for Get Send Detail
			{
				displayName: 'Additional Fields',
				name: 'additionalFieldsSmsList',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['smsList'],
					},
				},
				options: [
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: '페이지 번호',
					},
					{
						displayName: 'Page Size',
						name: 'page_size',
						type: 'number',
						default: 30,
						description: '페이지당 출력 갯수 (30~500)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('aligoApi');
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const baseUrl = 'https://apis.aligo.in';
				let endpoint = '';
				const formData: IDataObject = {
					key: credentials.apiKey as string,
					user_id: credentials.userId as string,
				};

				if (operation === 'send') {
					endpoint = '/send/';
					formData.sender = this.getNodeParameter('sender', i) as string;
					formData.receiver = this.getNodeParameter('receiver', i) as string;
					formData.msg = this.getNodeParameter('msg', i) as string;

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					if (additionalFields.msg_type) {
						formData.msg_type = additionalFields.msg_type;
					}
					if (additionalFields.title) {
						formData.title = additionalFields.title;
					}
					if (additionalFields.rdate) {
						formData.rdate = additionalFields.rdate;
					}
					if (additionalFields.rtime) {
						formData.rtime = additionalFields.rtime;
					}
					if (additionalFields.testmode_yn) {
						formData.testmode_yn = 'Y';
					}
				} else if (operation === 'sendMass') {
					endpoint = '/send_mass/';
					formData.sender = this.getNodeParameter('sender', i) as string;
					formData.msg_type = this.getNodeParameter('msgType', i) as string;

					const recipientsJson = this.getNodeParameter('recipients', i) as string;
					let recipients: Array<{ receiver: string; msg: string }>;

					try {
						recipients = JSON.parse(recipientsJson);
					} catch {
						throw new NodeOperationError(
							this.getNode(),
							'Recipients must be a valid JSON array',
							{ itemIndex: i },
						);
					}

					if (!Array.isArray(recipients) || recipients.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Recipients must be a non-empty array',
							{ itemIndex: i },
						);
					}

					if (recipients.length > 500) {
						throw new NodeOperationError(
							this.getNode(),
							'Maximum 500 recipients allowed',
							{ itemIndex: i },
						);
					}

					formData.cnt = recipients.length;

					recipients.forEach((recipient, index) => {
						const num = index + 1;
						formData[`rec_${num}`] = recipient.receiver;
						formData[`msg_${num}`] = recipient.msg;
					});

					const additionalFieldsMass = this.getNodeParameter(
						'additionalFieldsMass',
						i,
					) as IDataObject;

					if (additionalFieldsMass.title) {
						formData.title = additionalFieldsMass.title;
					}
					if (additionalFieldsMass.rdate) {
						formData.rdate = additionalFieldsMass.rdate;
					}
					if (additionalFieldsMass.rtime) {
						formData.rtime = additionalFieldsMass.rtime;
					}
					if (additionalFieldsMass.testmode_yn) {
						formData.testmode_yn = 'Y';
					}
				} else if (operation === 'list') {
					endpoint = '/list/';

					const additionalFieldsList = this.getNodeParameter(
						'additionalFieldsList',
						i,
					) as IDataObject;

					if (additionalFieldsList.page) {
						formData.page = additionalFieldsList.page;
					}
					if (additionalFieldsList.page_size) {
						formData.page_size = additionalFieldsList.page_size;
					}
					if (additionalFieldsList.start_date) {
						formData.start_date = additionalFieldsList.start_date;
					}
					if (additionalFieldsList.limit_day) {
						formData.limit_day = additionalFieldsList.limit_day;
					}
				} else if (operation === 'smsList') {
					endpoint = '/sms_list/';
					formData.mid = this.getNodeParameter('mid', i) as string;

					const additionalFieldsSmsList = this.getNodeParameter(
						'additionalFieldsSmsList',
						i,
					) as IDataObject;

					if (additionalFieldsSmsList.page) {
						formData.page = additionalFieldsSmsList.page;
					}
					if (additionalFieldsSmsList.page_size) {
						formData.page_size = additionalFieldsSmsList.page_size;
					}
				} else if (operation === 'remain') {
					endpoint = '/remain/';
				} else if (operation === 'cancel') {
					endpoint = '/cancel/';
					formData.mid = this.getNodeParameter('mid', i) as string;
				}

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}${endpoint}`,
					body: formData,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				});

				returnData.push({ json: response, pairedItem: i });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: i,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}

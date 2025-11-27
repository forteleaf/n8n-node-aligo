# n8n-nodes-aligo

[알리고(Aligo)](https://smartsms.aligo.in) SMS API를 n8n에서 사용할 수 있는 커뮤니티 노드입니다.

## 기능

- **문자 발송** - 단건/다중 수신자 문자 발송
- **대량 발송** - 최대 500건 동시 발송
- **전송 결과 조회** - 발송 내역 목록 조회
- **전송 상세 조회** - 특정 메시지 상세 결과 조회
- **잔여 건수 조회** - 발송 가능 건수 확인
- **예약 취소** - 예약 발송 취소

## 설치

### n8n 커뮤니티 노드로 설치

1. n8n의 **Settings** > **Community Nodes** 메뉴로 이동
2. **Install** 클릭
3. `n8n-nodes-aligo` 입력 후 설치

### 수동 설치

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-aligo
```

## 사전 준비

1. [알리고](https://smartsms.aligo.in) 회원가입
2. API Key 발급 (관리자 페이지에서 발급)
3. 발신번호 등록 (사전 등록된 번호만 발송 가능)
4. API 사용하는 IP 등록

## Credential 설정

| 항목 | 설명 |
|------|------|
| API Key | 알리고에서 발급받은 API 키 |
| User ID | 알리고 로그인 아이디 |

## 사용법

### 문자 발송 (Send SMS)

| 필드 | 필수 | 설명 |
|------|------|------|
| Sender | O | 발신자 전화번호 (사전 등록 필요) |
| Receiver | O | 수신자 전화번호 (쉼표로 구분, 최대 1,000명) |
| Message | O | 메시지 내용 (최대 2,000byte) |
| Message Type | X | SMS(단문) / LMS(장문) / MMS(그림문자) |
| Title | X | 문자 제목 (LMS/MMS만 해당) |
| Reservation Date | X | 예약일 (YYYYMMDD) |
| Reservation Time | X | 예약시간 (HHMM) |
| Test Mode | X | 테스트 모드 (실제 발송 안함) |

### 대량 발송 (Send Bulk SMS)

| 필드 | 필수 | 설명 |
|------|------|------|
| Sender | O | 발신자 전화번호 |
| Message Type | O | SMS / LMS / MMS |
| Recipients | O | JSON 배열 형식의 수신자 목록 (최대 500건) |

**Recipients 형식:**
```json
[
  {"receiver": "01012345678", "msg": "첫번째 메시지"},
  {"receiver": "01087654321", "msg": "두번째 메시지"}
]
```

### 전송 결과 조회 (Get Send History)

| 필드 | 필수 | 설명 |
|------|------|------|
| Page | X | 페이지 번호 (기본값: 1) |
| Page Size | X | 페이지당 출력 갯수 (30~500) |
| Start Date | X | 조회 시작일 (YYYYMMDD) |
| Limit Day | X | 조회 종료일 (YYYYMMDD) |

### 전송 상세 조회 (Get Send Detail)

| 필드 | 필수 | 설명 |
|------|------|------|
| Message ID | O | 메시지 고유 ID (발송 결과에서 확인) |

### 잔여 건수 조회 (Get Remaining Count)

추가 파라미터 없이 API 연결 확인 및 잔여 건수를 조회합니다.

### 예약 취소 (Cancel Reservation)

| 필드 | 필수 | 설명 |
|------|------|------|
| Message ID | O | 취소할 예약 메시지 ID |

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트
npm run lint
```

## 참고

- [알리고 SMS API 문서](https://smartsms.aligo.in/admin/api/info.html)
- [n8n 커뮤니티 노드 문서](https://docs.n8n.io/integrations/community-nodes/)

## 라이선스

MIT

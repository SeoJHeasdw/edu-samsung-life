# Evidence Ledger 스키마

근거를 JSON Lines 형식으로 저장한다. 한 줄은 하나의 주장과 하나의 출처 관계를 나타낸다.

## 필수 필드

```json
{
  "opportunity_id": "OPP-001",
  "claim_id": "OPP-001-C01",
  "claim": "검증할 수 있는 단일 주장",
  "source_title": "출처 제목",
  "source_url": "https://example.com/source",
  "source_type": "government",
  "published_at": "2026-01-15",
  "accessed_at": "2026-07-20",
  "stance": "support",
  "strength": 3,
  "notes": "정의, 단위, 범위 또는 제한사항"
}
```

## 허용값

`source_type`:

- `government`
- `regulatory_filing`
- `company_filing`
- `industry_association`
- `academic`
- `reputable_media`
- `paid_research`
- `internal`
- `mock` — 데모에서만 허용

`stance`:

- `support`
- `conflict`

`strength`:

- `1` — 간접·약한 근거
- `2` — 관련성이 명확한 근거
- `3` — 주장과 직접 연결되는 1차 또는 강한 근거

## 작성 규칙

- 한 레코드에 여러 주장을 섞지 않는다.
- 시장규모는 통화, 지역, 기준연도와 시장 정의를 `notes`에 기록한다.
- 성장률은 시작·종료연도와 명목·실질 기준을 기록한다.
- 규제는 관할, 시행일, 현재 상태를 기록한다.
- 기업 자료는 회사 주장인지 독립 검증인지 구분한다.
- 같은 보도자료를 재인용한 기사들은 독립 출처로 세지 않는다.
- 반대 근거가 없으면 `찾지 못함`과 `존재하지 않음`을 구분한다.
- 웹 자료는 URL과 접근일을 반드시 기록한다.

## 검증 기준

- 모든 기회 후보에 적어도 하나의 근거가 있어야 한다.
- `evidence_count`는 Ledger의 실제 레코드 수와 일치해야 한다.
- 잘못된 URL, 날짜, 허용되지 않은 유형은 오류다.
- 근거가 2개 미만이거나 반대 근거가 없으면 경고한다.
- 데모가 아닌 실제 조사에서 `mock` 출처는 오류로 취급한다.

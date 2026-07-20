---
name: discover-new-business-opportunities
description: 산업 신호를 스크리닝하고 밸류체인과 비즈니스 모델 후보를 구조화한 뒤, 시장성·적시성·전략적합성을 근거 기반으로 채점하고 심층검토 보고서를 만드는 워크플로우. 신사업 발굴, 섹터 스크리닝, 밸류체인 매핑, BM 채점, 시장·기업·규제 조사, 제휴·인수 후보 탐색, 팩트체크, 삼성생명 학습회 실습 또는 신사업 보고서 작성을 요청할 때 사용한다. 공개·내부 데이터를 연결한 실제 조사와 번들 mock data를 이용한 안전한 워크숍 데모를 모두 지원한다.
---

# 신사업 기회 발굴

반복 조사와 점수 계산은 자동화하고, 문제 정의·평가기준·최종 의사결정은 사람에게 남긴다.

## 시작 전에

1. `references/methodology.md`를 읽어 점수 기준과 Human Gate를 적용한다.
2. 근거를 새로 수집하거나 검증할 때 `references/evidence-schema.md`를 읽는다.
3. 요청이 `학습회`, `3교시`, `4교시`, `워크숍`이면 `references/workshop-methodology.md`를 추가로 읽는다.
4. 요청이 `데모`, `mock`, `샘플`이면 번들 데이터를 사용한다. 그 외에는 실제 조사 모드로 취급한다.
5. 결과 디렉터리를 정한다. 사용자가 지정하지 않으면 임시 디렉터리를 사용한다.
6. 아래 명령의 `<skill-dir>`를 이 `SKILL.md`가 있는 절대 경로로 바꾼다.

## 모드

### 학습회 워크숍 모드

- `references/workshop-methodology.md`의 3·4교시 운영 방식을 따른다.
- `assets/workshop-sector-scorecard.csv`와 `assets/workshop-bm-scorecard.csv`만 사용한다.
- 가상의 생명보험사와 교육용 점수임을 모든 결과에 표시한다.
- 섹터 7개 기준 100점 합산과 BM 3축 9점 합산을 모델이 아닌 스크립트로 수행한다.
- 참가자가 평가기준 하나와 Human Gate 하나를 바꾸고 전후 결과를 비교하게 한다.
- 제공 PDF의 block 영역, 실제 shortlist, 실제 내부 점수 또는 대외비 내용을 추정하지 않는다.

### 데모 모드

- `assets/demo-company-brief.md`, `assets/demo-opportunities.csv`, `assets/demo-evidence.jsonl`만 사용한다.
- 모든 결과 상단에 `MOCK DATA — 실제 의사결정에 사용 금지`를 표시한다.
- Human Gate는 생략하지 말고 `데모 기본값으로 통과`라고 기록한다.
- 인터넷 검색이나 외부 시스템 쓰기 작업을 하지 않는다.

### 실제 조사 모드

- 분석 기준일, 지역, 기간, 회사 역량, 예산, 제외 영역을 먼저 확정한다.
- 누락된 조건은 합리적으로 가정할 수 있지만, 결과에 가정을 명시한다.
- 현재 시장·기업·규제 정보는 검색 또는 연결된 도구로 확인한다.
- 공식 통계·공시·규제기관 자료를 우선하고 모든 수치에 출처와 기준일을 연결한다.
- 내부 역량과 고객 접근성 자료가 없으면 전략적합성을 `잠정`으로 표시한다.

## 워크플로우

### 1. 섹터 스크리닝

- 문제 정의와 기업 역량을 한 문단으로 정리한다.
- 조사 모집단과 출처 목록을 먼저 고정한다. 검색 결과를 모집단으로 간주하지 않는다.
- 산업 신호를 수집하고 중복 후보를 통합한다.
- 후보별 기회 신호, 반대 신호, 데이터 공백을 기록한다.
- **Human Gate 1:** 조사 범위와 심층 분석할 섹터를 승인받는다. 데모에서는 기본값을 사용한다.

### 2. 밸류체인과 BM 후보 구성

- 각 섹터를 투입물, 핵심기술, 생산, 유통, 서비스, 고객, 회수·재활용 단계로 분해한다.
- 회사가 수익을 얻는 단위로 BM 후보를 작성한다. 기술명만으로 BM을 만들지 않는다.
- BM마다 고객, 지불자, 수익모델, 가치제안, 필요한 역량을 명시한다.
- `references/methodology.md`의 1–5점 루브릭으로 입력 점수를 작성한다.
- **Human Gate 2:** 평가 기준, 가중치와 1차 후보를 승인받는다.

### 3. 결정론적 채점

다음 스크립트로 점수와 순위를 계산한다. 모델이 암산으로 순위를 정하지 않는다.

```bash
python3 <skill-dir>/scripts/score_opportunities.py <opportunities.csv> \
  --out-json <ranked-opportunities.json> \
  --out-md <scorecard.md> \
  --mode live \
  --top 5
```

- 시장성, 적시성, 전략적합성 점수와 근거 신뢰도를 함께 제시한다.
- 근거가 부족한 후보를 낮은 점수라고 단정하지 말고 `근거 부족`으로 분리한다.
- 가중치를 바꾸면 변경 이유와 순위 민감도를 기록한다.

### 4. 근거 기반 심층조사

- 상위 후보마다 시장, 기업, 규제, 경쟁, 제휴·인수 후보를 조사한다.
- 주장 단위로 `references/evidence-schema.md` 형식의 JSONL 근거를 만든다.
- 출처가 없는 숫자, 출처가 서로 다른 시장규모 숫자의 단순 혼합, 확인되지 않은 M&A 가능성을 금지한다.
- 제휴·인수 후보는 `실사 후보`로만 표현한다.
- **Human Gate 3:** 가정, 누락, 반대 근거와 중대한 리스크를 검토한다.

### 5. 근거 검증과 보고서

```bash
python3 <skill-dir>/scripts/validate_evidence.py <opportunities.csv> <evidence.jsonl> \
  --live \
  --out <evidence-validation.json>
```

- 검증 오류를 해결한 뒤 보고서를 작성한다.
- 각 추천을 `추진`, `추가 검증`, `보류` 중 하나로 분류한다.
- 점수, 신뢰도, 핵심 근거, 반대 근거, 미확인 가정, 다음 검증 행동을 함께 제시한다.
- **Human Gate 4:** 투자·제휴·보류의 최종 결정은 사용자에게 남긴다.

## 출력 계약

최소한 다음 결과를 제공한다.

- 범위와 가정
- 섹터 후보와 밸류체인
- BM Scorecard 및 순위
- Evidence Ledger 검증 결과
- 상위 후보 Deep-dive
- 반대 근거와 데이터 공백
- 다음 30일 검증 행동
- Human Gate별 결정 기록

## Guardrails

- mock 데이터를 실제 조사 결과처럼 표현하지 않는다.
- 제공된 학습회 자료의 block 영역이나 대외비 내용을 추정·복원·재배포하지 않는다.
- 근거 없는 시장규모, 성장률, 기업 매출 또는 규제 내용을 생성하지 않는다.
- `검증된 사실`, `출처 기반 추론`, `내부 가정`을 구분한다.
- 로그인·유료벽·로봇 차단을 우회하지 않는다.
- 기밀 내부 데이터는 사용자가 지정한 범위 밖으로 복사하거나 공개하지 않는다.
- 보고서를 투자·법률·회계 자문으로 표현하지 않는다.
- 이메일 발송, CRM 수정, 파일 공개, 외부 배포는 명시적인 사용자 요청과 승인 없이 수행하지 않는다.

## 학습회 빠른 실습

```bash
python3 <skill-dir>/scripts/run_workshop_demo.py \
  <skill-dir>/assets/workshop-sector-scorecard.csv \
  <skill-dir>/assets/workshop-bm-scorecard.csv \
  --out-json /tmp/new-business-workshop/workshop-result.json \
  --out-md /tmp/new-business-workshop/workshop-report.md \
  --sector-top 5 \
  --bm-threshold 8
```

완료 후 다음을 보여준다.

- Sector Short-list 5개와 7개 기준 점수
- Short-list 섹터의 BM 순위와 시장성·적시성·적합성
- 근거 신뢰도가 낮은 후보
- 네 개 Human Gate 체크리스트
- 참가자가 바꿀 평가기준과 재실행 명령

## 빠른 데모

```bash
python3 <skill-dir>/scripts/score_opportunities.py \
  <skill-dir>/assets/demo-opportunities.csv \
  --out-json /tmp/new-business-demo/ranked-opportunities.json \
  --out-md /tmp/new-business-demo/scorecard.md \
  --mode demo \
  --top 5

python3 <skill-dir>/scripts/validate_evidence.py \
  <skill-dir>/assets/demo-opportunities.csv \
  <skill-dir>/assets/demo-evidence.jsonl \
  --out /tmp/new-business-demo/evidence-validation.json
```

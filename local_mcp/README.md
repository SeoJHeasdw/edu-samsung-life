# 맥 비서 — 강의 시연용 로컬 MCP 서버

Claude Desktop이 강사 맥에서 직접 일하게 만드는 데모. 전부 로컬 동작이라 **교육장 네트워크가 죽어도 돌아간다** (4교시 플랜 B 겸용).

## 도구 5개

| 도구 | 하는 일 | 우와 포인트 |
|---|---|---|
| `speak` | 스피커로 한국어(Yuna) 음성 출력 | 강의장 전체가 듣는다 |
| `notify` | macOS 알림 배너 + 사운드 | 화면이 물리적으로 반응 |
| `add_reminder` | 미리알림 앱에 할 일 등록 | 실제 앱에 데이터가 생긴다 |
| `search_products` | 가상 보험상품 DB 검색 (읽기 전용) | "사내 시스템 연결" 스토리 |
| `get_product` | 상품 상세 조회 (읽기 전용) | 〃 |

## 설치 (완료됨)

`~/Library/Application Support/Claude/claude_desktop_config.json`에 등록되어 있음 (백업: 같은 위치 `.bak-mcp`). **Claude Desktop을 완전 종료 후 재시작하면 활성화.**

```json
"mac-secretary": {
  "command": "/opt/homebrew/bin/uv",
  "args": ["run", "--script", "/Users/jaehoseo/Desktop/vswrk/edu/samsung_life/local_mcp/mac_secretary.py"]
}
```

## 시연용 프롬프트 (추천 순서)

1. 워밍업: **"맥 비서로 인사말을 소리 내어 말해줘."** → 맥이 말한다. 첫 우와.
2. 본 시연 (도구 4개 콤보):
   > "우리 상품 DB에서 종신보험을 찾아서 40대 가장 관점으로 두 상품을 비교해줘. 비교가 끝나면 결론 한 문장을 소리 내어 읽어주고, 화면에 완료 알림을 띄우고, '비교 결과 팀장 보고'를 미리알림에 등록해줘."
3. 청중 멘트: "방금 AI가 사내 DB를 조회하고, 보고하고, 후속 일정까지 잡았습니다. 이 '창구'가 Connector입니다. 여러분 회사 시스템에도 이렇게 창구를 만들 수 있습니다."

## 강의 전 확인

- [ ] Claude Desktop 재시작 후 설정 → Connectors에 mac-secretary 표시 확인
- [ ] 스피커 볼륨 / 방해금지 모드 해제 (알림 배너 안 뜨는 주범)
- [ ] 미리알림 자동화 권한은 이미 승인됨 (터미널 기준) — Claude Desktop에서 첫 실행 시 한 번 더 물을 수 있으니 리허설에서 승인
- [ ] 미리알림 앱의 "[테스트] 맥 비서 MCP 동작 확인" 항목 삭제

## 데이터

`data/products.json` — 전부 가상 상품 6종 (실존 회사·상품과 무관, 응답에도 "가상 데이터" 표기가 붙음).

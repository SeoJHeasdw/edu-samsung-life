# /// script
# requires-python = ">=3.11"
# dependencies = ["mcp"]
# ///
"""맥 비서 — 강의 시연용 로컬 MCP 서버.

Claude Desktop이 이 서버를 통해 강사 맥에서 할 수 있는 일:
  - speak            : 스피커로 소리 내어 말하기 (한국어 Yuna)
  - notify           : macOS 알림 배너 띄우기
  - add_reminder     : 미리알림 앱에 할 일 등록
  - search_products  : 가상 보험상품 DB 검색 (읽기 전용)
  - get_product      : 가상 보험상품 상세 조회 (읽기 전용)

전부 로컬에서 동작하므로 네트워크가 없어도 시연 가능하다.
"""

import json
import subprocess
from pathlib import Path

from mcp.server.fastmcp import FastMCP

DATA_PATH = Path(__file__).parent / "data" / "products.json"

mcp = FastMCP("mac-secretary")


def _load_products() -> list[dict]:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))["products"]


def _osascript(script: str) -> str:
    result = subprocess.run(
        ["osascript", "-e", script],
        capture_output=True, text=True, timeout=15,
    )
    if result.returncode != 0:
        return f"실패: {result.stderr.strip()}"
    return "완료"


@mcp.tool()
def speak(text: str) -> str:
    """주어진 한국어 문장을 이 컴퓨터의 스피커로 소리 내어 말한다.

    결과 보고, 인사, 요약 낭독 등에 사용. 2~3문장 이내로 짧게.
    """
    subprocess.Popen(["say", "-v", "Yuna", text])
    return f"스피커로 말하는 중: {text}"


@mcp.tool()
def notify(title: str, message: str) -> str:
    """macOS 화면 우상단에 알림 배너를 띄운다. 작업 완료 보고 등에 사용."""
    title_q = title.replace('"', '\\"')
    message_q = message.replace('"', '\\"')
    return _osascript(
        f'display notification "{message_q}" with title "{title_q}" sound name "Glass"'
    )


@mcp.tool()
def add_reminder(title: str, notes: str = "") -> str:
    """macOS 미리알림(Reminders) 앱에 새 할 일을 등록한다."""
    title_q = title.replace('"', '\\"')
    notes_q = notes.replace('"', '\\"')
    status = _osascript(
        f'tell application "Reminders" to make new reminder '
        f'with properties {{name:"{title_q}", body:"{notes_q}"}}'
    )
    if status == "완료":
        return f"미리알림에 등록됨: {title}"
    return status


@mcp.tool()
def search_products(query: str = "", category: str = "") -> str:
    """가상 보험상품 DB를 검색한다 (읽기 전용).

    query: 상품명/보장내용/대상에서 찾을 키워드 (비우면 전체).
    category: 종신보험 / 정기보험 / 건강보험 / 연금보험 / 저축보험 중 하나 (선택).
    """
    rows = _load_products()
    if category:
        rows = [p for p in rows if p["category"] == category]
    if query:
        rows = [
            p for p in rows
            if query in p["name"] or query in p["coverage"] or query in p["target"]
            or query in p["category"]
        ]
    if not rows:
        return "조건에 맞는 상품이 없습니다."
    lines = [
        f'- [{p["id"]}] {p["name"]} ({p["category"]}) — 월 {p["monthly_premium_krw"]:,}원'
        for p in rows
    ]
    return "※ 강의용 가상 데이터\n" + "\n".join(lines)


@mcp.tool()
def get_product(product_id: str) -> str:
    """상품 ID로 가상 보험상품의 상세 정보를 조회한다 (읽기 전용)."""
    for p in _load_products():
        if p["id"] == product_id:
            return "※ 강의용 가상 데이터\n" + json.dumps(p, ensure_ascii=False, indent=2)
    return f"상품 ID {product_id}를 찾을 수 없습니다."


if __name__ == "__main__":
    mcp.run()

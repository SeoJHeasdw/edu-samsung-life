#!/usr/bin/env python3
import argparse
import csv
import json
from pathlib import Path


SCORE_FIELDS = (
    "market_size",
    "market_growth",
    "margin_potential",
    "adoption_urgency",
    "regulatory_tailwind",
    "maturity_window",
    "capability_fit",
    "customer_access",
    "execution_feasibility",
    "evidence_quality",
)

REQUIRED_FIELDS = {
    "opportunity_id",
    "sector",
    "value_chain_stage",
    "business_model",
    "evidence_count",
    "notes",
    *SCORE_FIELDS,
}


def bounded_score(row, field, row_number):
    try:
        value = int(row[field])
    except (TypeError, ValueError) as exc:
        raise ValueError(f"row {row_number}: {field} must be an integer") from exc
    if not 1 <= value <= 5:
        raise ValueError(f"row {row_number}: {field} must be between 1 and 5")
    return value


def parse_rows(csv_path):
    with open(csv_path, encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fields = set(reader.fieldnames or [])
        missing = sorted(REQUIRED_FIELDS - fields)
        if missing:
            raise ValueError(f"missing CSV columns: {', '.join(missing)}")

        rows = []
        seen_ids = set()
        for row_number, row in enumerate(reader, start=2):
            opportunity_id = row["opportunity_id"].strip()
            if not opportunity_id:
                raise ValueError(f"row {row_number}: opportunity_id is empty")
            if opportunity_id in seen_ids:
                raise ValueError(f"row {row_number}: duplicate opportunity_id {opportunity_id}")
            seen_ids.add(opportunity_id)

            scores = {field: bounded_score(row, field, row_number) for field in SCORE_FIELDS}
            try:
                evidence_count = int(row["evidence_count"])
            except ValueError as exc:
                raise ValueError(f"row {row_number}: evidence_count must be an integer") from exc
            if evidence_count < 0:
                raise ValueError(f"row {row_number}: evidence_count must be non-negative")

            market = round(
                scores["market_size"] * 0.35
                + scores["market_growth"] * 0.40
                + scores["margin_potential"] * 0.25,
                2,
            )
            timing = round(
                scores["adoption_urgency"] * 0.45
                + scores["regulatory_tailwind"] * 0.30
                + scores["maturity_window"] * 0.25,
                2,
            )
            strategic_fit = round(
                scores["capability_fit"] * 0.40
                + scores["customer_access"] * 0.30
                + scores["execution_feasibility"] * 0.30,
                2,
            )

            rows.append(
                {
                    "opportunity_id": opportunity_id,
                    "sector": row["sector"].strip(),
                    "value_chain_stage": row["value_chain_stage"].strip(),
                    "business_model": row["business_model"].strip(),
                    "market_score": market,
                    "timing_score": timing,
                    "strategic_fit_score": strategic_fit,
                    "evidence_count": evidence_count,
                    "evidence_quality": scores["evidence_quality"],
                    "notes": row["notes"].strip(),
                }
            )
    if not rows:
        raise ValueError("CSV has no opportunity rows")
    return rows


def confidence_label(evidence_count, evidence_quality):
    if evidence_count >= 4 and evidence_quality >= 4:
        return "높음"
    if evidence_count >= 2 and evidence_quality >= 3:
        return "중간"
    return "낮음"


def rank_rows(rows, market_weight, timing_weight, fit_weight):
    total_weight = market_weight + timing_weight + fit_weight
    if abs(total_weight - 1.0) > 1e-9:
        raise ValueError("market, timing, and fit weights must sum to 1.0")

    ranked = []
    for row in rows:
        result = dict(row)
        result["total_score"] = round(
            row["market_score"] * market_weight
            + row["timing_score"] * timing_weight
            + row["strategic_fit_score"] * fit_weight,
            2,
        )
        result["confidence"] = confidence_label(row["evidence_count"], row["evidence_quality"])
        ranked.append(result)

    ranked.sort(key=lambda item: (-item["total_score"], item["opportunity_id"]))
    for rank, row in enumerate(ranked, start=1):
        row["rank"] = rank
    return ranked


def sector_summary(ranked):
    grouped = {}
    for row in ranked:
        group = grouped.setdefault(row["sector"], [])
        group.append(row["total_score"])
    return [
        {
            "sector": sector,
            "opportunity_count": len(scores),
            "average_score": round(sum(scores) / len(scores), 2),
            "best_score": max(scores),
        }
        for sector, scores in sorted(
            grouped.items(), key=lambda item: (-max(item[1]), item[0])
        )
    ]


def markdown_report(result, top):
    is_demo = result["mode"] == "demo"
    lines = [
        "# MOCK DATA — 신사업 기회 Scorecard" if is_demo else "# 신사업 기회 Scorecard",
        "",
    ]
    if is_demo:
        lines.extend(
            [
                "> 실제 시장조사나 투자 의사결정에 사용할 수 없는 데모 결과입니다.",
                "",
            ]
        )
    lines.extend(
        [
            "## 가중치",
            "",
            f"- 시장성: {result['weights']['market']:.0%}",
            f"- 적시성: {result['weights']['timing']:.0%}",
            f"- 전략적합성: {result['weights']['strategic_fit']:.0%}",
            "",
            f"## 상위 {min(top, len(result['rankings']))}개 BM",
            "",
            "| 순위 | 섹터 | BM | 시장성 | 적시성 | 전략적합성 | 총점 | 근거 신뢰도 |",
            "|---:|---|---|---:|---:|---:|---:|---|",
        ]
    )
    for row in result["rankings"][:top]:
        lines.append(
            f"| {row['rank']} | {row['sector']} | {row['business_model']} | "
            f"{row['market_score']:.2f} | {row['timing_score']:.2f} | "
            f"{row['strategic_fit_score']:.2f} | {row['total_score']:.2f} | "
            f"{row['confidence']} |"
        )
    gate_lines = (
        [
            "- Gate 1: 데모 기본 조사범위 사용",
            "- Gate 2: 기본 가중치 사용",
            "- Gate 3: mock 근거의 누락과 반대근거 검토 필요",
            "- Gate 4: 실제 투자 결정이 아닌 추가 검증 후보만 선정",
        ]
        if is_demo
        else [
            "- Gate 1: 조사 범위 승인 기록을 첨부할 것",
            "- Gate 2: 평가 기준과 가중치 승인 기록을 첨부할 것",
            "- Gate 3: Evidence Ledger 검증을 별도로 통과할 것",
            "- Gate 4: 최종 투자·제휴·보류 결정은 사람이 수행할 것",
        ]
    )
    lines.extend(["", "## HITL", "", *gate_lines, ""])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Score business opportunities deterministically.")
    parser.add_argument("csv_path")
    parser.add_argument("--out-json", required=True)
    parser.add_argument("--out-md", required=True)
    parser.add_argument("--mode", choices=("demo", "live"), default="live")
    parser.add_argument("--top", type=int, default=5)
    parser.add_argument("--market-weight", type=float, default=0.40)
    parser.add_argument("--timing-weight", type=float, default=0.25)
    parser.add_argument("--fit-weight", type=float, default=0.35)
    args = parser.parse_args()

    if args.top < 1:
        raise SystemExit("--top must be at least 1")

    rows = parse_rows(args.csv_path)
    rankings = rank_rows(rows, args.market_weight, args.timing_weight, args.fit_weight)
    result = {
        "mode": args.mode,
        "weights": {
            "market": args.market_weight,
            "timing": args.timing_weight,
            "strategic_fit": args.fit_weight,
        },
        "sector_summary": sector_summary(rankings),
        "rankings": rankings,
    }

    json_path = Path(args.out_json)
    md_path = Path(args.out_md)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(markdown_report(result, args.top), encoding="utf-8")
    print(f"Wrote {json_path}")
    print(f"Wrote {md_path}")


if __name__ == "__main__":
    main()

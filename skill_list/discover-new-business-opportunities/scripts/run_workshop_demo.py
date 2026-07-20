#!/usr/bin/env python3
import argparse
import csv
import json
from pathlib import Path


SECTOR_CRITERIA = {
    "growth_20": 20,
    "company_competitiveness_20": 20,
    "profitability_15": 15,
    "strategy_alignment_15": 15,
    "market_size_10": 10,
    "entry_ease_10": 10,
    "reputation_financial_10": 10,
}

SECTOR_REQUIRED = {
    "sector_id",
    "sector",
    "evidence_count",
    "notes",
    *SECTOR_CRITERIA,
}

BM_SCORE_FIELDS = ("marketability_3", "timeliness_3", "fit_3")
BM_REQUIRED = {
    "bm_id",
    "sector_id",
    "value_chain_stage",
    "customer_problem",
    "business_model",
    "evidence_count",
    "notes",
    *BM_SCORE_FIELDS,
}


def parse_int(row, field, row_number, minimum, maximum):
    try:
        value = int(row[field])
    except (TypeError, ValueError) as exc:
        raise ValueError(f"row {row_number}: {field} must be an integer") from exc
    if not minimum <= value <= maximum:
        raise ValueError(
            f"row {row_number}: {field} must be between {minimum} and {maximum}"
        )
    return value


def confidence(evidence_count):
    if evidence_count >= 4:
        return "높음"
    if evidence_count >= 2:
        return "중간"
    return "낮음"


def load_sectors(path):
    with open(path, encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        missing = sorted(SECTOR_REQUIRED - set(reader.fieldnames or []))
        if missing:
            raise ValueError(f"missing sector columns: {', '.join(missing)}")

        rows = []
        seen = set()
        for row_number, row in enumerate(reader, start=2):
            sector_id = row["sector_id"].strip()
            if not sector_id or sector_id in seen:
                raise ValueError(f"row {row_number}: invalid or duplicate sector_id")
            seen.add(sector_id)
            scores = {
                field: parse_int(row, field, row_number, 0, maximum)
                for field, maximum in SECTOR_CRITERIA.items()
            }
            evidence_count = parse_int(row, "evidence_count", row_number, 0, 9999)
            rows.append(
                {
                    "sector_id": sector_id,
                    "sector": row["sector"].strip(),
                    "scores": scores,
                    "total_score": sum(scores.values()),
                    "evidence_count": evidence_count,
                    "confidence": confidence(evidence_count),
                    "notes": row["notes"].strip(),
                }
            )
    if not rows:
        raise ValueError("sector CSV has no rows")
    rows.sort(key=lambda item: (-item["total_score"], item["sector_id"]))
    for rank, row in enumerate(rows, start=1):
        row["rank"] = rank
    return rows


def load_business_models(path, known_sector_ids, threshold):
    with open(path, encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        missing = sorted(BM_REQUIRED - set(reader.fieldnames or []))
        if missing:
            raise ValueError(f"missing BM columns: {', '.join(missing)}")

        rows = []
        seen = set()
        for row_number, row in enumerate(reader, start=2):
            bm_id = row["bm_id"].strip()
            sector_id = row["sector_id"].strip()
            if not bm_id or bm_id in seen:
                raise ValueError(f"row {row_number}: invalid or duplicate bm_id")
            if sector_id not in known_sector_ids:
                raise ValueError(f"row {row_number}: unknown sector_id {sector_id}")
            seen.add(bm_id)
            scores = {
                field: parse_int(row, field, row_number, 1, 3)
                for field in BM_SCORE_FIELDS
            }
            evidence_count = parse_int(row, "evidence_count", row_number, 0, 9999)
            total = sum(scores.values())
            if total >= threshold:
                tier = "1순위"
            elif total >= 6:
                tier = "2순위"
            else:
                tier = "보류"
            rows.append(
                {
                    "bm_id": bm_id,
                    "sector_id": sector_id,
                    "value_chain_stage": row["value_chain_stage"].strip(),
                    "customer_problem": row["customer_problem"].strip(),
                    "business_model": row["business_model"].strip(),
                    "marketability": scores["marketability_3"],
                    "timeliness": scores["timeliness_3"],
                    "fit": scores["fit_3"],
                    "total_score": total,
                    "tier": tier,
                    "evidence_count": evidence_count,
                    "confidence": confidence(evidence_count),
                    "notes": row["notes"].strip(),
                }
            )
    if not rows:
        raise ValueError("BM CSV has no rows")
    rows.sort(key=lambda item: (-item["total_score"], -item["evidence_count"], item["bm_id"]))
    for rank, row in enumerate(rows, start=1):
        row["rank"] = rank
    return rows


def markdown_report(result):
    lines = [
        "# MOCK DATA — 신사업 발굴 워크숍 결과",
        "",
        "> 가상의 생명보험사와 교육용 점수입니다. 실제 삼성생명 평가나 사업 추천이 아닙니다.",
        "",
        "## Sector Short-list",
        "",
        "| 순위 | 섹터 | 총점/100 | 근거 수 | 신뢰도 |",
        "|---:|---|---:|---:|---|",
    ]
    for row in result["sector_shortlist"]:
        lines.append(
            f"| {row['rank']} | {row['sector']} | {row['total_score']} | "
            f"{row['evidence_count']} | {row['confidence']} |"
        )

    lines.extend(
        [
            "",
            "## Short-list 섹터의 BM",
            "",
            "| 순위 | 섹터 | 고객문제 | BM | 시장성 | 적시성 | 적합성 | 총점 | 분류 | 신뢰도 |",
            "|---:|---|---|---|---:|---:|---:|---:|---|---|",
        ]
    )
    sector_names = {row["sector_id"]: row["sector"] for row in result["sector_ranking"]}
    for row in result["business_models"]:
        lines.append(
            f"| {row['rank']} | {sector_names[row['sector_id']]} | {row['customer_problem']} | "
            f"{row['business_model']} | {row['marketability']} | {row['timeliness']} | "
            f"{row['fit']} | {row['total_score']} | {row['tier']} | {row['confidence']} |"
        )

    lines.extend(
        [
            "",
            "## Human Gate 기록",
            "",
            "- [ ] Gate 1 — 산업 모집단과 제외 영역을 사람이 확인했는가?",
            "- [ ] Gate 2 — 7개 섹터 기준과 점수 근거를 사람이 승인했는가?",
            "- [ ] Gate 3 — 1순위 BM의 반대 근거와 데이터 공백을 확인했는가?",
            "- [ ] Gate 4 — 추가 검증·보류·추진 판단을 사람이 내렸는가?",
            "",
            "## 실습 질문",
            "",
            "1. 우리 팀 상황과 가장 맞지 않는 평가기준은 무엇인가?",
            "2. 그 기준을 바꾸면 Short-list가 어떻게 달라지는가?",
            "3. 실제 데이터로 넘어가기 전에 어떤 Human Gate를 추가해야 하는가?",
            "",
        ]
    )
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Run the safe new-business workshop demo.")
    parser.add_argument("sector_csv")
    parser.add_argument("bm_csv")
    parser.add_argument("--out-json", required=True)
    parser.add_argument("--out-md", required=True)
    parser.add_argument("--sector-top", type=int, default=5)
    parser.add_argument("--bm-threshold", type=int, default=8)
    args = parser.parse_args()

    if args.sector_top < 1:
        raise SystemExit("--sector-top must be at least 1")
    if not 3 <= args.bm_threshold <= 9:
        raise SystemExit("--bm-threshold must be between 3 and 9")

    sectors = load_sectors(args.sector_csv)
    if args.sector_top > len(sectors):
        raise SystemExit("--sector-top exceeds the number of sector candidates")
    known_sector_ids = {row["sector_id"] for row in sectors}
    all_business_models = load_business_models(
        args.bm_csv, known_sector_ids, args.bm_threshold
    )
    shortlist = sectors[: args.sector_top]
    shortlisted_ids = {row["sector_id"] for row in shortlist}
    shortlisted_business_models = [
        row for row in all_business_models if row["sector_id"] in shortlisted_ids
    ]
    for rank, row in enumerate(shortlisted_business_models, start=1):
        row["rank"] = rank

    result = {
        "mode": "workshop-mock",
        "sector_top": args.sector_top,
        "bm_priority_threshold": args.bm_threshold,
        "sector_ranking": sectors,
        "sector_shortlist": shortlist,
        "business_models": shortlisted_business_models,
    }

    out_json = Path(args.out_json)
    out_md = Path(args.out_md)
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_md.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    out_md.write_text(markdown_report(result), encoding="utf-8")
    print(f"Wrote {out_json}")
    print(f"Wrote {out_md}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import argparse
import csv
import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse


REQUIRED_FIELDS = {
    "opportunity_id",
    "claim_id",
    "claim",
    "source_title",
    "source_url",
    "source_type",
    "published_at",
    "accessed_at",
    "stance",
    "strength",
    "notes",
}

SOURCE_TYPES = {
    "government",
    "regulatory_filing",
    "company_filing",
    "industry_association",
    "academic",
    "reputable_media",
    "paid_research",
    "internal",
    "mock",
}


def parse_date(value):
    datetime.strptime(value, "%Y-%m-%d")


def valid_url(value):
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def load_opportunities(csv_path):
    with open(csv_path, encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or "opportunity_id" not in reader.fieldnames:
            raise ValueError("opportunities CSV is missing opportunity_id")
        opportunities = {}
        for row_number, row in enumerate(reader, start=2):
            opportunity_id = row["opportunity_id"].strip()
            if opportunity_id in opportunities:
                raise ValueError(f"row {row_number}: duplicate opportunity_id {opportunity_id}")
            opportunities[opportunity_id] = {
                "business_model": row.get("business_model", "").strip(),
                "expected_count": int(row.get("evidence_count", 0)),
            }
    return opportunities


def validate_record(record, line_number, opportunities, seen_claim_ids, actual_counts):
    errors = []
    missing = sorted(field for field in REQUIRED_FIELDS if field not in record)
    if missing:
        return [f"line {line_number}: missing fields: {', '.join(missing)}"]

    opportunity_id = str(record["opportunity_id"]).strip()
    claim_id = str(record["claim_id"]).strip()
    if opportunity_id not in opportunities:
        errors.append(f"line {line_number}: unknown opportunity_id {opportunity_id}")
    if not claim_id:
        errors.append(f"line {line_number}: claim_id is empty")
    elif claim_id in seen_claim_ids:
        errors.append(f"line {line_number}: duplicate claim_id {claim_id}")
    else:
        seen_claim_ids.add(claim_id)

    if not str(record["claim"]).strip():
        errors.append(f"line {line_number}: claim is empty")
    if not str(record["source_title"]).strip():
        errors.append(f"line {line_number}: source_title is empty")
    if not valid_url(str(record["source_url"])):
        errors.append(f"line {line_number}: source_url must be http(s)")
    if record["source_type"] not in SOURCE_TYPES:
        errors.append(f"line {line_number}: unsupported source_type {record['source_type']}")
    if record["stance"] not in {"support", "conflict"}:
        errors.append(f"line {line_number}: stance must be support or conflict")
    try:
        strength = int(record["strength"])
        if strength not in {1, 2, 3}:
            raise ValueError
    except (TypeError, ValueError):
        errors.append(f"line {line_number}: strength must be 1, 2, or 3")
    for field in ("published_at", "accessed_at"):
        try:
            parse_date(str(record[field]))
        except ValueError:
            errors.append(f"line {line_number}: {field} must use YYYY-MM-DD")

    if opportunity_id in opportunities:
        actual_counts[opportunity_id] += 1
    return errors


def main():
    parser = argparse.ArgumentParser(description="Validate a business-opportunity evidence ledger.")
    parser.add_argument("opportunities_csv")
    parser.add_argument("evidence_jsonl")
    parser.add_argument("--out", required=True)
    parser.add_argument("--live", action="store_true", help="Reject mock sources.")
    args = parser.parse_args()

    opportunities = load_opportunities(args.opportunities_csv)
    errors = []
    warnings = []
    seen_claim_ids = set()
    actual_counts = Counter()
    stances = defaultdict(Counter)
    source_types = defaultdict(Counter)

    with open(args.evidence_jsonl, encoding="utf-8") as handle:
        for line_number, raw_line in enumerate(handle, start=1):
            if not raw_line.strip():
                continue
            try:
                record = json.loads(raw_line)
            except json.JSONDecodeError as exc:
                errors.append(f"line {line_number}: invalid JSON: {exc.msg}")
                continue
            errors.extend(
                validate_record(record, line_number, opportunities, seen_claim_ids, actual_counts)
            )
            opportunity_id = str(record.get("opportunity_id", ""))
            if opportunity_id in opportunities:
                stances[opportunity_id][record.get("stance")] += 1
                source_types[opportunity_id][record.get("source_type")] += 1
            if args.live and record.get("source_type") == "mock":
                errors.append(f"line {line_number}: mock source is not allowed in live mode")

    coverage = []
    for opportunity_id, meta in opportunities.items():
        actual = actual_counts[opportunity_id]
        expected = meta["expected_count"]
        if actual == 0:
            errors.append(f"{opportunity_id}: no evidence records")
        if actual != expected:
            errors.append(
                f"{opportunity_id}: evidence_count is {expected}, ledger contains {actual}"
            )
        if actual < 2:
            warnings.append(f"{opportunity_id}: fewer than 2 evidence records")
        if stances[opportunity_id]["conflict"] == 0:
            warnings.append(f"{opportunity_id}: no conflicting evidence recorded")
        coverage.append(
            {
                "opportunity_id": opportunity_id,
                "business_model": meta["business_model"],
                "expected_evidence": expected,
                "actual_evidence": actual,
                "support": stances[opportunity_id]["support"],
                "conflict": stances[opportunity_id]["conflict"],
                "source_types": dict(source_types[opportunity_id]),
            }
        )

    result = {
        "status": "pass" if not errors else "fail",
        "mode": "live" if args.live else "demo-or-unspecified",
        "opportunity_count": len(opportunities),
        "evidence_record_count": sum(actual_counts.values()),
        "errors": errors,
        "warnings": warnings,
        "coverage": coverage,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out}")
    print(f"Status: {result['status']} ({len(errors)} errors, {len(warnings)} warnings)")
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()

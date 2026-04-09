# Financial Traceability Module

Every financial number cited in pipeline analysis documents or client deliverables MUST trace to a specific extraction output. No LLM-only number analysis.

---

## The Problem

LLMs confidently produce plausible financial numbers from reasoning alone. In audit-grade work (PE covenant reporting, financial dashboards, tax analysis), a plausible-but-wrong number is worse than no number at all. The zero-assumptions rule catches hedging language, but a model can write `$2.3M revenue` with zero hedging and be completely wrong.

**Origin:** BRIDGE ran financial analysis on Excel data using LLM reasoning. Numbers appeared correct but had no cell-reference backing. Cross-verification via openpyxl extraction revealed discrepancies. Every number should have been traceable.

---

## When This Module Activates

This module applies when ANY of these conditions are true:
- Pipeline input includes financial data (Excel, CSV, database exports, PDF financial statements)
- The project involves financial analysis, reporting, dashboards, or covenant calculations
- Any agent writes dollar amounts, percentages, ratios, or financial metrics to pipeline/ or deliverables/ files

**Detection heuristic (Phase 0):** If input files include `.xlsx`, `.csv`, `.xls`, financial PDFs, or the business challenge mentions revenue, EBITDA, covenants, margins, ratios, or financial reporting -- set `config.financial_traceability: true` in `pipeline/config.json`.

---

## The Protocol: Citation-Required Numbers

### Rule: Every Financial Number Needs a Source Tag

When writing ANY financial figure to a pipeline or deliverable document, the agent MUST include a source citation immediately after the number:

```markdown
Revenue: $2,347,891 [Source: Sheet1!B15, Q3-financials.xlsx]
EBITDA Margin: 23.4% [Source: calculated from B15/B8, Q3-financials.xlsx]  
Debt/EBITDA Ratio: 3.2x [Source: calculated from C22/B15, covenant-data.xlsx]
YoY Growth: 12.7% [Source: calculated from (B15-B14)/B14, Q3-financials.xlsx]
```

### Source Tag Format

```
[Source: {cell_or_field}, {file_or_table}]
[Source: calculated from {formula_with_refs}, {file_or_table}]
[Source: {api_endpoint}.{field_name}, extracted {ISO_date}]
[Source: {database_table}.{column}, query_id={id}]
```

### What Counts as a Valid Source

| Data Origin | Valid Source Reference | Invalid |
|---|---|---|
| Excel/CSV file | Cell reference (Sheet1!B15) or row:col | "from the spreadsheet" |
| Database query | Table.column + query ID or SQL snippet | "from the database" |
| API response | Endpoint + field path | "from the API" |
| PDF extraction | Page number + table/section identifier | "from the report" |
| Calculated value | Formula with cell refs for all inputs | "calculated from data" |
| User-provided | "User-stated {date}" | No citation |

### What Does NOT Need a Source Tag

- Pipeline cost estimates (those are LLM estimates, covered by cost-tracking.md)
- Effort estimation numbers (covered by effort-estimation.md with its own disclaimers)
- Test coverage percentages (tool-generated)
- Quality scores (formula-derived from pipeline data)
- Line counts, file counts, or other code metrics

---

## Extraction-First Workflow

When financial data is involved, agents MUST follow this workflow:

### Step 1: Extract Before Analyzing

```
WRONG: Read the Excel file and tell me the revenue is $2.3M
RIGHT: Use openpyxl/pandas to extract cell values, THEN analyze
```

The agent MUST:
1. Use a programmatic extraction tool (openpyxl, pandas, csv module, SQL query)
2. Write raw extraction output to `pipeline/data-extractions/` as JSON
3. Reference that extraction output in all subsequent analysis

### Step 2: Write Extraction Log

Create `pipeline/data-extractions/{source-slug}-extraction.json`:

```json
{
  "source_file": "Q3-financials.xlsx",
  "extraction_timestamp": "2026-04-09T14:30:00Z",
  "extraction_method": "openpyxl",
  "sheets_extracted": ["Sheet1", "Covenants"],
  "cells": {
    "Sheet1!B15": { "value": 2347891, "type": "number", "label": "Q3 Revenue" },
    "Sheet1!B8": { "value": 10034567, "type": "number", "label": "Q3 Total Assets" },
    "Covenants!C22": { "value": 7512450, "type": "number", "label": "Total Debt" }
  }
}
```

### Step 3: Cross-Verify Critical Numbers

For any number that appears in a client deliverable:
1. The number MUST exist in a `pipeline/data-extractions/*.json` file
2. If calculated, the formula inputs MUST all trace to extraction cells
3. The Phase 5 Validator checks this mapping (see Validator integration below)

---

## Validator Integration (Phase 5)

When `config.financial_traceability` is true, the Validator (Step 5.1a) adds these checks:

### Financial Traceability Checks

1. **Source Tag Completeness**: Scan all `.md` files in `pipeline/` and `deliverables/` for financial patterns (`$`, `%`, ratio indicators). Every match MUST have a `[Source: ...]` tag within the same paragraph. Flag missing tags as `FIN_TRACE_MISSING`.

2. **Extraction Log Existence**: Verify `pipeline/data-extractions/` contains at least one extraction JSON for each financial data source referenced in the pipeline. Flag missing extractions as `FIN_EXTRACT_MISSING`.

3. **Cross-Reference Verification**: For each `[Source: cell, file]` tag in deliverables/, verify the referenced cell exists in the corresponding extraction JSON and the value matches. Flag mismatches as `FIN_TRACE_MISMATCH` (CRITICAL severity).

4. **Orphan Number Detection**: Identify financial figures in deliverables/ that appear nowhere in any extraction JSON. Flag as `FIN_ORPHAN` (HIGH severity).

### Severity Mapping

| Finding | Severity | Blocks Delivery? |
|---|---|---|
| FIN_TRACE_MISSING | HIGH | Yes (if in deliverables/) |
| FIN_EXTRACT_MISSING | HIGH | Yes |
| FIN_TRACE_MISMATCH | CRITICAL | Yes |
| FIN_ORPHAN | HIGH | Yes (if in deliverables/) |
| FIN_TRACE_MISSING in pipeline/ only | MEDIUM | No (internal docs) |

---

## Hookify Rule Integration

The `bridge-financial-traceability` hookify rule provides early warning during file writes. It detects financial number patterns in pipeline/deliverables markdown files and warns the agent to add source citations. This is a safety net -- agents should self-enforce the citation protocol, but the hook catches what they miss.

Pattern: Matches dollar amounts (`$X,XXX` or `$X.XM`), percentages in financial context, and ratio indicators (Nx) when written to analysis documents.

---

## Agent Prompt Addition

When `config.financial_traceability` is true, embed in ALL agent prompts that handle financial data:

```
## Financial Traceability Active
Every financial number you write MUST include a [Source: cell/field, file] tag.
- Extract data programmatically FIRST (openpyxl, pandas, SQL)
- Write extraction output to pipeline/data-extractions/{source}-extraction.json
- Reference extraction cells in all analysis
- NEVER cite a financial number from LLM reasoning alone
If you cannot trace a number to a specific cell: write "VALUE UNVERIFIED — requires extraction" instead.
```

---

## Examples

### Good: Traceable Analysis

```markdown
### Q3 Financial Summary

Total Revenue: $2,347,891 [Source: Sheet1!B15, Q3-financials.xlsx]
Operating Expenses: $1,892,345 [Source: Sheet1!B22, Q3-financials.xlsx]  
Net Income: $455,546 [Source: calculated from B15-B22, Q3-financials.xlsx]
EBITDA Margin: 23.4% [Source: calculated from (B15-B22+B30)/B15, Q3-financials.xlsx]

Debt Service Coverage Ratio: 1.8x [Source: calculated from B15/Covenants!C22, Q3-financials.xlsx]
Covenant threshold: 1.5x [Source: Covenants!D3, covenant-terms.xlsx]
Status: COMPLIANT (1.8x > 1.5x)
```

### Bad: LLM-Reasoned Numbers

```markdown
### Q3 Financial Summary

Total Revenue: $2,347,891
Operating Expenses: approximately $1.9M
Net Income: around $450K
EBITDA Margin: approximately 23%

The company appears to be in compliance with its debt covenants.
```

The second example has zero traceability. If any number is wrong, there is no way to verify or debug it.

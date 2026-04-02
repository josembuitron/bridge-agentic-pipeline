---
name: crawl4ai
description: >
  Free, local web scraping via crawl4ai CLI (crwl). Use for scraping documentation,
  extracting API references, deep crawling doc sites, and LLM-powered content extraction.
  Trigger on: "scrape this URL", "get docs from", "crawl documentation", "extract from website",
  any URL that needs clean markdown extraction, researching platform documentation
  (NetSuite, Salesforce, Azure, AWS, Intuit, SAP, Dynamics 365), or when firecrawl is unavailable.
  Always prefer crawl4ai over WebFetch for documentation -- it returns clean markdown, handles JS rendering,
  and runs completely free with no API key.
---

# crawl4ai -- Free Web Scraping CLI

crawl4ai scrapes any URL and returns clean, LLM-optimized markdown. It runs locally, is completely free, and needs no API key.

## Installation

```bash
pip install -U crawl4ai && crawl4ai-setup
```

After install, the CLI is available as `crwl`. If `crwl` is not in PATH, use `python -m crawl4ai` instead.

## Core Commands

### Scrape a single page to markdown
```bash
crwl https://docs.example.com/api -o markdown
```

### Save output to file
```bash
crwl https://learn.microsoft.com/en-us/azure/... -o markdown > .crawl4ai/azure-docs.md
```

### Deep crawl an entire doc section (BFS)
```bash
crwl https://docs.example.com --deep-crawl bfs --max-pages 50 -o markdown
```

### LLM-powered extraction (ask a question about the page)
```bash
crwl https://developer.intuit.com/... -q "extract authentication methods and rate limits"
```

### Crawl with CSS selector (extract specific section)
```bash
crwl https://docs.example.com -c "article.main-content" -o markdown
```

## Usage Patterns

### Research workflow (most common)
1. Use WebSearch to find the right documentation URL
2. Use `crwl URL -o markdown` to extract clean content
3. Save to `.crawl4ai/` for other agents to reference

```bash
# Example: Research NetSuite API
crwl https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/... -o markdown > .crawl4ai/netsuite-api.md
```

### Deep documentation crawl
```bash
crwl https://learn.microsoft.com/en-us/azure/functions/ --deep-crawl bfs --max-pages 30 -o markdown > .crawl4ai/azure-functions.md
```

### Extract specific information
```bash
crwl https://stripe.com/docs/api -q "list all webhook event types and their payloads" -o markdown
```

## When to Use crawl4ai vs Other Tools

| Need | Use crawl4ai | Use firecrawl | Use Playwright |
|------|-------------|---------------|----------------|
| Clean markdown from docs | Yes (free) | Yes (paid) | Overkill |
| Deep crawl entire site | Yes (--deep-crawl) | Yes (crawl mode) | No |
| JS-heavy SPA | Try first | Better | Best |
| Auth-gated pages | No | No | Yes |
| LLM extraction | Yes (-q flag) | Yes | No |
| Cost | Free | Paid API | Free |

## Fallback Chain

If `crwl` is not installed or fails:
1. Try `python -m crawl4ai`
2. Fall back to firecrawl (if available)
3. Fall back to Playwright MCP
4. Fall back to WebFetch (least reliable)

## Output Directory Convention

Always save crawled docs to `.crawl4ai/` in the project root:
```
.crawl4ai/
  azure-docs.md
  netsuite-api.md
  stripe-webhooks.md
```
This directory serves as a shared cache -- other agents can read these files instead of re-crawling.

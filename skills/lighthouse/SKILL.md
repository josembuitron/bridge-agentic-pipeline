---
name: lighthouse
description: >
  Web performance, accessibility, SEO, and best practices auditing via Google Lighthouse CLI.
  Trigger on: "performance audit", "check accessibility", "SEO audit", "Core Web Vitals",
  "page speed", "WCAG compliance", "lighthouse score", "web audit",
  or any request to measure website quality metrics before delivery.
---

# lighthouse -- Web Quality Auditing

Google Lighthouse audits web pages for performance, accessibility, SEO, and best practices.

## Quick Commands

```bash
# Full audit (all categories) -- outputs HTML report
lighthouse https://example.com --output html --output-path ./report.html

# JSON output for pipeline processing
lighthouse https://example.com --output json --output-path ./lighthouse.json

# Performance only
lighthouse https://example.com --only-categories=performance --output json

# Accessibility only
lighthouse https://example.com --only-categories=accessibility --output json

# Multiple categories
lighthouse https://example.com --only-categories=performance,accessibility,seo --output json

# Audit a local file
lighthouse file:///path/to/index.html --output json

# Headless Chrome (for CI/server environments)
lighthouse https://example.com --chrome-flags="--headless --no-sandbox" --output json
```

## Categories

| Category | Flag | What it checks |
|----------|------|---------------|
| Performance | `performance` | Core Web Vitals, load times, resource optimization |
| Accessibility | `accessibility` | WCAG 2.1 compliance, ARIA, color contrast |
| Best Practices | `best-practices` | HTTPS, console errors, deprecated APIs |
| SEO | `seo` | Meta tags, crawlability, mobile-friendly |

## Pipeline Integration

For frontend validation, run after build:
```bash
lighthouse file://deliverables/report.html --only-categories=accessibility,best-practices --output json > pipeline/lighthouse-results.json
```

Score thresholds for quality gate:
- Performance: 70+ (acceptable), 90+ (good)
- Accessibility: 90+ (required for client deliverables)
- Best Practices: 80+
- SEO: 80+

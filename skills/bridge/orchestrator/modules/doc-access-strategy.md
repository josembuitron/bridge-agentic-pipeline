# Documentation Access Strategy

All agents that need to research or reference documentation should use this tiered approach.

## Tier 1: Context7 MCP (Code Libraries Only)
For code libraries (React, Node.js, Python packages, etc.):
- `mcp__plugin_context7_context7__resolve-library-id` → resolve name
- `mcp__plugin_context7_context7__query-docs` → fetch docs
- **Limitation**: Only covers registered code libraries, NOT enterprise platforms

## Tier 2: DeepWiki MCP (GitHub Repo Documentation) -- OPTIONAL
For GitHub repositories with good documentation but no llms.txt:
- Plugin: `devin-ai-integration/mcp-server-deepwiki`
- Provides AI-generated documentation from any public GitHub repo
- **When to use**: Library/framework has a GitHub repo with docs, but Context7 doesn't cover it and no llms.txt exists
- **Availability check**: Same as other plugins -- check during Step 0.0c Smart Plugin Check. If not installed, skip this tier silently.

```
# Example: get docs for a GitHub repo
mcp__deepwiki__query-docs("owner/repo", "how does authentication work?")
```

**Limitation**: Only public GitHub repos. Does not cover enterprise platforms or private repos.

## Tier 3: crawl4ai CLI (ANY Online Documentation) -- PRIMARY
For enterprise platforms, APIs, and any web documentation:
```bash
# Scrape a URL to clean markdown
crwl https://learn.microsoft.com/... -o markdown > .crawl4ai/azure.md

# Deep crawl an entire doc section
crwl https://docs.example.com --deep-crawl bfs --max-pages 50 > .crawl4ai/docs.md

# LLM-powered extraction
crwl https://developer.intuit.com/... -q "extract authentication methods" > .crawl4ai/intuit-auth.md
```
Covers: NetSuite, Azure, Intuit/QuickBooks, Salesforce, Dynamics 365, SAP, AWS, ANY platform.
Free, local, no API key needed.

## Tier 4: Playwright MCP (Interactive / JS-Heavy Sites)
For sites requiring interaction (login walls, SPAs, paginated content):
- `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_take_screenshot`

Use when crawl4ai can't render the page or interaction is needed.

## Tier 5: Context Hub CLI (Curated API Documentation)
```bash
npx @aisuite/chub search "stripe"
npx @aisuite/chub get stripe/api --lang python
```
Good for: Stripe, OpenAI, Anthropic, Supabase, Firebase, Twilio, Shopify, AWS APIs.

## Tier 6: WebSearch + WebFetch (Fallback)
When all other tools unavailable. Less reliable, no JS rendering.

## llms.txt Quick Check (try FIRST)
```bash
curl -s "{base_url}/llms.txt" | head -50
```
If exists and covers the topic → use directly. If not → fall back to crawl4ai.

## When to Use What
| Need | Best Tool | Fallback |
|------|-----------|----------|
| React/Node/Python library docs | Context7 | DeepWiki → Context Hub → crawl4ai |
| GitHub repo with docs (no llms.txt) | DeepWiki | crawl4ai → Context7 |
| NetSuite/Intuit/Salesforce API | crawl4ai | Playwright → WebFetch |
| Azure/AWS documentation | crawl4ai | Context Hub → WebFetch |
| Stripe/Twilio/Shopify API | Context Hub | crawl4ai → Context7 |
| JS-heavy SPA documentation | Playwright | crawl4ai |
| Auth-gated documentation | Playwright | crawl4ai |
| General web research | WebSearch + crawl4ai | WebSearch + WebFetch |

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
- **Availability check**: Same as other plugins -- check during Step 0.0c Smart Plugin Check. If not installed, fall through to Tier 3 (crawl4ai) and record the transition in `pipeline/tooling-manifest.md` AND surface it in the next phase gate's "Degraded Capabilities" block (see `modules/tool-matrix.md`). Never silently skip -- the user must know a tier was unavailable.

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

## Community Intelligence Track (Agent-Reach)

**Parallel to Tiers 1-6.** Official docs tell you how something SHOULD work. Community intelligence tells you how it ACTUALLY works -- workarounds, gotchas, real-world performance, adoption trends.

Requires: `agent-reach` CLI + tools (detected in Phase 0). If not available, fall back to WebSearch.

### Exa AI Search (semantic web search)
```bash
# Semantic search across blogs, Substack, dev.to, Medium, HackerNews
mcporter call 'exa.web_search_exa(query: "technology_name best practices 2026", numResults: 10)'

# Code-focused search
mcporter call 'exa.get_code_context_exa(query: "how to implement X with Y", tokensNum: 3000)'
```
Best for: blog posts, technical articles, Stack Overflow alternatives, trending opinions.

### Reddit (rdt-cli)
```bash
# Search for real-world experiences with a technology
rdt search "technology_name production issues" --limit 10

# Read a specific discussion thread with all comments
rdt read POST_ID

# Browse a relevant subreddit
rdt sub programming --limit 20
```
Best for: "has anyone actually done this?", workarounds, gotchas, production war stories, community sentiment.

### YouTube (yt-dlp transcript extraction)
```bash
# Search for tutorials and conference talks
yt-dlp --dump-json "ytsearch5:technology_name tutorial 2026"

# Extract subtitles from a specific video (no video download)
yt-dlp --write-sub --write-auto-sub --sub-lang "en" --skip-download -o "/tmp/%(id)s" "VIDEO_URL"
cat /tmp/VIDEO_ID.*.vtt
```
Best for: conference talks, implementation walkthroughs, architecture deep-dives, visual explanations.

### When to Use Community Research

| Research Question | Best Community Tool | Fallback |
|---|---|---|
| "Has anyone implemented X with Y?" | Reddit (`rdt search`) | Exa search |
| "Known bugs or gotchas with library Z?" | Reddit + Exa search | WebSearch |
| "Best practices for deploying X?" | Exa search (blogs/articles) | YouTube transcripts |
| "Step-by-step tutorial for X" | YouTube transcript extraction | crawl4ai on tutorial sites |
| "Is technology X gaining or losing traction?" | Exa search + Reddit sentiment | WebSearch |
| "What stack does company Y use?" | Exa search + GitHub repos | LinkedIn (if available) |
| "Alternative approaches to solving problem P" | Reddit discussions + Exa | WebSearch |

**Integration with D-Validation**: When validating `[NEEDS VALIDATION]` items from BRIDGE analysis, use community research to cross-check official claims against real-world experience. If official docs say "supports 10K RPS" but Reddit threads report throttling at 2K, flag the discrepancy.

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
| Community workarounds/gotchas | Reddit (rdt search) | Exa search → WebSearch |
| Tutorials and walkthroughs | YouTube transcripts (yt-dlp) | crawl4ai on tutorial sites |
| Technology adoption/sentiment | Exa search + Reddit | WebSearch |
| Blog posts and articles | Exa search (mcporter) | crawl4ai → WebSearch |

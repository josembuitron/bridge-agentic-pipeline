# Researcher Agent Memory

## Trail of Bits Claude Code Skills (Researched 2026-03-21)

### Repository
- Main: https://github.com/trailofbits/skills
- Curated marketplace: https://github.com/trailofbits/skills-curated
- Config reference: https://github.com/trailofbits/claude-code-config
- Install: `/plugin marketplace add trailofbits/skills`
- License: CC-BY-SA-4.0
- Total skills: 35 (confirmed by directory listing)

### Complete Skills List
All 35 plugin directory names (kebab-case):
1. agentic-actions-auditor
2. ask-questions-if-underspecified
3. audit-context-building
4. building-secure-contracts
5. burpsuite-project-parser
6. claude-in-chrome-troubleshooting
7. constant-time-analysis
8. culture-index
9. debug-buttercup
10. devcontainer-setup
11. differential-review
12. dwarf-expert
13. entry-point-analyzer
14. firebase-apk-scanner
15. fp-check
16. gh-cli
17. git-cleanup
18. insecure-defaults
19. let-fate-decide
20. modern-python
21. property-based-testing
22. seatbelt-sandboxer
23. second-opinion
24. semgrep-rule-creator
25. semgrep-rule-variant-creator
26. sharp-edges
27. skill-improver
28. spec-to-code-compliance
29. static-analysis
30. supply-chain-risk-auditor
31. testing-handbook-skills
32. variant-analysis
33. workflow-skill-design
34. yara-authoring
35. zeroize-audit

### Full Reference Doc
Saved to: /home/user/bridge-agentic-pipeline/.crawl4ai/trailofbits-skills-complete-reference.md

### Key Notes
- debug-buttercup is Buttercup CRS (Cyber Reasoning System) specific - Trail of Bits internal tooling, limited external use
- culture-index is non-security (HR/team assessment) - authored by Dan Guido (Trail of Bits CEO)
- let-fate-decide uses Tarot cards + os.urandom() for entropy - novelty/fun skill
- seatbelt-sandboxer is macOS only
- firebase-apk-scanner requires explicit authorization
- building-secure-contracts has 11 sub-skills across 6 blockchains
- testing-handbook-skills is a meta-skill generating 16 sub-skills
- spec-to-code-compliance targets blockchain/smart contract audits specifically
- fp-check only activates on explicit "is this a true positive?" type queries
- gh-cli requires `gh auth login` first; provides 5000/hr vs 60/hr rate limit
- second-opinion requires OpenAI Codex or Google Gemini CLI installed locally
- skill-improver requires plugin-dev plugin installed first

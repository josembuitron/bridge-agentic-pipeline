# Client Deck Writing Discipline

This module governs how BRIDGE writes text inside client-facing presentations (credentials, POV, assessment, proposal, sales decks). It applies to every PPTX produced by the pipeline — regardless of which tool (`python-pptx`, `pptxgenjs`, Hyperframes, PresentationGO) generates the slide.

**Core principle:** Slides are cue cards, not handouts. The presenter fills in context verbally. The slide shows large text with few words.

---

## Never write on a client-facing slide

### 1. Meta-narration of the deck itself
Drop any sentence that describes what the deck is doing.

| DO NOT WRITE | |
|---|---|
| "This deck shows who we are, how we work, and the engagements we have delivered." | — |
| "This presentation addresses each of these directly with real engagements." | — |
| "These are the actual deliverable types produced for this client." | — |

If the user needs that context, it goes in the spoken pitch or speaker notes.

### 2. Process / workshop labels
These are workshop artifacts that do not belong in a client deck.

| DO NOT WRITE |
|---|
| `WHAT YOU WALK AWAY WITH` |
| `COMPLETED PILOT` |
| `SAMPLE DELIVERABLES PRODUCED` |
| `PREPARED BY` / `PRESENTED BY` unless explicitly requested |

### 3. Industry / engagement taxonomy tags under case study titles
The case study title already says what the case is. A long taxonomy footer below it duplicates that.

| DO NOT WRITE |
|---|
| `INDUSTRY: RESTAURANT / FRANCHISE / HOSPITALITY   |   ENGAGEMENT: MULTI-LOCATION INTEGRATION   |   DESTINATION: SAGE INTACCT` |

If industry has to appear at all, one short eyebrow above the title is enough.

### 4. Redundant subtitles beneath a strong headline
A bold headline like "Data integration you own" does not need a second line explaining itself.

| STRIP |
|---|
| Headline: `Data integration you own` |
| Subtitle: `From managed middleware to a platform you control` ← remove |

### 5. Disclaimers and provenance footers
The client does not need to see the redaction note.

| DO NOT WRITE |
|---|
| `ALL ENGAGEMENTS ARE REDACTED APRIO CLIENT WORK — DETAILS AVAILABLE UPON REQUEST` |
| `DELIVERABLES FROM AN ACTUAL APRIO SAGE INTACCT INTEGRATION ENGAGEMENT — DETAILS REDACTED` |

### 6. Internal frameworks and audit checklists
Frameworks like "Integration Audit Framework" (6 categories with probe questions: Data Flow Relations, Data Knowledge, People, System Integration, Performance, Tools and Technology) are **delivery material** used during an engagement — never introductory sales material on a credentials or POV deck.

### 7. Stat roll-up "proof points" slide when the case studies already carry the numbers
If each case study slide already states the outcome stat, a separate "4 stats with a sentence each" slide is redundant and lengthens the deck without adding content. Keep the stats inside the cases.

### 8. Team contact block with titles and phone numbers
One short line at the bottom of the next-step slide is enough. Never add a full contact card with title, email, and phone — that belongs in the email thread that delivers the deck.

---

## Balance: summarizing is not minimizing

Cutting text is only half the job. A consultant is selling capabilities — the slide still has to feel substantial. Aim for **claim + one line of substance** in every card or cell, not claim alone.

Three failure modes to avoid when tightening text:

| Failure | What it looks like | Fix |
|---|---|---|
| **Orphan labels** | A "1." / "2." / "3." orange prefix with no text behind it | Delete the prefix shape too, not just the text that followed |
| **Orphan boxes** | A gray panel whose inner text you removed -- the empty rectangle still renders | Refill the panel with a complementary, short, selling deliverable, OR delete the panel shape entirely |
| **One-liner card** | A 4-inch card that holds a single 12-word sentence, leaving a sea of whitespace | Add one supporting line of substance (not filler) so the card reads as intentional |

Before saving, walk each card and ask: *if a reader landed on this card with no context, would they feel we have something to sell, or would they feel the slide is half-built?*

---

## Text density caps

| Cell / card type | Limit |
|---|---|
| Case study column (SITUATION, DATA INPUTS, SOLUTION, TIMELINE, OUTCOMES) | **One sentence** per column. Not two, not three. |
| Deliverable card | Title + **one line** of description. Not a paragraph. |
| Pilot quadrant (SYSTEMS, EFFORT, OUTPUTS, OUTCOME) | **One short sentence**. No 6-bullet lists. |
| Generic bullet list on a single slide | Max **4 bullets**, **one line** each |
| Eyebrow above a title | Max **6 words** |
| Section divider slide body | Title only. No body copy. |

---

## Checklist before saving any client deck

Run through this list mentally (or programmatically) before writing the PPTX:

- [ ] No meta-narration sentences
- [ ] No process/workshop labels
- [ ] No taxonomy tags under case titles
- [ ] No redundant subtitles under strong headlines
- [ ] No disclaimers / provenance footers
- [ ] No internal frameworks or audit checklists
- [ ] No stat roll-up slide if cases already carry the numbers
- [ ] No team contact blocks beyond one line
- [ ] Every case study cell ≤ one sentence
- [ ] Every deliverable card ≤ title + one line
- [ ] Every pilot quadrant ≤ one short sentence
- [ ] No bullet list with more than 4 items per slide

If a slide fails the check, cut before saving. Do not rely on the user to clean it later.

---

## Where the detail goes instead

Detail that was cut from the slide body must live somewhere. Route it to the right place:

| Cut content | New home |
|---|---|
| Walk-throughs, color commentary | Spoken pitch (document alongside the PPTX) |
| Process steps, timelines | Speaker notes inside the PPTX |
| Audit frameworks, checklists | Internal `pipeline/` folder, not `deliverables/` |
| Team bios, contacts | Email body or a dedicated capabilities document |
| Proof-point stats | Embedded in the relevant case study cell |

The pipeline should emit both the deck and a short spoken-pitch document when a client deck is produced.

---

## Why this exists

Jose edited Who Brew v2 on 2026-04-17, cutting it from 14 slides / 4.85 MB to 12 slides / 1.88 MB by stripping every item in the "never write" list above. His explicit note: *"I cleaned many of the texts you wrote because they were like notes for me, not for the client."* Remaining slides (cases, pilot, deliverables) still carried too much text and had to be summarized after the fact.

This module makes the rule part of BRIDGE's default behavior so future decks arrive already at the right density.

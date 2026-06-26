# Data

Four JSON files drive the app. They're fetched at runtime (and cached offline
by the service worker), not bundled.

| File | Holds | Notes |
| --- | --- | --- |
| `characters.json` | Gen-1 units | `marriageableWith` is the source of truth for marriage. |
| `children.json` | Gen-2 units | Each carries `fixedParentId`; everything else mirrors a character. |
| `pairings.json` | Couple narrative | Optional; keyed by sorted `id__id`. Compatibility does not depend on it. |
| `supports.json` | C/B/A/S summaries | Paraphrased arc summaries, never transcripts. |

## Current scope: Chrom-line vertical slice

This slice contains Chrom, his five marriage candidates (Sumia, Sully,
Maribelle, Olivia, female Robin), and two children (Lucina, Inigo). It exists to
validate the full flow end to end before the rest of the roster is entered.

Two deliberate, honest scoping choices:

1. **The five wives list only `chrom` in `marriageableWith`.** Within this slice
   the only first-generation male present is Chrom, so that is their *complete
   correct* partner list restricted to units that exist here. Their full husband
   pools are verified and added in Step 10 — which adds new units and edges, so
   no existing record needs rewriting.
2. **Lucina and Inigo carry their full, verified gen-2 marriage lists.** Their
   partners (Owain, Severa, Morgan, …) aren't in the slice yet, so
   `validate-data` reports them as TODO warnings — effectively a checklist of
   units still to add. Zero errors.

Run the check any time:

```bash
npm run validate-data            # incremental: TODOs are warnings
npm run validate-data -- --strict   # final/CI: any missing unit is an error
```

## Verification

Dense fields (marriage pools, class sets, inheritance) were cross-checked
against Serenes Forest and corroborating wikis. Where a detail genuinely varies
by the other parent (e.g. a child's second class set or inherited skills), the
`inheritanceNotes` say so and flag what to verify per pairing rather than
asserting a single answer.

## Assets

Portrait and sprite files are looked up by the character's `id` (the universal
join key) — `assets/portraits/{id}.webp` (or `.png`) and
`assets/sprites/{id}.png` — resolved at render time so they work under a GitHub
Pages subpath. There is no asset-path field in the data: `id` is the single
source of truth. Missing files fall back to styled placeholders; drop real art
into `public/assets/` to light them up.

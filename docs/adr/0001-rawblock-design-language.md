---
status: accepted
---

# Adopt the RawBlock brutalist design language

The app's previous look (CafeBlend: neumorphic soft shadows on warm cream, serif headlines) felt unpolished for a data-heavy ledger. We are replacing it wholesale with **RawBlock**, a brutalist system: pure black on pure white, no rounded corners (0px everywhere), no shadows, thick black borders (1/3/5px) plus scale contrast as the only hierarchy, uppercase tracked labels, and no decorative images or icons. Fonts: Archivo Black (headlines), Work Sans (body), Space Mono (numbers/mono). Blue (#0000FF) is reserved exclusively for hyperlinks.

## Considered Options

- **Pure RawBlock (chosen).** CSS-only, suits dense data tables and an Excel-like ledger (thick borders read as gridlines, mono numerals align). No custom art needed.
- **Rubber Hose Animation style.** Rejected: its essence is hand-drawn 1930s-cartoon characters/illustration, which we have no assets for and which fights data density.
- **Neobrutalism with hard offset shadows / cream paper background.** Rejected the shadows (RawBlock is strictly shadow-free) and the cream tint (chose pure #FFFFFF) to keep it uncompromising.

## Consequences

- Income/expense are distinguished by `+` / `−` signs in black, **not** green/red. The RawBlock status colours (green/orange/red) are reserved for genuine status states (e.g. errors), not for amount polarity.
- Hierarchy must be carried by border weight and type scale alone; reviewers should not reintroduce shadows or rounded corners "to soften" a screen — that is a deliberate non-goal.

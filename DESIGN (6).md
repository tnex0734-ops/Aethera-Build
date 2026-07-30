# ATHERA — Design System
Decoded from 4 refs: Plopp (blob-mascot task app), Praktika (neo-brutalist edu), EduWave (dark-mode learning), generic kids-progress app.

**Vibe:** playful + confident edtech. Illustration-driven. Card-based. Pill-everything. Greeting-first UX. Not corporate-flat.

---

## 1. Core Direction
- Personality: friendly, energetic, gamified. "Hello, [Name]" header pattern everywhere.
- Structure: colored card blocks over neutral base (dark charcoal OR cream), never flat white.
- Onboarding: full-bleed bold accent color + mascot/illustration + big rounded headline.
- Web adaptation note: refs are mobile. Port patterns to web as — sidebar nav (desktop) collapsing to bottom pill nav (mobile), card grids instead of horizontal scroll rows on wide viewports, greeting header stays top-left in a persistent topbar.

---

## 2. Color System

**Base (pick one per surface):**
- Charcoal (dark UI): `#14151A`
- Cream (light UI): `#F6F3E7`
- Ink/Navy (text, primary CTA on light): `#0D1B4C`

**Accent pool — rotate 2–3 max per screen, color-codes category/subject:**
- Lime `#8ED14F`
- Coral `#F26B5E`
- Mint `#8FE3C5`
- Amber `#F2D93C`
- Lavender `#C9B6F2`
- Sky (social/link) `#4C6FF2`

Rule: 1 dominant bg + rotating accents on cards only. Never accent-on-accent.

---

## 3. Typography
Font: geometric rounded sans (Poppins / Gilroy / Circular — pick one, ship all weights 400/500/600/700/800).

| Role | Size | Weight | Notes |
|---|---|---|---|
| Display | 32–40px | 700–800 | onboarding headlines, tight leading |
| H1 | 24–28px | 700 | screen titles ("Ready for focus?") |
| H2 | 18–20px | 600 | section labels ("Courses", "My courses") |
| Body | 14–16px | 400–500 | descriptions |
| Caption/meta | 12–13px | 500 | ratings, hours, tags |
| Stat number | 28–36px | 800 | standalone, label below in caption |

---

## 4. Shape & Radius
- Cards: 20–28px
- Buttons / tags / nav: full pill (999px) — dominant motif across all 4 refs
- Inputs: 16–18px, soft-fill, no visible border
- Decorative onboarding shapes: organic blobs, large radius circles

---

## 5. Elevation
- Mostly flat. Depth via color contrast + card stacking/peek (see EduWave course stack), not shadow.
- Shadow reserved for: floating bottom nav, swipe-unlock bar.

---

## 6. Components

**Buttons**
- Primary: solid pill, navy or dark accent, white bold label
- Secondary: outline pill, accent-color border + text, transparent fill
- Social login: brand-colored solid pill (FB blue, Google red/white), icon + label

**Tags/Pills**
- Full-radius, colored bg, dark text, used for category filters, status badges, "Basic Member" type labels

**Cards**
- Colored bg block per item (not white card + colored icon — the *card itself* is colored)
- Illustration/icon top or side
- Meta row bottom: rating ★, duration/hours pill
- Save/heart icon top-right corner
- CTA either inline text link ("Start Learning ▶") or full-width pill at card bottom

**Stat cards**
- Icon chip + big bold number + caption label, 2-col grid

**Progress**
- Segmented multi-color horizontal bar (per-period breakdown) OR single % ring
- "Progress: 76%" inline next to name in header

**Bottom/side nav**
- Floating pill-shaped bar, icon-only, active item = filled dark circle behind icon

**Avatar**
- Circular, illustrated/emoji-style face OR photo

**Inputs**
- Soft-fill rounded rect, muted placeholder text, stacked vertical, no borders

---

## 7. Illustration Style — pick ONE as primary, other as secondary
**A. Blob-mascot** (Plopp): rounded creature, oversized white eyes + black pupils, minimal dot mouth. → use for empty states, onboarding, error states.

**B. Flat line-art character** (Praktika/EduWave): 2-tone fill (accent + white outline), textured/speckled shading, mid-action pose. → use for course thumbnails, hero illustrations, category art.

**Recommendation for ATHERA:** B for content/course cards (scales better across many subjects), A reserved for onboarding + empty-state moments only — keeps mascot special, not overused.

---

## 8. Iconography
Line icons, 1.5–2px stroke, rounded caps/joins, single color, sit inside colored chip when in nav/stat contexts.

---

## 9. Layout
- Persistent topbar: avatar + "Hello, [Name]" + progress% + notification bell
- Content: horizontal-scroll card rows (mobile) → multi-col grid (desktop), same card component
- Filter pills row directly under header, horizontally scrollable
- Screen padding: 16–20px mobile, 32–48px desktop margins

---

## 10. Motion
- Card/button tap: scale to 0.97
- Button press: darken bg 8–10%
- Page transitions: fade/slide, <250ms
- Stat numbers count up on load
- Progress bars animate fill on mount

---

## 11. Mode Variants
- **Dark (primary, in-app/dashboard):** charcoal `#14151A` bg, accent-colored cards pop against it, cream/white text
- **Light (onboarding/marketing):** cream `#F6F3E7` bg, navy text, same accent palette on cards
- Full-bleed single-accent bg (lime/yellow) allowed only for onboarding/hero moments, not dashboard

---

## 12. Accessibility
- Navy/black text on light accents (amber, mint, lavender, lime)
- Cream/white text on dark accents (coral, navy, sky) and charcoal bg
- Min tap target 44px — pills satisfy via padding, verify icon-only nav items too

---

## 13. CSS Tokens
```css
:root {
  /* base */
  --ink: #0D1B4C;
  --charcoal: #14151A;
  --cream: #F6F3E7;

  /* accents */
  --lime: #8ED14F;
  --coral: #F26B5E;
  --mint: #8FE3C5;
  --amber: #F2D93C;
  --lavender: #C9B6F2;
  --sky: #4C6FF2;

  /* radius */
  --radius-card: 24px;
  --radius-pill: 999px;
  --radius-input: 18px;

  /* type */
  --font-family: 'Poppins', sans-serif;
  --font-display: 800 36px/1.1 var(--font-family);
  --font-h1: 700 26px/1.2 var(--font-family);
  --font-h2: 600 19px/1.3 var(--font-family);
  --font-body: 500 15px/1.4 var(--font-family);
  --font-caption: 500 12px/1.3 var(--font-family);
  --font-stat: 800 32px/1 var(--font-family);

  /* motion */
  --ease-tap: 120ms ease-out;
  --ease-page: 250ms ease-in-out;
}
```

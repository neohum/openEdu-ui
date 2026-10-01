# DESIGN.md — UI/UX system for openEdu-ui

> The single source of truth for visual + interaction conventions.
> Consult this before touching view code.

## Tokens

Source of truth: `packages/tokens/src/tokens.json` (DTCG format), built to
`packages/tokens/dist/tokens.css` (`pnpm --filter @openedu/tokens build`).
Components use only these variables — no literals.

| Token (CSS variable)                | Light       | Dark        | Use                      |
| ----------------------------------- | ----------- | ----------- | ------------------------ |
| `--color-bg`                        | `#f8fafc`   | `#0b0c0f`   | page background          |
| `--color-surface`                   | `#ffffff`   | `#14161b`   | cards, panels            |
| `--color-surface-sunken`            | `#f1f5f9`   | `#0f1115`   | inset areas              |
| `--color-fg`                        | `#0f172a`   | `#e7e9ee`   | primary text             |
| `--color-fg-muted`                  | `#475569`   | `#9aa0ad`   | secondary text           |
| `--color-border`                    | `#e2e8f0`   | `#262a33`   | dividers                 |
| `--color-accent` / `-accent-fg`     | `#2f4fd0` / `#ffffff` | `#8b9bff` / `#0b0c0f` | interactive / focus |
| `--color-danger` / `-danger-fg`     | `#b91c2b` / `#ffffff` | `#ff6b78` / `#0b0c0f` | destructive |
| `--color-success`                   | `#157347`   | `#4ade80`   | success                  |
| `--radius-sm / md / lg / full`      | `6 / 10 / 16 / 9999px` | same | inputs / cards / dialogs / pills |
| `--space-unit`, `--space-1..12`     | `4px`, `unit × n` | same | spacing grid (4/8pt)     |
| `--font-size-xs … 4xl`              | `0.75 … 2.25rem × --font-scale` | same | type scale |
| `--font-sans`                       | system stack + `"Apple SD Gothic Neo", "Noto Sans KR"` | same | body & UI (Korean-capable) |
| `--font-mono`                       | ui-monospace | same       | code, IDs                |

Rules enforced by tests: no pure black, and fg / fg-muted / accent text meet
WCAG AA (4.5:1) on their backgrounds in both themes. Dark mode follows
`prefers-color-scheme` and can be forced with `data-theme="light|dark"`.

## Surfaces

Set `data-surface="board|desktop|mobile|print"` on `<html>` (CSS:
`@openedu/tokens/surfaces.css`). A surface only overrides scale variables —
components never branch on it.

| Surface   | `--space-unit` | `--font-scale` (body) | `--target-min` | Notes |
| --------- | -------------- | --------------------- | -------------- | ----- |
| `desktop` | 4px            | 1 (16px)              | 44px           | default |
| `mobile`  | 4px            | 1 (16px)              | 48px           | |
| `board`   | 8px            | 2.4 (≈28.8pt)         | 64px (80px comfortable) | provisional values: classroom distance legibility, not yet verified against literature |
| `print`   | 4px            | 0.9 (≈10.8pt)         | n/a            | forces light, high-contrast colors, no shadows |

## Components — contract

### Button
- variants: `primary | secondary | ghost | danger`
- sizes: `sm | md` (md is default)
- always reachable by keyboard; visible focus ring `2px solid var(--color-accent)`
- loading state replaces children with spinner — width stays stable

### Input
- label is **never** placeholder-only
- error renders below in `--color-danger`, with `aria-describedby` wired

### Card
- padding `--space-4`, radius `--radius-md`
- surface color on `--color-bg`; separation by surface contrast first, 1px `--color-border` only when needed

## Language & encoding

- pages declare `<meta charset="utf-8">` and default to `<html lang="ko">`
- UI copy defaults to Korean
- Korean headings/labels use `word-break: keep-all` so words don't split mid-eojeol
- the `--font-sans` stack always carries Korean-capable fallbacks — never ship a
  Latin-only webfont without them

## Layout rules

- 8px baseline grid (`--space-2`)
- content max-width `1180px`
- side padding clamps `clamp(16px, 4vw, 32px)`

## Interaction rules

- destructive actions confirm (`danger` variant + 1.5s hold-to-confirm OR modal)
- toasts top-right, 4s, auto-dismiss; never use for errors that block work
- forms validate on blur, never on each keystroke

## Assets — icons & images

Default assets are a bug. Anything visual that ships — favicon, logo, icons,
empty-state illustrations, OG/social images, placeholder imagery — is
**generated for this project** in its design language, never left as a
framework default or pulled from a generic pack.

- **Icons:** Phosphor Icons (MIT) Regular (`ph ph-*`) is the single icon
  family; `currentColor` so tokens drive the color. Never mix icon sets or use
  ad-hoc inline SVG icons.
- **Favicon / logo:** derived from the openEdu-ui identity and
  `--color-accent` on `--color-bg`; author the SVG first, export raster sizes
  from it.
- **Illustrations, empty states, OG images:** composed from the token palette
  above — no stock photos, no third-party mascots, no watermarked placeholders.

### Baseline set — generated by default for any web service / app

If openEdu-ui serves a web UI or ships as an app, this set exists before
first deploy:

| Asset                       | Source of truth                                    |
| --------------------------- | -------------------------------------------------- |
| `favicon.svg` (+ `.ico`, 32/180/192/512 PNG) | logo mark, `--color-accent` on `--color-bg` |
| `logo.svg` (mark + wordmark variants)        | project identity, token palette         |
| `apple-touch-icon.png` (180×180)             | exported from `favicon.svg`             |
| PWA/manifest icons (192/512)                 | exported from `favicon.svg`             |
| OG/social image (1200×630)                   | logo + token palette composition        |

All rasters are exported from the authored SVGs — the SVG is the source file
and lives in the repo alongside the exports.

## Don'ts

- no inline color literals in components — use tokens
- no `<div onClick>` — use `<button>` or `<a>`
- no emoji in product UI unless a designer signs off
- no default/framework favicons, sample logos, or stock placeholder imagery —
  every shipped asset is generated for this project (see **Assets**)

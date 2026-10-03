# Shared page style guide

[Documentation index](README.md) · [Project guide](project.md)

This guide describes the visual and structural rules shared by the public pages. The source of truth is [`src/styles/site.css`](../src/styles/site.css) and the existing documents in [`src/pages/`](../src/pages/). Keep new pages consistent with those sources; update this guide when the shared design changes. Edit source files, never generated `dist/` files. Public interface text is German.

## Structure used on every page

- Set `<html lang="de">`, a viewport meta tag, a page-specific description and title, the SVG favicon, and the `theme-color` meta tag (initial light value `#f7f8f5`). Use relative `assets/...` references so pages work under a project path.
- Load `assets/js/theme.js` before `assets/styles/site.css` so the selected theme applies before paint. Load `assets/js/site.js` and any page scripts with `defer`. Load page-specific CSS after `site.css`.
- Start the body with `<a class="skip-link" href="#main-content">Zum Inhalt springen</a>`. Give the single `<main>` `id="main-content"` and class `wrap`.
- Keep the same sticky `.site-header`, `.brand`, `.theme-toggle`, `.menu-toggle`, and `.site-nav` on every page. The active navigation link uses `aria-current="page"`. The mobile menu depends on `data-menu-toggle`, `aria-controls="site-navigation"`, and the matching navigation ID.
- End with the shared `.site-footer > .wrap.footer-inner` markup. Shared header, navigation, and footer are repeated in each HTML file, so update every page when changing them.

## Layout and typography

The shared `.wrap` has a maximum width of `1160px`, centered with `32px` side gutters on wide screens. The body uses the system sans-serif stack at `15px/1.65`. Headings use a tighter `1.15` line-height and restrained weights; descriptions and secondary text use `--subtle`. Use `.eyebrow` for small uppercase section labels. Page-specific grids and diagrams should fit inside the shared width without horizontal overflow.

The homepage uses `.hero`, `.collection`, `.animation-grid`, cards, and `.learning-note` from `site.css`. Learning pages use `<main class="wrap page-main">` with `.breadcrumb`, `.page-heading` (eyebrow, one `h1`, summary, and decorative `.page-number`), the interactive content, an optional `.animation-note`, and `.page-pagination`. The five timed animations use `.animation-surface` around their controls and SVG. The DNA model and exercise have their own content layout inside the same learning-page frame; do not force homepage or page-specific content into an animation surface.

Use the shared `.btn`, `.btn-primary`, `.form-select`, `.form-label`, and `.viz-controls` for standard animation controls. Custom controls should match their sizing, borders, and focus treatment. Shared surfaces use `--surface`, a `1px` `--line` border, and usually a `14px` radius; page-specific panels may vary within that visual language. Keep descriptions, status text, and navigation subordinate to the main page title and interactive content.

## Colors and themes

Use the semantic variables in `site.css`, rather than hard-coded light colors, for page backgrounds, cards, text, borders, controls, and links. Key tokens are `--paper` (page), `--surface`/`--background` (panels and controls), `--ink`/`--foreground` (primary text), `--subtle`/`--muted-foreground` (secondary text), `--line`/`--border`, `--accent`, `--accent-soft`, `--accent-hover`, `--hover-surface`, and `--primary-ink` (text on accent-filled controls). The shared `--blue`, `--orange`, `--green`, `--purple`, `--red`, `--yellow`, and `--viz-series-*` variables are for diagrams and meaning-coded data, not general button branding.

In light mode, the page is pale `#f7f8f5` with white surfaces, dark green text, and green accent `#285f4c`. In dark mode, `:root[data-theme='dark']` changes the page to `#121212`, surfaces to `#1e1e1e`, text to near-white, borders to gray, and the accent to neutral `#d4d4d4`. Primary buttons and selected states must therefore follow `--accent` and `--primary-ink`; they should not stay green in dark mode. If a component needs extra colors, define page-local variables with both light and `[data-theme='dark']` values, and keep labels and diagrams legible in each theme. Avoid overriding shared tokens just to style one page.

[`src/js/theme.js`](../src/js/theme.js) sets `data-theme` on the root element. It honors the saved `genetik-theme` choice, otherwise follows the system preference; the theme toggle updates its pressed state. Check both explicit themes and the system default when adding styles. Shared print CSS restores light colors.

## Responsive, accessible, and print behavior

- At widths up to `979px`, `.wrap` has `22px` gutters, the menu collapses, page numbers hide, and the homepage card grid has two columns. At `620px` and below, gutters become `16px`, navigation has two columns when opened, homepage cards stack, and learning-page headings and surfaces shrink. At `355px` and below, gutters become `12px`. Make page-specific layouts stack and keep controls usable at these widths.
- Keep the skip link, semantic landmarks, accessible names, one page `h1`, visible focus, and native buttons/selects. Shared links, buttons, and selects have a `3px` `:focus-visible` outline; new controls need an equivalent keyboard focus state. Preserve the responsive menu's Escape and outside-click behavior.
- Respect `prefers-reduced-motion: reduce`. The shared stylesheet removes transitions and animations and disables smooth scrolling; page scripts must also avoid forced motion where it matters. Do not rely on color alone for meaning in diagrams or feedback.
- Print styles hide the header, footer, pagination, hero actions, and animation controls, and remove the animation-surface frame. Page-specific print rules should keep educational content readable.

When changing shared styles, check the homepage and at least one learning page at desktop and mobile sizes in light and dark mode. For a page-specific change, check that page in all four combinations, plus keyboard focus and narrow-width overflow. Run the relevant build and Playwright checks described in the [testing guide](testing.md).

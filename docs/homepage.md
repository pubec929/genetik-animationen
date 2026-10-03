# Homepage

[Documentation index](README.md) · Public URL: `index.html` (also `/` in the preview)

## Purpose and navigation

The homepage introduces the collection and gives learners access to all six learning pages and the exercise. **Animationen entdecken** scrolls to the collection at `#animationen`. **Vom Gen zum Polypeptid** opens the eukaryotic overview.

The collection has cards for DNA replication, mRNA translation, RNA splicing, prokaryotic protein synthesis, eukaryotic protein synthesis, and the DNA model. The exercise has a separate **Interaktive Übung starten** link below the cards. Header links provide direct navigation; the mobile menu and theme switch use shared scripts.

## Files

- [HTML](../src/pages/index.html): hero, cards, exercise invitation, and teaching notes.
- [Shared stylesheet](../src/styles/site.css): homepage layout as well as the shared site interface.
- [Images](../src/assets/images/): `genexpression.svg` for the hero and topic illustrations for the cards.
- [Navigation](../src/js/site.js) and [theme](../src/js/theme.js): the only application scripts needed by this page.

The page has no page-specific animation script or learner input. Card images are decorative within links whose text identifies the destination; the hero illustration has descriptive alternative text.

## Maintenance and validation

When adding a topic, update the card destination, description, image, collection count, and related navigation. The current count of six includes the interactive DNA model; the exercise is presented separately. Keep `#animationen` stable because other pages link to it.

Run `npm test -- tests/e2e/theme.spec.js` for shared layout and navigation checks. DNA and exercise tests also enter their pages through homepage links. Build checks validate public page links and assets. Manually inspect card wrapping, keyboard focus, the mobile menu, and both themes.

# DNA model

[Documentation index](README.md) · Public URL: `dna-modell.html`

The public page is built from `src/pages/dna-modell.html`. Run `npm run dev` and open <http://127.0.0.1:4173/dna-modell.html>.

The page uses the site's shared learning-page heading, number **06 / 06**, and previous/next navigation. The two-column model and explanation area stacks on small screens.

## Explore the model

The page opens on a 20-base-pair atomic ball-and-stick double helix. Drag with a mouse or one finger to rotate it, or focus the drawing and use the arrow keys. **Drehung zurücksetzen** or **R** restores its orientation. The zoom slider, **+ / −** buttons, mouse wheel, two-finger pinch, and **+ / −** keys change the detail level. **0** returns to the helix. The **Doppelhelix** and **Bausteine** buttons jump to either end. Reduced-motion preferences make button zoom immediate.

At the close end, the model becomes an eight-base-pair schematic with selectable bases, sugars, phosphates, and hydrogen bonds. Select a component or use the legend to open its explanation and structural formula. The detail panel can show a free base or sugar, the complementary base, and a highlighted nucleotide. Keyboard users can move between schematic components with arrows, **Home**, and **End**. **Stränge auseinanderziehen** separates the schematic strands and hides their hydrogen bonds while leaving the sugar-phosphate backbones connected. **Zurücksetzen** restores the paired helix, initial orientation, and overview.

The zoom transition is a teaching device: it reveals a separate schematic close-up, not a physical unwinding of DNA. The whole-base colors and shapes are symbolic. The atom colors distinguish C, N, O, and P; hydrogen atoms are omitted.

## Source files

| File | Purpose |
| --- | --- |
| [`src/pages/dna-modell.html`](../src/pages/dna-modell.html) | Page markup, controls, accessible description, and scientific sources |
| [`src/js/animations/dna-modell.js`](../src/js/animations/dna-modell.js) | Atomic templates, projection, rotation, zoom, selection, and explanations |
| [`src/styles/animations/dna-modell.css`](../src/styles/animations/dna-modell.css) | Model layout, responsive behavior, and theme colors |
| [`scripts/data/dna-1bna.pdb`](../scripts/data/dna-1bna.pdb) | Bundled reference structure used for the atom templates |
| [`tests/e2e/dna-modell.spec.js`](../tests/e2e/dna-modell.spec.js) | Interaction and responsive regression tests |

The renderer uses local heavy-atom templates from [RCSB PDB 1BNA](https://www.rcsb.org/structure/1BNA) for A–T and G–C pairs and repeats them to create an idealized 20-pair illustration. It draws atoms, covalent bonds, and hydrogen-bond guides into one SVG. No molecular-data request is made at runtime. The illustration is not an experimentally determined 20-pair structure or a molecular simulation; its spacing and unfolding are chosen for teaching clarity. The eight-pair schematic uses a separate example sequence. The page's **Über das Modell & Quellen** disclosure explains these limits to learners.

The root-level `dna_model.html` is the standalone design reference. Changes for the published site belong in `src/`; the build does not copy the reference file.

## Validate changes

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/sbin/chromium npm test -- tests/e2e/dna-modell.spec.js
```

The browser checks cover the initial helix, rotation and reset, zoom, keyboard controls, chemistry, strand separation, both themes, and mobile layout. The visual suite captures both ends of the zoom, a transition state, separated strands, and a chemistry panel. Review these images manually for strand winding, label clarity, clipping, and biological accuracy; interaction checks alone cannot prove those properties. See [test setup](testing.md) for browser installation and snapshot guidance.

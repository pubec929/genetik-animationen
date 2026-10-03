# DNA model

[Documentation index](README.md) · Public URL: `dna-modell.html`

The public page is `dna-modell.html`. Run `npm run dev` from the repository root and open <http://127.0.0.1:4173/dna-modell.html>.

## Controls

- Move the zoom slider toward **Doppelhelix** for the atomic overview or **Details** for the interactive schematic. The page starts in the detail view.
- Use **+ / −**, the mouse wheel over the model, or arrow keys while the slider has focus to change zoom.
- Select a base, sugar, or phosphate in the detail view or its legend to open an explanation. **Escape** closes the detail panel.
- **Stränge auseinanderziehen** separates the schematic strands. Selecting a component or changing separation returns to the detail view.
- **Zurücksetzen** restores paired strands, closes the panel, and returns zoom to the detail view.

Zoom animates scale and opacity over 420 ms. With reduced motion enabled in the operating system or browser, the view updates without the animation.

## Files and rendering

| File | Purpose |
| --- | --- |
| [`src/pages/dna-modell.html`](../src/pages/dna-modell.html) | Controls, accessible descriptions, and scientific sources |
| [`src/js/animations/dna-modell.js`](../src/js/animations/dna-modell.js) | SVG rendering, zoom, selection, and explanations |
| [`src/styles/animations/dna-modell.css`](../src/styles/animations/dna-modell.css) | Layout, themes, and model controls |
| [`src/js/animations/dna-helix-data.js`](../src/js/animations/dna-helix-data.js) | Generated atomic coordinates and covalent bonds |
| [`scripts/build-dna-helix.py`](../scripts/build-dna-helix.py) | Offline generator and connectivity checks |
| [`scripts/data/dna-1bna.pdb`](../scripts/data/dna-1bna.pdb) | Bundled source coordinates |

The data script loads before the renderer and defines `window.DNA_HELIX_DATA`. Each atom stores `[element, x, y, z]` in ångströms; each bond stores two atom indices. All data is served locally, with no molecular-data request at runtime.

`renderHelix()` projects the coordinates into SVG. Atoms and short bond sections are sorted by camera depth to show occlusion. The projection inverts the molecular y coordinate because SVG y increases downward; preserve that inversion when changing the camera to avoid mirroring the helix. Atomic colors are gray for carbon, blue for nitrogen, red for oxygen, and yellow for phosphorus.

## Source and scope

The overview is an idealized 30-base-pair extension derived from [RCSB PDB structure 1BNA](https://www.rcsb.org/structure/1BNA). The generator fits a rotation and translation between overlapping terminal pairs, then repeats a ten-pair block three times. It restores the terminal phosphate connection to keep the backbone continuous.

The extended molecule is an illustration, not an experimentally determined 30-pair structure or a molecular simulation. Hydrogen atoms and solvent are omitted; the displayed sticks represent covalent bonds. The eight-pair detail view uses a separate teaching sequence. Zoom blends between these representations rather than mapping each overview atom onto a schematic component.

## Regenerate the atomic data

Normal builds use the checked-in data. To change or regenerate it, use Python 3 with NumPy. For an isolated environment, run from the repository root:

```sh
python3 -m venv /tmp/genetik-dna-venv
/tmp/genetik-dna-venv/bin/python -m pip install numpy
/tmp/genetik-dna-venv/bin/python scripts/build-dna-helix.py
npm run build
```

The generator overwrites `src/js/animations/dna-helix-data.js`. Its assertions require exactly two connected strands and covalent bond lengths between 1 and 2.5 Å. The current output contains 1,230 atoms and 1,378 bonds, with 615 atoms per strand. Commit regenerated data alongside generator or source-coordinate changes.

## Validate changes

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/sbin/chromium npm test -- tests/e2e/dna-modell.spec.js
```

Omit the environment variable when using Playwright's installed Chromium. See [test setup](testing.md) for installation details.

Review the screenshots under `test-results/` in both themes and viewport sizes. Check helix shape, strand continuity, front/back overlap, clipping, and the transition to the detail view. Compare the atomic overview with the repository's `dna_model.png` reference. Automated interaction tests cannot establish biological or visual accuracy.

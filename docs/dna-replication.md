# DNA replication

[Documentation index](README.md) · Public URL: `dna-replikation.html`

## Learning sequence

The page follows a replication fork in a moving view of a bacterial model. It contrasts continuous leading-strand synthesis with repeated lagging-strand work: primer formation, Okazaki-fragment extension, polymerase release, replacement of an older primer, ligation, and movement to the next primer.

Six selectable proteins explain the drawing: helicase, primase, DNA polymerase III, the sliding clamp, DNA polymerase I, and ligase. Their short symbols also identify them in the scene. Selecting a protein again restores the live process explanation.

## Controls and source

Use **Pause / Weiterlaufen** and **Tempo** as described in [shared animation behavior](animations.md). The moving fork is automatic; there is no manual camera or zoom control on this page.

| Source | Role |
| --- | --- |
| [HTML](../src/pages/dna-replikation.html) | Scene container, controls, and page navigation |
| [JavaScript](../src/js/animations/dna-replikation.js) | Fork drawing, protein definitions, and repeated synthesis cycle |
| [CSS](../src/styles/animations/dna-replikation.css) | Page-specific scene and control presentation |

The root is `#dna-continuous`; scene and control IDs use `dc-`. The `protein` definitions supply the selectable explanations. Playback uses a 12-second repeating lagging-strand cycle.

## Teaching boundaries and review

The polymerase names and roles belong to the bacterial model. Lengths, motion, and reaction timing are schematic. The explanation notes that RNase H assists primer removal but is not drawn. Preserve strand-direction labels and the distinction between opening base pairing and cutting a backbone when editing the figure.

Run `npm test -- tests/e2e/animations.spec.js --grep dna-replikation.html`. Check all six protein explanations, a complete fragment cycle, pause/resume, all speeds, resizing, and both themes. The stage fixtures cover primer formation through ligation and the next primer; also visually check the leading/lagging-strand geometry.

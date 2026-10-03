# Prokaryotic protein synthesis

[Documentation index](README.md) · Public URL: `proteinbiosynthese-prokaryoten.html`

## Learning sequence

A continuous bacterial scene shows transcription and translation occurring together. RNA polymerase starts at the promoter, mRNA emerges, and ribosomes begin translating while that RNA is still being transcribed. After transcription ends, translation continues. Two ribosomes release chains from the same message, illustrating repeated use of one mRNA.

The **Erklärung** dropdown provides eight explanations. Choose **Zum aktuellen Ablauf** to restore the description of the current stage. The term choice changes the explanation without seeking or pausing the scene.

## Controls and source

Use **Pause / Weiterlaufen** and **Tempo** as described in [shared animation behavior](animations.md). The cycle lasts 56 presentation seconds at normal speed.

| Source | Role |
| --- | --- |
| [HTML](../src/pages/proteinbiosynthese-prokaryoten.html) | Scene, playback controls, term selector, and navigation |
| [JavaScript](../src/js/animations/proteinbiosynthese-prokaryoten.js) | Timeline, term definitions, RNA path, ribosomes, and chains |
| [CSS](../src/styles/animations/proteinbiosynthese-prokaryoten.css) | Page-specific presentation |

The root is `#protein-one-scene`; IDs use `po-`. `status()` supplies the stage text, and `definitions` supplies the selectable terms. Keep the RNA path continuous when changing polymerase and ribosome positions.

## Teaching boundaries and review

This is a bacterial example, not a universal depiction of all prokaryotes. The page notes differences in archaea and simplifies sequence lengths, rates, and protein folding. Compare it with the [eukaryotic overview](eukaryotic-protein-synthesis.md) to show how a nucleus changes the spatial organization of expression.

Run `npm test -- tests/e2e/animations.spec.js --grep proteinbiosynthese-prokaryoten.html`. Review the overlap of transcription and translation, continued translation after polymerase departure, both peptide releases, and the next cycle. Check that ribosomes remain attached to the same mRNA and that dropdown explanations work while paused and running.

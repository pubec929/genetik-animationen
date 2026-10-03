# mRNA translation

[Documentation index](README.md) · Public URL: `mrna-translation.html`

## Learning sequence

This detailed ribosome view uses the short example `AUG GCU UUU GGU UAA`. The displayed peptide is Met–Ala–Phe–Gly; the final stop codon adds no amino acid.

The animation shows initiation at AUG in the P site, codon recognition in the A site, peptide-bond formation, translocation, departure of the empty tRNA through the E site, and termination at UAA. A release factor replaces the incoming tRNA at termination, followed by peptide release and ribosome recycling.

Selectable explanations cover the E, P, and A sites, tRNA/anticodon pairing, peptide bonds, and stop codons. Select an active explanation again to return to the current stage.

## Controls and source

Use **Pause / Weiterlaufen** and **Tempo**; see [shared animation behavior](animations.md). A full cycle is 55 presentation seconds at normal speed.

| Source | Role |
| --- | --- |
| [HTML](../src/pages/mrna-translation.html) | Scene, controls, explanations, and navigation |
| [JavaScript](../src/js/animations/mrna-translation.js) | Example codons, amino-acid data, stage calculation, and SVG drawing |
| [CSS](../src/styles/animations/mrna-translation.css) | Page-specific presentation |

The root is `#translation-view`; IDs use `tr-`. `stateAt()` determines the phase from elapsed time. The `codons` and `amino` arrays must remain consistent if the teaching example changes; stage timing also assumes the current peptide length.

## Teaching boundaries and review

This is a deliberately short eukaryotic example, with schematic dimensions and timing. It does not model arbitrary learner-entered sequences; use the [exercise](protein-synthesis-exercise.md) for that interaction.

Run `npm test -- tests/e2e/animations.spec.js --grep mrna-translation.html`. Review initiation, repeated elongation steps, release-factor entry, and recycling. In screenshots, verify the A/P/E positions, antiparallel codon/anticodon labels, the direction of ribosome movement, and that the stop codon produces no peptide bead.

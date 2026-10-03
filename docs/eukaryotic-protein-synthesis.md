# Eukaryotic protein synthesis

[Documentation index](README.md) · Public URL: `proteinbiosynthese-eukaryoten.html`

## Learning sequence

The scene follows one RNA from nuclear transcription to a released cytoplasmic polypeptide. It shows transcription starting, pre-mRNA growth, 5′ capping during transcription, formation of the 3′ end, poly(A)-tail addition, intron removal, mature mRNA export through a nuclear pore, start-codon scanning, elongation, and peptide release.

The **Erklärung** dropdown provides nine explanations covering the major processes and the model's assumptions. Choose **Zum aktuellen Ablauf** to follow the stage description again. Use the [splicing page](rna-splicing.md) and [translation page](mrna-translation.md) for closer views of those processes.

## Controls and source

Use **Pause / Weiterlaufen** and **Tempo**; see [shared animation behavior](animations.md). A full cycle is 77 presentation seconds at normal speed.

| Source | Role |
| --- | --- |
| [HTML](../src/pages/proteinbiosynthese-eukaryoten.html) | Scene, controls, term selector, and navigation |
| [JavaScript](../src/js/animations/proteinbiosynthese-eukaryoten.js) | Timeline, processing, RNA export path, and translation |
| [CSS](../src/styles/animations/proteinbiosynthese-eukaryoten.css) | Page-specific presentation |

The root is `#eukaryoten-expression`; IDs use `eu-`. `status()` defines stage text; `definitions` contains term explanations. The export curve carries every RNA point through the same pore. Preserve this continuity when editing movement.

## Teaching boundaries and review

The example is an intron-containing, polyadenylated gene with two exons and one intron. Processing steps are spread out for visibility; the model notes that these processes can overlap in cells. Exons include untranslated regions, and the cap, untranslated regions, and poly(A) tail are not translated. The sequence and timing are schematic.

Run `npm test -- tests/e2e/animations.spec.js --grep proteinbiosynthese-eukaryoten.html`. Review capping during transcription, intron removal, the complete export path, scanning before elongation, and peptide release. Check that DNA stays in the nucleus and that the same RNA remains visually continuous throughout export. Compare with the [bacterial overview](prokaryotic-protein-synthesis.md).

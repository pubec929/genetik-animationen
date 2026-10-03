# RNA splicing

[Documentation index](README.md) · Public URL: `rna-spleissen.html`

## Learning sequence

The page follows one intron between two exons. Its stages show the initial pre-mRNA, recognition of splice signals, spliceosome assembly and RNA folding, the first splicing reaction and lariat formation, the second reaction joining the exons, and the shorter spliced RNA.

The repeat starts a new pre-mRNA example. It does not insert the removed intron back into mature RNA. Seven explanation buttons cover pre-mRNA, exon/intron, splice signals, the spliceosome, base pairing, the lariat, and mature mRNA.

## Controls and source

Use **Pause / Weiterlaufen**, **Tempo**, and the explanation buttons; see [shared animation behavior](animations.md). The cycle lasts 40 presentation seconds at normal speed.

| Source | Role |
| --- | --- |
| [HTML](../src/pages/rna-spleissen.html) | Scene, controls, explanations, and navigation |
| [JavaScript](../src/js/animations/rna-spleissen.js) | `stages`, term definitions, RNA geometry, and playback |
| [CSS](../src/styles/animations/rna-spleissen.css) | Page-specific presentation |

The root is `#rna-splicing-view`; IDs use `sp-`. Update the stage descriptions and geometric transitions together when changing the sequence. Background references are recorded in the script comments.

## Teaching boundaries and review

The page represents one typical intron with GU/AG signals and a branch-point A. Cap formation and the poly(A) tail are omitted here. Proteins and snRNAs are symbols, not individual structural models of every spliceosomal component. The [eukaryotic overview](eukaryotic-protein-synthesis.md) places processing in the broader expression sequence.

Run `npm test -- tests/e2e/animations.spec.js --grep rna-spleissen.html`. Verify all seven explanations and the full cycle. Visually check that exon order is preserved, the intron leaves as a lariat, the joined RNA becomes shorter, and the repeat reads as a new example. Also review labels while paused on a narrow screen.

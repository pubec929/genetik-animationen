# Transcription and translation exercise

[Documentation index](README.md) · Public URL: `proteinbiosynthese-uebung.html`

## Learner workflow

The exercise keeps the DNA template, both answer steps, live previews, and feedback inside one panel.

1. Read the displayed DNA template from 3′ to 5′, left to right.
2. Enter the entire complementary mRNA in one text area, from 5′ to 3′. Lowercase letters and whitespace are normalized for checking; valid RNA bases are A, U, G, and C. The page groups the sequence into codons.
3. Choose an amino acid or **Stopp** for each codon using the selectors. Expand **Codontabelle öffnen** for the standard-code reference.
4. Select **Lösung prüfen** for feedback on both transcription and translation. **Musterlösung ansehen** becomes available after checking.

**Eingaben leeren** resets the current task. **Andere Aufgabe** cycles through three fixed tasks and clears previous answers. Reloading starts the exercise over; answers are held in page memory.

## Live previews and feedback

Each entered base appears on a horizontally scrollable mRNA backbone. New valid bases move down from above unless reduced motion is requested. Their silhouettes follow the DNA model, with U replacing T and ribose identified in the RNA legend.

Amino-acid choices build a connected, colorful peptide immediately; the same amino acid keeps the same color. Gaps are shown as unknown positions, and a stop choice ends the displayed chain without adding a bead. The preview reflects learner choices before correctness is checked.

Validation reports missing or invalid codons, incorrect complements, use of T in RNA, and incorrect sequence length. Translation is graded against the expected answer. When a wrong amino acid correctly translates the learner's mistaken mRNA, feedback directs attention to the transcription error. Editing after a check clears the previous feedback so it does not describe outdated answers.

## Source and teaching scope

| Source | Role |
| --- | --- |
| [HTML](../src/pages/proteinbiosynthese-uebung.html) | Unified panel, form, hints, previews, and feedback regions |
| [JavaScript](../src/js/exercises/proteinbiosynthese-uebung.js) | `tasks`, standard genetic code, validation, and SVG previews |
| [CSS](../src/styles/exercises/proteinbiosynthese-uebung.css) | Responsive answer fields, strands, and feedback |

Tasks are intron-free examples whose first triplet yields AUG and whose last triplet yields a stop codon. The code table uses NCBI standard code table 1; its source link is displayed with the codon table. This exercise does not simulate splicing or search an arbitrary sequence for an open reading frame.

## Maintenance and validation

When changing `tasks`, preserve the template orientation and start/stop assumptions, and add independent expected answers to `tests/e2e/exercise.spec.js`. If changing nucleotide shapes, check consistency with the [DNA model](dna-model.md).

```sh
npm test -- tests/e2e/exercise.spec.js
```

Cover correct answers, all three stops, missing and invalid inputs, extra bases, corrections, task switching, reset, and keyboard use. Review base insertion and peptide growth on mobile and desktop, both themes, and reduced motion. The scrollable RNA region should remain usable without making the whole page overflow.

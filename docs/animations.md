# Shared animation behavior

[Documentation index](README.md)

This guide applies to DNA replication, mRNA translation, RNA splicing, and the two protein-synthesis overview pages. The [DNA model](dna-model.md) and [exercise](protein-synthesis-exercise.md) have their own interaction models.

## Playback and explanations

The five animations start automatically unless the browser requests reduced motion. **Pause** freezes the current scene; **Weiterlaufen** resumes it. **Tempo** offers Langsam (0.5×), Normal (1×), and Schnell (1.5×). Playback repeats automatically. There is no separate timeline scrubber or restart button.

Each scene has a phase description and selectable term explanations. Replication, translation, and splicing use buttons; selecting the same term again restores the explanation for the current stage. The prokaryotic and eukaryotic overviews use a dropdown; choose **Zum aktuellen Ablauf** to return to the stage description. Selecting a term does not pause playback or jump to that stage.

## Implementation

Each renderer is a strict-mode IIFE in its own file under `src/js/animations/`. It keeps elapsed time, speed, playback state, and term selection locally. A `requestAnimationFrame` loop advances time and renders SVG. There is no shared animation engine or global playback state.

Frame deltas are capped, and hidden documents do not advance the teaching timeline. Visibility changes reset the previous timestamp to avoid jumping when a tab becomes visible. A `ResizeObserver` redraws the scene for its current width, including while paused. Theme colors are supplied through CSS variables.

| Page | DOM ID prefix | Nominal cycle at 1× |
| --- | --- | --- |
| DNA replication | `dc-` | 12 seconds per lagging-strand cycle |
| mRNA translation | `tr-` | 55 seconds |
| RNA splicing | `sp-` | 40 seconds |
| Prokaryotic protein synthesis | `po-` | 56 seconds |
| Eukaryotic protein synthesis | `eu-` | 77 seconds |

These are presentation timings, not biological rates. The initial scene can begin partway into a cycle.

## Maintenance and checks

When changing stages, update labels, drawings, and term explanations together. Preserve valid SVG coordinates at stage boundaries and while resizing. If the intended educational sequence changes, update the independent stage expectations in `tests/e2e/animations.spec.js`.

```sh
npm test -- tests/e2e/animations.spec.js
```

The suite checks rendering, stage transitions, repetition, controls, explanations, reduced-motion startup, visibility, and resizing. Review the figures manually for biological accuracy, clear labels, and continuous movement; green tests do not replace that review.

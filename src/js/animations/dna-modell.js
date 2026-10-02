
        /* Eigenständiges Lernmodell; sämtliche Formen und Formeln werden lokal als SVG gezeichnet. */
        (() => {
            'use strict';
            const NS = 'http://www.w3.org/2000/svg';
            const COLORS = { A: '#e8a18b', T: '#83c5b5', G: '#98b5df', C: '#e9c477', Z: '#efe1ca', P: '#c9cdda' };
            const SEQUENCE = 'AGTCGACT'.split('');
            const COMPLEMENT = { A: 'T', T: 'A', G: 'C', C: 'G' };
            const DATA = {
                A: { name: 'Adenin', category: 'Purinbase · zwei Ringe', formula: 'C₅H₅N₅', description: 'Adenin ist eine stickstoffhaltige Base mit <strong>zwei verbundenen Ringen</strong>. Es paart sich mit Thymin über <strong>zwei Wasserstoffbrücken</strong>. Seine Position in der Basensequenz trägt zur genetischen Information bei.', note: 'Adenin und Guanin sind Purinbasen. Ihr Grundgerüst besteht aus einem Sechser- und einem Fünferring.', attachment: 'N9' },
                T: { name: 'Thymin', category: 'Pyrimidinbase · ein Ring', formula: 'C₅H₆N₂O₂', description: 'Thymin besitzt <strong>einen Sechserring</strong>. Es ist die komplementäre Base zu Adenin und bildet mit ihm <strong>zwei Wasserstoffbrücken</strong>. Seine charakteristische Methylgruppe ist als CH₃ zu erkennen.', note: 'In der RNA steht anstelle von Thymin normalerweise Uracil. Diesem fehlt die Methylgruppe von Thymin.', attachment: 'N1' },
                G: { name: 'Guanin', category: 'Purinbase · zwei Ringe', formula: 'C₅H₅N₅O', description: 'Guanin ist eine stickstoffhaltige Base mit <strong>zwei verbundenen Ringen</strong>. Es paart sich mit Cytosin über <strong>drei Wasserstoffbrücken</strong>. Zu erkennen sind eine Aminogruppe (NH₂) und eine Carbonylgruppe (C=O).', note: 'Guanin und Adenin sind Purinbasen. Bei jeder normalen Basenpaarung trifft eine Purin- auf eine Pyrimidinbase.', attachment: 'N9' },
                C: { name: 'Cytosin', category: 'Pyrimidinbase · ein Ring', formula: 'C₄H₅N₃O', description: 'Cytosin besitzt <strong>einen Sechserring</strong>. Es ist die komplementäre Base zu Guanin und bildet mit ihm <strong>drei Wasserstoffbrücken</strong>. Es enthält eine Aminogruppe (NH₂) und eine Carbonylgruppe (C=O).', note: 'Cytosin kommt sowohl in DNA als auch in RNA vor. Cytosin und Thymin gehören zu den Pyrimidinbasen.', attachment: 'N1' },
                Z: { name: 'Desoxyribose', category: 'Zucker · 2-Desoxy-D-ribose', formula: 'C₅H₁₀O₄', description: 'Dieser Zucker besitzt <strong>fünf Kohlenstoffatome</strong>. Sein Ring besteht aus vier C-Atomen und einem O-Atom. Am <strong>1′-C-Atom</strong> hängt die Base; über die 3′- und 5′-Positionen ist er mit dem Phosphat-Rückgrat verbunden.', note: '„Desoxy“ bedeutet: Am 2′-C-Atom sitzt ein H statt der OH-Gruppe der Ribose. Die Strichzeichen (′) kennzeichnen die Zuckerpositionen.' },
                P: { name: 'Phosphat', category: 'Phosphatgruppe · Teil des Rückgrats', formula: '', description: 'Phosphat verbindet die Zucker benachbarter Nukleotide über <strong>3′–5′-Phosphodiesterbindungen</strong>. Zusammen bilden Zucker und Phosphat das stabile Rückgrat jedes DNA-Strangs.', note: 'Eine innere Phosphodiestergruppe trägt bei physiologischem pH ungefähr eine negative Ladung. Dadurch ist auch das DNA-Rückgrat negativ geladen.' }
            };
            const state = { selection: null, separation: 0, free: false, nucleotide: false };
            const svg = document.getElementById('dna-svg');
            const detail = document.getElementById('detail');
            const slider = document.getElementById('separation');
            const inspector = document.getElementById('inspector');
            let detailTrigger = null;
            function openDetail() {
                if (!inspector.classList.contains('is-open')) detailTrigger = document.activeElement;
                inspector.inert = false;
                inspector.classList.add('is-open');
            }
            function closeDetail() {
                const restoreFocus = inspector.contains(document.activeElement) || svg.contains(document.activeElement);
                inspector.classList.remove('is-open');
                inspector.inert = true;
                state.selection = null;
                state.nucleotide = false;
                renderModel();
                if (restoreFocus) svg.focus({ preventScroll: true });
                detailTrigger = null;
            }
            document.getElementById('close-detail').addEventListener('click', closeDetail);
            document.addEventListener('keydown', e => { if (e.key === 'Escape' && inspector.classList.contains('is-open')) { e.preventDefault(); closeDetail(); } });
            function el(tag, attrs = {}, textContent) { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); if (textContent !== undefined) n.textContent = textContent; return n; }
            function add(parent, tag, attrs = {}, textContent) { const n = el(tag, attrs, textContent); parent.appendChild(n); return n; }
            function baseAt(side, index) { return side === 0 ? SEQUENCE[index] : COMPLEMENT[SEQUENCE[index]]; }
            function basePath(base) { if (base === 'A') return 'M0 -20H112L136 0L112 20H0Z'; if (base === 'G') return 'M0 -20H112Q137 -20 137 0Q137 20 112 20H0Z'; if (base === 'T') return 'M0 -20H125L103 0L125 20H0Z'; return 'M0 -20H125C96 -20 96 20 125 20H0Z'; }
            function sugarPath() { return 'M-21 -16L3 -25L25 0L3 25L-21 16Z'; }
            function selected(type, side, index) { const s = state.selection; return s?.type === type && s.side === side && s.index === index; }
            function shapeIcon(type, width = 51) { let content; if ('ATGC'.includes(type)) { content = `<path d="${basePath(type)}" transform="translate(2 25) scale(.36 1)" fill="${COLORS[type]}" stroke="#46544655" stroke-width="1.3"/><text x="24" y="30" text-anchor="middle" font-size="17" font-weight="650" fill="#253b33">${type}</text>`; } else if (type === 'Z') { content = `<path d="${sugarPath()}" transform="translate(25 25) scale(.82)" fill="${COLORS.Z}" stroke="#8b817055"/><text x="25" y="30" text-anchor="middle" font-size="15" fill="#384333">Z</text>`; } else if (type === 'P') { content = `<circle cx="25" cy="25" r="20" fill="${COLORS.P}" stroke="#70667e55"/><text x="25" y="30" text-anchor="middle" font-size="15" fill="#384333">P</text>`; } else { content = '<path d="M5 17H45M5 25H45M5 33H45" stroke="#67816b" stroke-width="2" stroke-dasharray="4 5"/>'; } return `<svg width="${width}" viewBox="0 0 52 50" aria-hidden="true">${content}</svg>`; }
            function makeHit(parent, type, side, index, label, transform) { const active = selected(type, side, index); const g = add(parent, 'g', { 'class': 'dna-hit' + (active ? ' is-selected' : ''), role: 'button', tabindex: active || (!state.selection && type === 'A' && side === 0 && index === 0) ? '0' : '-1', 'aria-label': label, 'aria-pressed': String(active), 'data-type': type, 'data-side': side, 'data-index': index, transform }); return g; }
            function renderBuildingBlocks() {
                svg.querySelectorAll(':scope > g,:scope > defs').forEach(n => n.remove());
                const defs = add(svg, 'defs'); const marker = add(defs, 'marker', { id: 'direction-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }); add(marker, 'path', { d: 'M0 0L10 5L0 10Z', fill: '#a8b5a7' });
                const root = add(svg, 'g', { id: 'model-root' }); const offset = state.separation * .63;
                const compact = window.matchMedia('(max-width: 900px)').matches;
                svg.setAttribute('viewBox', compact ? `${115 - offset * 1.1} 0 ${530 + offset * 2.2} 670` : '0 0 760 670');
                const bridges = add(root, 'g', { id: 'bridges' });
                for (let i = 0; i < SEQUENCE.length; i++) {
                    const y = 126 + i * 62, base = SEQUENCE[i], n = base === 'A' || base === 'T' ? 2 : 3;
                    const is = state.selection?.type === 'H' && state.selection.index === i;
                    const g = add(bridges, 'g', { class: 'dna-hit bridge-hit' + (is ? ' is-selected' : ''), role: 'button', tabindex: is ? '0' : '-1', 'data-type': 'H', 'data-side': '0', 'data-index': i, 'aria-label': `${n} Wasserstoffbrücken zwischen ${DATA[base].name} und ${DATA[COMPLEMENT[base]].name}, Basenpaar ${i + 1}`, 'aria-pressed': String(is) });
                    add(g, 'rect', { x: 351 - offset / 3, y: y - 22, width: 58 + offset * 2 / 3, height: 44, fill: 'transparent', rx: 7 });
                    add(g, 'rect', { x: 354 - offset / 3, y: y - 20, width: 52 + offset * 2 / 3, height: 40, rx: 6, class: 'bridge-focus' });
                    const dy = n === 2 ? [-7, 7] : [-11, 0, 11];
                    const edge = (b, d) => b === 'A' ? 136 - 1.2 * Math.abs(d) : b === 'G' ? 112 + 25 * Math.sqrt(1 - (d / 20) ** 2) : b === 'T' ? 103 + 1.1 * Math.abs(d) : 103.25 + 21.75 * (d / 20) ** 2;
                    dy.forEach(d => add(g, 'line', { x1: 240 + edge(base, d) + 3 - offset, y1: y + d, x2: 520 - edge(COMPLEMENT[base], d) - 3 + offset, y2: y + d, class: 'hbond', opacity: Math.max(0, 1 - state.separation / 60) }));
                }
                [0, 1].forEach(side => {
                    const shift = side === 0 ? -offset : offset;
                    const strand = add(root, 'g', { transform: `translate(${shift} 0)`, class: 'strand', 'data-strand': side });
                    const bonds = add(strand, 'g', { class: 'strand-bonds', 'pointer-events': 'none' });
                    const sx = side === 0 ? 180 : 580, px = side === 0 ? 149 : 611, arrowx = side === 0 ? 90 : 670;
                    add(strand, 'text', { x: sx, y: 37, class: 'svg-strand' }, 'STRANG ' + (side + 1));
                    add(strand, 'line', { x1: arrowx, y1: side === 0 ? 181 : 507, x2: arrowx, y2: side === 0 ? 507 : 181, stroke: '#b9c6b6', 'stroke-width': 1.4, 'marker-end': 'url(#direction-arrow)', class: 'strand-direction' });
                    add(strand, 'text', { x: 0, y: 0, transform: `translate(${arrowx + (side === 0 ? -15 : 15)} 344) rotate(${side === 0 ? 90 : -90})`, class: 'svg-small strand-direction' }, '5′ → 3′');
                    for (let i = 0; i < SEQUENCE.length; i++) {
                        const y = 126 + i * 62, base = baseAt(side, i), py = y + (side === 0 ? -31 : 31), outer = side === 0 ? sx - 17 : sx + 17;
                        if (state.nucleotide && state.selection.side === side && state.selection.index === i) {
                            add(strand, 'circle', { cx: px, cy: py, r: 20, class: 'nucleotide-mark' });
                            add(strand, 'path', { d: sugarPath(), transform: `translate(${sx} ${y}) scale(${side === 0 ? 1.18 : -1.18} 1.13)`, class: 'nucleotide-mark' });
                            add(strand, 'rect', { x: side === 0 ? 233 : 375, y: y - 25, width: 152, height: 50, rx: 7, class: 'nucleotide-mark' });
                        }
                        if (side === 0 || i > 0) add(bonds, 'line', { x1: outer, y1: y - 16, x2: px, y2: y - 31, class: 'backbone-line' });
                        if (side === 1 || i < SEQUENCE.length - 1) add(bonds, 'line', { x1: outer, y1: y + 16, x2: px, y2: y + 31, class: 'backbone-line' });
                        const glycoStart = side === 0 ? sx + 25 : sx - 25, glycoEnd = side === 0 ? 240 : 520;
                        add(bonds, 'line', { x1: glycoStart, y1: y, x2: glycoEnd, y2: y, class: 'covalent' });
                        const z = makeHit(strand, 'Z', side, i, `Desoxyribose, Strang ${side + 1}, Position ${i + 1}`, `translate(${sx} ${y})`);
                        add(z, 'rect', { x: -28, y: -27, width: 56, height: 54, fill: 'transparent' }); add(z, 'path', { d: sugarPath(), transform: side === 0 ? '' : 'scale(-1 1)', fill: COLORS.Z, class: 'shape' }); add(z, 'text', { x: 0, y: 0, class: 'sugar-letter' }, 'Z'); add(z, 'rect', { x: -29, y: -29, width: 58, height: 58, rx: 8, class: 'focus-ring' });
                        const p = makeHit(strand, 'P', side, i, `Phosphatgruppe, Strang ${side + 1}, Nukleotid ${i + 1}`, `translate(${px} ${py})`);
                        add(p, 'circle', { r: 21, fill: 'transparent' }); add(p, 'circle', { r: 13, fill: COLORS.P, class: 'shape' }); add(p, 'text', { x: 0, y: 0, class: 'phosphate-letter' }, 'P'); add(p, 'circle', { r: 20, class: 'focus-ring' });
                        const b = makeHit(strand, base, side, i, `${DATA[base].name}, Strang ${side + 1}, Position ${i + 1}`, `translate(${side === 0 ? 240 : 520} ${y})`);
                        add(b, 'path', { d: basePath(base), transform: side === 0 ? '' : 'scale(-1 1)', fill: COLORS[base], class: 'shape' }); add(b, 'text', { x: side === 0 ? 58 : -58, y: 0, class: 'base-letter' }, base); add(b, 'rect', { x: side === 0 ? -5 : -143, y: -25, width: 148, height: 50, rx: 5, class: 'focus-ring' });
                    }
                });
            }
            function chemLine(svg, x1, y1, x2, y2, order = 1, shorten = 8) {
                const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy), ux = dx / length, uy = dy / length;
                const a = [x1 + ux * shorten, y1 + uy * shorten], b = [x2 - ux * shorten, y2 - uy * shorten];
                if (order === 2) { [-2.1, 2.1].forEach(off => add(svg, 'line', { x1: a[0] - uy * off, y1: a[1] + ux * off, x2: b[0] - uy * off, y2: b[1] + ux * off, class: 'chemical-bond' })); }
                else add(svg, 'line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'chemical-bond' });
            }
            function atom(svg, x, y, label, kind = '', index) { add(svg, 'text', { x, y, class: 'atom-label ' + kind }, label); if (index) add(svg, 'text', { x: index === '1' ? x - 14 : x + 13, y: y + 14, class: 'atom-index' }, index); }
            function structureSVG(type, free, terminal = false) {
                const s = el('svg', { viewBox: '0 0 340 238', role: 'img', 'aria-label': `Strukturformel von ${DATA[type].name}, ${free ? 'freies Molekül' : 'in der DNA'}` });
                add(s, 'title', {}, `Strukturformel: ${DATA[type].name}`);
                if (type === 'A' || type === 'G') {
                    // Purin: C5–C6–N1–C2–N3–C4 sowie N7–C8–N9; N9 bindet den Zucker.
                    const pts = { c5: [137, 77], c6: [199, 77], n1: [233, 132], c2: [199, 187], n3: [137, 187], c4: [105, 132], n7: [88, 43], c8: [45, 78], n9: [56, 132] };
                    add(s, 'path', { d: 'M137 77L199 77L233 132L199 187L137 187L105 132Z M137 77L88 43L45 78L56 132L105 132Z', fill: COLORS[type], opacity: .12 });
                    const edges = [['c5', 'c6', 1], ['c6', 'n1', type === 'A' ? 2 : 1], ['n1', 'c2', 1], ['c2', 'n3', 2], ['n3', 'c4', 1], ['c4', 'c5', 2], ['c5', 'n7', 1], ['n7', 'c8', 2], ['c8', 'n9', 1], ['n9', 'c4', 1]];
                    edges.forEach(([a, b, o]) => chemLine(s, ...pts[a], ...pts[b], o));
                    chemLine(s, 199, 77, 227, 29, type === 'G' ? 2 : 1); atom(s, 227, 25, type === 'G' ? 'O' : 'NH₂', type === 'G' ? 'o' : 'n');
                    chemLine(s, 45, 78, 16, 61); atom(s, 12, 57, 'H', 'h');
                    if (type === 'A') { chemLine(s, 199, 187, 228, 218); atom(s, 235, 225, 'H', 'h'); }
                    else { chemLine(s, 199, 187, 253, 216); atom(s, 269, 223, 'NH₂', 'n'); chemLine(s, 233, 132, 276, 132); atom(s, 281, 132, 'H', 'h'); }
                    chemLine(s, 56, 132, 38, 185); add(s, 'text', { x: 39, y: 198, class: free ? 'atom-label h' : 'sugar-stub' }, free ? 'H' : 'Zucker');
                    Object.entries(pts).forEach(([id, [x, y]]) => atom(s, x, y, id.startsWith('n') ? 'N' : 'C', id.startsWith('n') ? 'n' : '', id === 'n9' ? '9' : ''));
                } else if (type === 'T' || type === 'C') {
                    // Pyrimidin: N1–C2–N3–C4–C5–C6. C2 trägt O; N1 bindet den Zucker.
                    const p = { c4: [130, 74], c5: [198, 74], c6: [232, 130], n1: [198, 186], c2: [130, 186], n3: [96, 130] };
                    add(s, 'path', { d: 'M130 74L198 74L232 130L198 186L130 186L96 130Z', fill: COLORS[type], opacity: .16 });
                    const edges = [['c4', 'c5', 1], ['c5', 'c6', 2], ['c6', 'n1', 1], ['n1', 'c2', 1], ['c2', 'n3', 1], ['n3', 'c4', type === 'C' ? 2 : 1]];
                    edges.forEach(([a, b, o]) => chemLine(s, ...p[a], ...p[b], o));
                    chemLine(s, 130, 74, 100, 25, type === 'T' ? 2 : 1); atom(s, 96, 20, type === 'T' ? 'O' : 'NH₂', type === 'T' ? 'o' : 'n');
                    chemLine(s, 198, 74, 227, 25); atom(s, 234, 19, type === 'T' ? 'CH₃' : 'H', type === 'T' ? '' : 'h');
                    chemLine(s, 232, 130, 278, 130); atom(s, 286, 130, 'H', 'h');
                    chemLine(s, 130, 186, 102, 222, 2); atom(s, 96, 228, 'O', 'o');
                    chemLine(s, 198, 186, 229, 216); add(s, 'text', { x: 245, y: 228, class: free ? 'atom-label h' : 'sugar-stub' }, free ? 'H' : 'Zucker');
                    if (type === 'T') { chemLine(s, 96, 130, 57, 130); atom(s, 49, 130, 'H', 'h'); }
                    Object.entries(p).forEach(([id, [x, y]]) => atom(s, x, y, id.startsWith('n') ? 'N' : 'C', id.startsWith('n') ? 'n' : '', id === 'n1' ? '1' : ''));
                } else if (type === 'Z') {
                    s.setAttribute('viewBox', '0 0 340 252');
                    // Haworth-Schema von β-D-2-Desoxyribofuranose; die dicke Kante liegt vorne.
                    const p = { o: [205, 90], c1: [255, 135], c2: [205, 172], c3: [125, 172], c4: [75, 135] };
                    add(s, 'polygon', { points: '205,90 255,135 205,172 125,172 75,135', fill: COLORS.Z, opacity: .35 });
                    [['o', 'c1'], ['c1', 'c2'], ['c2', 'c3'], ['c3', 'c4'], ['c4', 'o']].forEach(([a, b]) => chemLine(s, ...p[a], ...p[b], 1, 10));
                    add(s, 'line', { x1: 138, y1: 172, x2: 192, y2: 172, stroke: 'var(--ink)', 'stroke-width': 3.3 });
                    chemLine(s, 75, 135, 75, 76); atom(s, 75, 66, 'CH₂'); add(s, 'text', { x: 103, y: 69, class: 'atom-index' }, '5′');
                    chemLine(s, 75, 66, 75, 30); atom(s, 75, 22, free ? 'OH' : 'O', 'o'); if (!free) { chemLine(s, 75, 22, 120, 22); add(s, 'text', { x: 161, y: 22, class: 'sugar-stub' }, 'Phosphat'); }
                    chemLine(s, 255, 135, 255, 86); add(s, 'text', { x: 255, y: 72, class: free ? 'atom-label o' : 'sugar-stub' }, free ? 'OH' : 'Base');
                    chemLine(s, 255, 135, 280, 179); atom(s, 286, 188, 'H', 'h');
                    chemLine(s, 205, 172, 205, 220); atom(s, 205, 235, 'H', 'h'); chemLine(s, 205, 172, 205, 128); atom(s, 205, 117, 'H', 'h');
                    chemLine(s, 125, 172, 125, 217); atom(s, 125, 236, free ? 'OH' : 'O', 'o'); if (!free) { chemLine(s, 125, 236, 63, 236); add(s, 'text', { x: 35, y: 236, class: 'sugar-stub' }, 'Phosphat'); }
                    chemLine(s, 125, 172, 125, 148, 1, 6); atom(s, 125, 137, 'H', 'h'); chemLine(s, 75, 135, 48, 179); atom(s, 42, 188, 'H', 'h');
                    atom(s, 205, 90, 'O', 'o');[['c1', '1′', 280, 136], ['c2', '2′', 221, 190], ['c3', '3′', 106, 190], ['c4', '4′', 56, 120]].forEach(([key, n, x, y]) => { atom(s, ...p[key], 'C'); add(s, 'text', { x, y, class: 'atom-index' }, n); });
                } else if (type === 'P') {
                    chemLine(s, 170, 109, 170, 49, 2); chemLine(s, 170, 109, 170, 168); chemLine(s, 170, 109, 96, 109); chemLine(s, 170, 109, 245, 109);
                    atom(s, 170, 109, 'P'); atom(s, 170, 34, 'O', 'o'); atom(s, 170, 184, 'O⁻', 'o'); atom(s, 85, 109, terminal ? 'O⁻' : 'O', 'o'); atom(s, 257, 109, 'O', 'o');
                    if (!terminal) { chemLine(s, 85, 109, 47, 74); add(s, 'text', { x: 38, y: 58, class: 'sugar-stub' }, 'Zucker'); add(s, 'text', { x: 39, y: 40, class: 'chem-note' }, '3′-C'); }
                    chemLine(s, 257, 109, 295, 144); add(s, 'text', { x: 302, y: 164, class: 'sugar-stub' }, 'Zucker');
                    add(s, 'text', { x: 302, y: 184, class: 'chem-note' }, '5′-C'); add(s, 'text', { x: 170, y: 221, class: 'chem-note' }, terminal ? 'Phosphat-Monoester am 5′-Ende' : 'Phosphodiestergruppe im DNA-Rückgrat');
                }
                return s;
            }
            function hydrogenSVG(index) {
                const base = SEQUENCE[index], at = base === 'A' || base === 'T';
                const s = el('svg', { viewBox: '0 0 340 217', role: 'img', 'aria-label': at ? 'Zwei Wasserstoffbrücken: N–H zu O und N zu H–N.' : 'Drei Wasserstoffbrücken: O zu H–N, N–H zu N und N–H zu O.' });
                add(s, 'text', { x: 79, y: 31, class: 'chem-note' }, at ? 'Adenin' : 'Guanin'); add(s, 'text', { x: 259, y: 31, class: 'chem-note' }, at ? 'Thymin' : 'Cytosin');
                const rows = at ? [[76, 'N', 'H', 'O', ''], [141, 'N', '', 'H', 'N']] : [[65, 'O', '', 'H', 'N'], [115, 'N', 'H', 'N', ''], [165, 'N', 'H', 'O', '']];
                rows.forEach(([y, a, b, c, d]) => { atom(s, 71, y, a, a === 'O' ? 'o' : 'n'); if (b) { chemLine(s, 71, y, 127, y); atom(s, 127, y, b, 'h'); } add(s, 'line', { x1: b ? 141 : 90, y1: y, x2: c === 'H' ? 211 : 250, y2: y, stroke: 'var(--green)', 'stroke-width': 2, 'stroke-dasharray': '4 5' }); if (c === 'H') { atom(s, 224, y, 'H', 'h'); chemLine(s, 224, y, 281, y); atom(s, 281, y, d, 'n'); } else atom(s, 265, y, c, c === 'O' ? 'o' : 'n'); });
                add(s, 'text', { x: 170, y: 202, class: 'chem-note' }, '··· = Wasserstoffbrücke'); return s;
            }
            function renderDetail() {
                if (!state.selection) { detail.innerHTML = '<h2 id="detail-title">Baustein auswählen</h2>'; return; }
                const { type, side, index } = state.selection;
                if (type === 'H') { renderBridgeDetail(index); return; }
                const terminal = type === 'P' && ((side === 0 && index === 0) || (side === 1 && index === 7));
                const d = terminal ? { ...DATA.P, category: 'Phosphatgruppe · am 5′-Ende', description: 'Diese Phosphatgruppe sitzt am <strong>5′-Ende</strong> des Strangs. Sie ist über ein O-Atom mit der 5′-Position eines Zuckers verbunden. Im Stranginneren verbindet ein Phosphat dagegen <strong>zwei benachbarte Zucker</strong>.', note: 'Hier ist ein Phosphat-Monoester dargestellt. Die freien O-Gruppen sind bei physiologischem pH überwiegend negativ geladen.' } : DATA[type];
                const base = baseAt(side, index), isBase = 'ATGC'.includes(type), partner = COMPLEMENT[base], count = base === 'A' || base === 'T' ? 2 : 3;
                const pair = isBase ? `<div class="pair-summary"><div class="pair-code"><span class="pair-base" style="--base-color:${COLORS[base]}">${base}</span><span class="pair-lines">${count === 2 ? '··' : '···'}</span><span class="pair-base" style="--base-color:${COLORS[partner]}">${partner}</span></div><span class="pair-info"><strong>${count} Wasserstoffbrücken</strong><br>zu ${DATA[partner].name}</span></div>` : '';
                const caption = isBase ? (state.free ? `Freie Base. In der DNA wird das H am ${d.attachment} durch die Bindung zum Zucker ersetzt.` : `An ${d.attachment} ist der Zucker gebunden. Die Summenformel oben gilt für die freie Base.`) : type === 'Z' ? (state.free ? 'Freie β-D-2-Desoxyribofuranose (Haworth-Schema). Die dicke Ringkante liegt vorne.' : 'Beispiel im Stranginneren. Am 3′-Ende steht OH statt O–Phosphat an C3′. Summenformel oben: freier Zucker.') : terminal ? 'Am 5′-Ende ist nur ein Zucker mit dem Phosphat verbunden. Gezeigt ist eine bei physiologischem pH vorherrschende Ladungsform.' : 'Die beiden einfach gebundenen O-Atome links und rechts verbinden das Phosphat mit zwei Zuckern. Die negative Ladung ist vereinfacht an einem O dargestellt.';
                detail.innerHTML = `<div class="inspector-head"><div class="selection-line"><p class="eyebrow">${isBase ? 'Ausgewählte Base' : 'Ausgewählter Baustein'}</p><span class="selection-position">Strang ${side + 1} · Position ${index + 1}</span></div><div class="selected-heading"><div class="selection-symbol">${shapeIcon(type)}</div><div><h2 id="detail-title">${d.name}</h2><span class="category">${d.category}</span></div></div></div><div class="inspector-content"><p class="description">${d.description}</p>${pair}<div class="structure-heading"><h3>Strukturformel</h3><span class="formula" title="Summenformel des freien Moleküls">${d.formula}</span></div>${type !== 'P' ? `<div class="structure-toggle" role="group" aria-label="Darstellung der Strukturformel"><button type="button" data-action="bound" aria-pressed="${!state.free}">In der DNA</button><button type="button" data-action="free" aria-pressed="${state.free}">${isBase ? 'Freie Base' : 'Freier Zucker'}</button></div>` : ''}<figure class="formula-figure"><div id="chemical-structure"></div><figcaption class="formula-caption">${caption}</figcaption></figure><details class="extra-detail"><summary>Mehr zu ${d.name}</summary><p>${d.note}</p></details><div class="inspector-actions">${isBase ? '<button type="button" class="action-button primary" data-action="partner">Partner zeigen <span aria-hidden="true">↔</span></button>' : ''}<button type="button" class="action-button" data-action="nucleotide" aria-pressed="${state.nucleotide}">${state.nucleotide ? 'Markierung lösen' : 'Nukleotid markieren'}</button></div>${state.nucleotide ? '<div class="nucleotide-note"><strong>Ein Nukleotid = Phosphat + Zucker + Base</strong>Die drei umrandeten Bausteine bilden zusammen ein Nukleotid. Die Phosphatgruppe gehört dabei zur 5′-Seite des Zuckers.</div>' : ''}</div>`;
                document.getElementById('chemical-structure').appendChild(structureSVG(type, state.free, terminal));
                document.getElementById('mobile-detail-text').textContent = d.name + ' entdecken';
            }
            function renderBridgeDetail(index) {
                const base = SEQUENCE[index], at = base === 'A' || base === 'T', count = at ? 2 : 3, open = state.separation > 0;
                detail.innerHTML = `<div class="inspector-head"><div class="selection-line"><p class="eyebrow">Verbindung der Stränge</p><span class="selection-position">Basenpaar ${index + 1}</span></div><div class="selected-heading"><div class="selection-symbol">${shapeIcon('H')}</div><div><h2 id="detail-title" style="font-size:23px">Wasserstoff-<br>brücken</h2><span class="category">${at ? 'Adenin + Thymin' : 'Guanin + Cytosin'}</span></div></div></div><div class="inspector-content"><p class="description"><strong>${count} Wasserstoffbrücken</strong> verbinden dieses Basenpaar. Sie entstehen zwischen passenden N- und O-Atomen und einem an N gebundenen H-Atom der gegenüberliegenden Base.</p><div class="small-steps"><div class="small-step"><span class="step-icon">${count}</span> ${at ? 'A–T: zwei' : 'G–C: drei'} Wasserstoffbrücken</div><div class="small-step"><span class="step-icon"><span class="bond-dash"></span></span> Gestrichelte Linien im Modell</div></div><div class="structure-heading"><h3>Bindungsschema</h3><span class="formula">${at ? 'A ·· T' : 'G ··· C'}</span></div><figure class="formula-figure"><div id="chemical-structure"></div><figcaption class="formula-caption">Nur die beteiligten Atomgruppen sind gezeigt. Durchgezogene Linien stehen für kovalente Bindungen, Punkte für Wasserstoffbrücken.</figcaption></figure><p class="fact"><span class="fact-mark" aria-hidden="true">i</span><span>Beim Trennen der Stränge werden die Wasserstoffbrücken gelöst. Das Zucker-Phosphat-Rückgrat bleibt dabei erhalten. Auch die Wechselwirkungen zwischen gestapelten Basen stabilisieren die DNA.</span></p>${open ? '<div class="nucleotide-note">Die Stränge sind im Modell auseinandergezogen. Ausgeblendete gestrichelte Linien bedeuten gelöste Wasserstoffbrücken.</div>' : ''}<div class="inspector-actions"><button type="button" class="action-button primary" data-action="base">${DATA[base].name} ansehen</button></div></div>`;
                document.getElementById('chemical-structure').appendChild(hydrogenSVG(index)); document.getElementById('mobile-detail-text').textContent = 'Wasserstoffbrücken entdecken';
            }
            function announce() { const { type, side, index } = state.selection; document.getElementById('announcement').textContent = type === 'H' ? `Basenpaar ${index + 1}: ${SEQUENCE[index] === 'A' || SEQUENCE[index] === 'T' ? 'zwei' : 'drei'} Wasserstoffbrücken. Erklärung und Bindungsschema im Detailbereich.` : `${DATA[type].name}, Strang ${side + 1}, Position ${index + 1}. Erklärung und Strukturformel im Detailbereich.`; }
            function select(type, side, index, { focus = false } = {}) { state.selection = { type, side, index }; if (type === 'H') state.nucleotide = false; renderModel(); renderDetail(); openDetail(); announce(); if (focus) focusSelected(); }
            function focusSelected() { if (!state.selection) { svg.querySelector('[tabindex="0"]')?.focus({ preventScroll: true }); return; } const { type, side, index } = state.selection; svg.querySelector(`[data-type="${type}"][data-side="${side}"][data-index="${index}"]`)?.focus({ preventScroll: true }); }
            function handleDiagramKey(e) {
                const hit = e.target.closest('[data-type]'); if (!hit) return; const type = hit.dataset.type, side = +hit.dataset.side, index = +hit.dataset.index; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(type, side, index, { focus: true }); return; } if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault(); let i = index, s = side, t = type; if (e.key === 'ArrowUp') i = Math.max(0, i - 1); if (e.key === 'ArrowDown') i = Math.min(SEQUENCE.length - 1, i + 1); if (e.key === 'Home') i = 0; if (e.key === 'End') i = SEQUENCE.length - 1; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    const row = [['P', 0], ['Z', 0], [baseAt(0, i), 0], ['H', 0], [baseAt(1, i), 1], ['Z', 1], ['P', 1]];
                    let k = row.findIndex(([bt, bs]) => bt === t && bs === s); k = Math.max(0, Math.min(row.length - 1, k + (e.key === 'ArrowRight' ? 1 : -1)));[t, s] = row[k];
                } else if ('ATGC'.includes(t)) t = baseAt(s, i); select(t, s, i, { focus: true });
            }
            svg.addEventListener('click', e => { const hit = e.target.closest('[data-type]'); if (hit) select(hit.dataset.type, +hit.dataset.side, +hit.dataset.index); });
            svg.addEventListener('keydown', handleDiagramKey);
            detail.addEventListener('click', e => { const button = e.target.closest('button[data-action]'); if (!button) return; const action = button.dataset.action; if (action === 'free' || action === 'bound') { state.free = action === 'free'; renderDetail(); detail.querySelector(`[data-action="${action}"]`)?.focus({ preventScroll: true }); } else if (action === 'partner') { const { side, index } = state.selection; select(baseAt(1 - side, index), 1 - side, index); detail.querySelector('[data-action="partner"]')?.focus({ preventScroll: true }); } else if (action === 'nucleotide') { state.nucleotide = !state.nucleotide; renderModel(); renderDetail(); detail.querySelector('[data-action="nucleotide"]')?.focus({ preventScroll: true }); } else if (action === 'base') { const i = state.selection.index; select(SEQUENCE[i], 0, i); } });
            function updateSeparation() { state.separation = +slider.value; slider.setAttribute('aria-valuetext', state.separation === 0 ? 'Gepaart' : state.separation >= 60 ? 'Getrennt' : 'Wird getrennt'); renderModel(); if (state.selection?.type === 'H') renderDetail(); }
            slider.addEventListener('input', updateSeparation);
            document.getElementById('reset').addEventListener('click', () => { state.selection = null; state.free = false; state.nucleotide = false; slider.value = 0; updateSeparation(); renderDetail(); closeDetail(); document.getElementById('announcement').textContent = 'DNA-Modell zurückgesetzt.'; });
            const legend = document.getElementById('legend');
            ['A', 'T', 'G', 'C', 'Z', 'P'].forEach((type, i) => { if (i === 4) { const div = document.createElement('span'); div.className = 'legend-divider'; div.setAttribute('aria-hidden', 'true'); legend.appendChild(div); } const b = document.createElement('button'); b.type = 'button'; b.innerHTML = shapeIcon(type, 25) + `<span>${type === 'Z' ? 'Zucker' : DATA[type].name}</span>`; b.setAttribute('aria-label', DATA[type].name + ' auswählen'); b.addEventListener('click', () => { const side = state.selection?.side ?? 0; let index = state.selection?.index ?? 0; if ('ATGC'.includes(type) && baseAt(side, index) !== type) index = SEQUENCE.findIndex((_, i) => baseAt(side, i) === type); select(type, side, index); }); legend.appendChild(b); });
            function renderModel() {
                renderBuildingBlocks();
                svg.setAttribute('tabindex', '-1');
                document.getElementById('view-stage').textContent = '2D · aufgefaltet';
                document.getElementById('separation-controls').hidden = false;
                document.getElementById('legend').hidden = false;
                document.getElementById('separation-state').textContent = state.separation === 0 ? 'Gepaart' : state.separation >= 60 ? 'Getrennt' : 'Wird getrennt';
                document.getElementById('view-count').textContent = '8 Basenpaare · 16 Nukleotide';
                document.getElementById('model-caption').innerHTML = state.separation === 0 ? '<strong>Gestrichelt:</strong> Wasserstoffbrücken · <strong>Durchgezogen:</strong> kovalente Bindungen' : '<strong>Die Wasserstoffbrücken lösen sich.</strong> Das Rückgrat bleibt verbunden.';
            }

            renderModel(); renderDetail();
            window.matchMedia('(max-width: 900px)').addEventListener('change', renderModel);

        })();
    
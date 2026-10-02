(() => {
  'use strict';
  // Standard code (NCBI table 1), in U/C/A/G order for each position.
  const letters = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
  const bases = 'UCAG';
  const code = {};
  let offset = 0;
  for (const a of bases) for (const b of bases) for (const c of bases) code[a + b + c] = letters[offset++];
  const amino = {
    A: ['Ala', 'Alanin'], R: ['Arg', 'Arginin'], N: ['Asn', 'Asparagin'], D: ['Asp', 'Asparaginsäure'],
    C: ['Cys', 'Cystein'], Q: ['Gln', 'Glutamin'], E: ['Glu', 'Glutaminsäure'], G: ['Gly', 'Glycin'],
    H: ['His', 'Histidin'], I: ['Ile', 'Isoleucin'], L: ['Leu', 'Leucin'], K: ['Lys', 'Lysin'],
    M: ['Met', 'Methionin'], F: ['Phe', 'Phenylalanin'], P: ['Pro', 'Prolin'], S: ['Ser', 'Serin'],
    T: ['Thr', 'Threonin'], W: ['Trp', 'Tryptophan'], Y: ['Tyr', 'Tyrosin'], V: ['Val', 'Valin'], '*': ['Stopp', 'Keine Aminosäure']
  };
  const tasks = [
    'TAC CGA AAA CCT TGG ATT',
    'TAC GTT TTT ACG CTC ACC ATC',
    'TAC TAG GAC TCA GTA CCA AGG ACT'
  ];
  const complement = { A: 'U', T: 'A', G: 'C', C: 'G' };
  const $ = id => document.getElementById(id);
  const form = $('exercise-form');
  let taskIndex = 0, expected = [], checked = false;
  const aaInputs = () => [...form.querySelectorAll('[data-aa]')];
  const normalize = value => value.toUpperCase().replace(/\s/g, '');
  const rnaCodons = () => {
    const sequence = normalize($('rna-sequence').value);
    return Array.from({ length: Math.max(expected.length, Math.ceil(sequence.length / 3)) }, (_, i) => sequence.slice(i * 3, i * 3 + 3));
  };
  const peptide = () => expected.map(codon => code[codon]).filter(aa => aa !== '*').map(aa => amino[aa][0]).join(' – ');
  const beadColors = Object.keys(amino).filter(symbol => symbol !== '*').reduce((colors, symbol, i) => {
    colors[symbol] = `hsl(${Math.round(i * 137.5) % 360} 58% 75%)`;
    return colors;
  }, {});

  const rnaColors = { A: '#e8a18b', U: '#83c5b5', G: '#98b5df', C: '#e9c477' };
  // Same silhouettes as dna-modell.js; RNA uses U in place of T.
  function rnaBasePath(base) {
    if (base === 'A') return 'M0 -20H112L136 0L112 20H0Z';
    if (base === 'G') return 'M0 -20H112Q137 -20 137 0Q137 20 112 20H0Z';
    if (base === 'U' || base === 'T') return 'M0 -20H125L103 0L125 20H0Z';
    if (base === 'C') return 'M0 -20H125C96 -20 96 20 125 20H0Z';
    return 'M0 -20H112V20H0Z';
  }
  const ribosePath = 'M-21 -16L3 -25L25 0L3 25L-21 16Z';
  let previousRNA = [];
  function renderRNA(animate = false) {
    const values = rnaCodons();
    const last = values.findLastIndex(Boolean);
    const drawing = $('rna-drawing');
    // Keep the scaffold visible as the continuous sequence is filled in.
    const strand = values.flatMap((value, codon) =>
      Array.from({ length: Math.max(3, value.length) }, (_, index) => ({
        letter: value[index] || '', codon, index,
        active: codon < last || (codon === last && index < value.length),
        changed: animate && value[index] !== previousRNA[codon]?.[index]
      })));
    const displayed = letter => /^[ACGUT]$/.test(letter) ? letter : '?';
    const positions = strand.map((_, i) => 42 + i * 56);
    const svgWidth = strand.length * 56 + 28;
    let svg = drawing.querySelector('svg');
    if (!svg) {
      drawing.innerHTML = '<svg role="img" aria-labelledby="rna-svg-title rna-svg-desc"><title id="rna-svg-title">Dein mRNA-Strang mit Zucker-Phosphat-Rückgrat</title><desc id="rna-svg-desc"></desc><g class="rna-scaffold" aria-hidden="true"></g><g class="rna-base-layer"></g></svg>';
      svg = drawing.querySelector('svg');
    }
    svg.setAttribute('viewBox', `0 0 ${svgWidth} 218`);
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', 218);
    svg.querySelector('desc').textContent = 'Von 5′ nach 3′: ' + strand.filter(base => base.active).map(({ letter, codon, index }) => `Codon ${codon + 1}, Stelle ${index + 1}: ${letter ? displayed(letter) : 'offen'}`).join(', ') + '. Das Rückgrat besteht aus Ribose und Phosphat.';
    let scaffold = `<path class="rna-link" d="M14 168H${positions[0]}"/>`;
    positions.slice(1).forEach((x, i) => {
      scaffold += `<path class="rna-link" d="M${positions[i]} 168H${x}"/>`;
    });
    positions.forEach((x, i) => {
      const { codon, index } = strand[i];
      scaffold += `<g transform="translate(${x} 168)"><path class="rna-attachment" d="M0 -15V-29"/><path class="rna-ribose" d="${ribosePath}" transform="rotate(-90) scale(.6)"/><text class="rna-backbone-letter" text-anchor="middle" dy=".35em">Z</text><circle class="rna-phosphate" cx="-28" r="9"/><text class="rna-backbone-letter" x="-28" text-anchor="middle" dy=".35em">P</text><text class="peptide-position" y="32" text-anchor="middle">${codon + 1}.${index + 1}</text></g>`;
    });
    scaffold += `<text class="peptide-end" x="5" y="144">5′</text><text class="peptide-end" x="${positions.at(-1) + 18}" y="172">3′</text>`;
    svg.querySelector('.rna-scaffold').innerHTML = scaffold;
    const layer = svg.querySelector('.rna-base-layer');
    const retained = new Set();
    let latestX = null;
    strand.forEach(({ letter, codon, index, active, changed }, i) => {
      if (!active) return;
      const key = `${codon}-${index}`;
      retained.add(key);
      let node = layer.querySelector(`[data-rna-position="${key}"]`);
      if (!node) {
        node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        node.dataset.rnaPosition = key;
        node.innerHTML = '<g><title></title><path class="rna-base-shape" transform="rotate(-90) scale(.5 .9)"/><text class="rna-letter" text-anchor="middle" y="-30" dy=".35em"></text></g>';
        const next = [...layer.children].find(child => {
          const [c, j] = child.dataset.rnaPosition.split('-').map(Number);
          return c > codon || (c === codon && j > index);
        });
        layer.insertBefore(node, next || null);
      }
      node.setAttribute('transform', `translate(${positions[i]} 139)`);
      const base = node.firstElementChild;
      const valid = Object.hasOwn(rnaColors, letter) && index < 3;
      base.setAttribute('class', !letter ? 'rna-gap' : valid ? 'rna-base' : 'rna-invalid');
      base.querySelector('title').textContent = `Codon ${codon + 1}, Stelle ${index + 1}: ${letter ? displayed(letter) : 'offen'}`;
      const shape = base.querySelector('path');
      shape.setAttribute('d', rnaBasePath(letter));
      if (valid) shape.setAttribute('fill', rnaColors[letter]);
      else shape.removeAttribute('fill');
      base.querySelector('text').textContent = letter ? displayed(letter) : '?';
      if (changed) {
        base.getAnimations().forEach(animation => animation.cancel());
        if (valid && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          base.animate([
            { transform: 'translateY(-58px)', opacity: 0 },
            { transform: 'translateY(3px)', opacity: 1, offset: .82 },
            { transform: 'translateY(0)', opacity: 1 }
          ], { duration: 480, easing: 'ease-out' });
        }
        if (letter) latestX = positions[i];
      }
    });
    [...layer.children].forEach(node => { if (!retained.has(node.dataset.rnaPosition)) node.remove(); });
    // Reveal the edited base inside the strand without moving the page or input focus.
    if (latestX !== null) {
      const left = drawing.scrollLeft, right = left + drawing.clientWidth;
      if (latestX < left + 26 || latestX > right - 26) drawing.scrollLeft = Math.max(0, latestX - drawing.clientWidth + 60);
    }
    const count = strand.filter(({ letter, index }) => Object.hasOwn(rnaColors, letter) && index < 3).length;
    const invalid = strand.some(({ letter, index }) => letter && (!Object.hasOwn(rnaColors, letter) || index >= 3));
    $('rna-status').textContent = last < 0 ? 'Tippe oben die erste Base – sie gleitet von oben an ihren Platz.' : `${count} ${count === 1 ? 'RNA-Base' : 'RNA-Basen'} eingesetzt. Nummerierung: Codon.Stelle.${strand.some(({ letter, active }) => active && !letter) ? ' Offene Stellen sind mit ? markiert.' : ''}${invalid ? ' Markierte Zeichen prüfen: pro Codon genau drei Basen, nur A, U, G oder C.' : ''}`;
    if (last < 0) drawing.scrollLeft = 0;
    previousRNA = values;
  }

  function renderPeptide(changedIndex = -1) {
    const selected = aaInputs().map(input => input.value);
    const stop = selected.indexOf('*');
    const end = stop < 0 ? selected.findLastIndex(Boolean) + 1 : stop;
    const chain = selected.slice(0, end);
    const count = chain.filter(Boolean).length;
    const gaps = chain.some(symbol => !symbol);
    const drawing = $('peptide-drawing');
    const status = $('peptide-status');
    if (!chain.length) {
      drawing.replaceChildren();
      status.textContent = stop === 0 ? 'Stopp an Position 1: Es entsteht keine Polypeptidkette.' : 'Wähle oben eine Aminosäure – hier wächst deine Kette.';
      return;
    }
    const width = Math.max(220, drawing.clientWidth);
    const columns = Math.max(2, Math.min(chain.length, Math.floor((width - 40) / 80)));
    const step = 80;
    const svgWidth = columns * step + 40;
    const rows = Math.ceil(chain.length / columns);
    const height = rows * 94 + 28;
    const points = chain.map((_, i) => {
      const row = Math.floor(i / columns), col = i % columns;
      return { x: 60 + (row % 2 ? columns - 1 - col : col) * step, y: 49 + row * 94 };
    });
    const description = chain.map((symbol, i) => `${i + 1}: ${symbol ? amino[symbol][1] : 'noch offen'}`).join(', ');
    let svg = `<svg viewBox="0 0 ${svgWidth} ${height}" width="${svgWidth}" role="img" aria-labelledby="peptide-svg-title peptide-svg-desc"><title id="peptide-svg-title">Deine ausgewählte Polypeptidkette</title><desc id="peptide-svg-desc">Vom N-Ende zum C-Ende: ${description}.${stop >= 0 ? ` Stopp an Position ${stop + 1}.` : ''}</desc><defs><radialGradient id="bead-shading" cx="30%" cy="25%" r="80%"><stop offset="0" stop-color="white" stop-opacity=".6"/><stop offset=".45" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="black" stop-opacity=".16"/></radialGradient></defs>`;
    points.forEach((point, i) => {
      if (!i) return;
      const prev = points[i - 1];
      const path = point.y === prev.y ? `M${prev.x} ${prev.y}L${point.x} ${point.y}` : `M${prev.x} ${prev.y}C${prev.x + (Math.floor(i / columns) % 2 ? 45 : -45)} ${prev.y + 32},${point.x + (Math.floor(i / columns) % 2 ? 45 : -45)} ${point.y - 32},${point.x} ${point.y}`;
      svg += `<path class="peptide-link${!chain[i - 1] || !chain[i] ? ' is-gap' : ''}" d="${path}"/>`;
    });
    points.forEach(({ x, y }, i) => {
      const symbol = chain[i];
      svg += `<g transform="translate(${x} ${y})"><text class="peptide-position" y="-35" text-anchor="middle">${i + 1}</text><g class="${symbol ? 'peptide-bead' : 'peptide-gap'}${i === changedIndex ? ' is-new' : ''}"${symbol ? ` data-amino="${symbol}"` : ''}><title>${symbol ? amino[symbol][1] : 'Noch offen'} · Position ${i + 1}</title><circle r="26"${symbol ? ` fill="${beadColors[symbol]}"` : ''}/>${symbol ? '<circle r="26" fill="url(#bead-shading)"/>' : ''}<text class="peptide-label" text-anchor="middle" dy=".35em">${symbol ? amino[symbol][0] : '?'}</text></g></g>`;
    });
    svg += `<text class="peptide-end" x="${points[0].x - 40}" y="${points[0].y + 5}" text-anchor="middle">N</text><text class="peptide-end" x="${points.at(-1).x}" y="${points.at(-1).y + 45}" text-anchor="middle">C${stop >= 0 ? ' · Stopp' : ''}</text></svg>`;
    drawing.innerHTML = svg;
    status.textContent = `${count} ${count === 1 ? 'Aminosäure' : 'Aminosäuren'} ausgewählt.${gaps ? ' Offene Positionen sind mit ? markiert.' : ''}${stop >= 0 ? ` Stopp an Position ${stop + 1} beendet die Kette; spätere Auswahlen werden nicht angefügt.` : ' Die Kette wächst mit deiner Auswahl.'}`;
  }

  const choices = Object.entries(amino).sort((a, b) => a[1][0].localeCompare(b[1][0], 'de'));
  choices.forEach(([symbol, [short, name]]) => {
    const row = document.createElement('tr');
    [name, short, Object.keys(code).filter(codon => code[codon] === symbol).join(' · ')].forEach(value => {
      const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
    });
    $('codon-table').appendChild(row);
  });

  function clearFeedback() {
    checked = false;
    $('feedback').hidden = true;
    $('solution').hidden = true;
    $('solution').open = false;
    form.querySelectorAll('[data-result]').forEach(el => el.removeAttribute('data-result'));
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-feedback').forEach(el => { el.textContent = ''; });
    $('rna-feedback-list').hidden = true;
  }
  function updateProgress() {
    const length = normalize($('rna-sequence').value).length;
    const aa = aaInputs();
    $('completion').textContent = `${length} / ${expected.length * 3} mRNA-Zeichen · ${aa.filter(input => input.value).length} / ${aa.length} Zuordnungen`;
  }
  function updateRNA(animate = false) {
    const codons = rnaCodons();
    expected.forEach((_, i) => { $(`entered-${i}`).textContent = codons[i] || '– – –'; });
    $('rna-grouped').textContent = codons.some(Boolean) ? `Deine Codons: ${codons.filter(Boolean).join(' · ')}` : `Erwartet: ${expected.length * 3} Basen (${expected.length} Codons).`;
    renderRNA(animate);
  }
  function renderTask() {
    clearFeedback();
    const dna = tasks[taskIndex].split(' ');
    expected = dna.map(triplet => [...triplet].map(base => complement[base]).join(''));
    $('task-number').textContent = `Aufgabe ${taskIndex + 1} / ${tasks.length} · ${dna.length * 3} Basen`;
    $('dna-sequence').replaceChildren(...dna.map(triplet => {
      const el = document.createElement('code'); el.textContent = triplet; return el;
    }));
    $('rna-sequence').value = '';
    $('rna-feedback-list').innerHTML = dna.map((_, i) => `<li><span>Codon ${i + 1} · Basen ${i * 3 + 1}–${i * 3 + 3}</span><p class="field-feedback" id="rna-feedback-${i}"></p></li>`).join('');
    $('aa-fields').innerHTML = dna.map((_, i) => `<div class="answer-cell"><label for="aa-${i}">Aminosäure / Stopp ${i + 1}</label><span class="entered-codon" id="entered-${i}" aria-label="Dein mRNA-Codon ${i + 1}">– – –</span><select id="aa-${i}" data-aa="${i}" aria-describedby="aa-help entered-${i} aa-feedback-${i}"><option value="">Auswählen …</option>${choices.map(([symbol, [short, name]]) => `<option value="${symbol}">${short} · ${name}</option>`).join('')}</select><p class="field-feedback" id="aa-feedback-${i}"></p></div>`).join('');
    $('solution-content').innerHTML = `<p><strong>mRNA (5′→3′):</strong> ${expected.join(' · ')}</p><p><strong>Polypeptid (N→C):</strong> ${peptide()}</p><p>${expected.at(-1)} ist ein Stoppcodon. Dafür wird keine Aminosäure angefügt.</p>`;
    updateProgress();
    renderPeptide();
    updateRNA();
  }
  function mark(input, correct, message) {
    const result = correct ? 'correct' : 'incorrect';
    input.dataset.result = result;
    input.setAttribute('aria-invalid', String(!correct));
    const feedback = $(`aa-feedback-${input.dataset.aa}`);
    feedback.dataset.result = result;
    feedback.textContent = `${correct ? '✓' : '↳'} ${message}`;
  }
  form.addEventListener('input', event => {
    if (checked) clearFeedback();
    if (event.target.id === 'rna-sequence') updateRNA(true);
    updateProgress();
    if (event.target.hasAttribute('data-aa')) renderPeptide(Number(event.target.dataset.aa));
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    let rnaCorrect = 0, aaCorrect = 0;
    const rna = rnaCodons(), aa = aaInputs();
    expected.forEach((_, i) => {
      const value = rna[i];
      const correct = value === expected[i];
      if (correct) rnaCorrect++;
      let message = 'Prüfe die komplementären Basen zum DNA-Matrizenstrang.';
      if (!value) message = 'Dieses Codon fehlt noch.';
      else if (/T/.test(value)) message = 'RNA enthält U statt T. Prüfe auch die Basenpaarung.';
      else if (!/^[ACGU]{3}$/.test(value)) message = 'Ein Codon besteht aus genau drei Basen: A, U, G oder C.';
      else if (correct) message = 'Richtig transkribiert.';
      const feedback = $(`rna-feedback-${i}`);
      feedback.dataset.result = correct ? 'correct' : 'incorrect';
      feedback.textContent = `${correct ? '✓' : '↳'} ${message}`;
    });
    const length = normalize($('rna-sequence').value).length;
    const expectedLength = expected.length * 3;
    const rnaSuccess = rnaCorrect === expected.length && length === expectedLength;
    $('rna-sequence').setAttribute('aria-invalid', String(!rnaSuccess));
    $('rna-sequence').dataset.result = rnaSuccess ? 'correct' : 'incorrect';
    const summary = $('rna-feedback-summary');
    summary.dataset.result = rnaSuccess ? 'correct' : 'incorrect';
    summary.textContent = `${rnaCorrect} / ${expected.length} Codons richtig.` + (length !== expectedLength ? ` Deine Sequenz enthält ${length} Zeichen; erwartet sind ${expectedLength} Basen. ${length > expectedLength ? 'Entferne die zusätzlichen Zeichen.' : 'Ergänze die fehlenden Basen.'}` : '');
    $('rna-feedback-list').hidden = false;
    aa.forEach((input, i) => {
      const correct = input.value === code[expected[i]];
      if (correct) aaCorrect++;
      const ownRNA = rna[i];
      let message = 'Prüfe das mRNA-Codon in der Codontabelle.';
      if (!input.value) message = 'Wähle eine Aminosäure oder Stopp.';
      else if (correct) message = input.value === '*' ? 'Richtig: Stopp fügt keine Aminosäure an.' : 'Die Aminosäure stimmt.';
      else if (ownRNA !== expected[i] && code[ownRNA] === input.value) message = 'Passt zu deiner mRNA. Prüfe zuerst die Transkription an dieser Stelle.';
      else if (input.value === '*') message = 'Hier geht die Polypeptidkette noch weiter.';
      else if (code[expected[i]] === '*') message = 'Hier endet die Translation. Ein Stoppcodon codiert keine Aminosäure.';
      mark(input, correct, message);
    });
    const success = rnaSuccess && aaCorrect === expected.length;
    const panel = $('feedback');
    panel.innerHTML = `<h2>${success ? 'Alles richtig!' : 'Schau noch einmal genau hin.'}</h2><p><strong>Transkription:</strong> ${rnaCorrect} / ${expected.length} Codons richtig. <strong>Translation:</strong> ${aaCorrect} / ${expected.length} Zuordnungen richtig.</p><p>${success ? `Deine Polypeptidkette: <strong>${peptide()}</strong>. Das Stoppcodon beendet die Translation.` : 'Die Hinweise unter den Feldern zeigen dir, wo du nachbessern kannst. Korrigiere deine Eingaben und prüfe sie erneut oder öffne die Musterlösung.'}</p>`;
    panel.dataset.success = String(success);
    panel.hidden = false;
    $('solution').hidden = false;
    checked = true;
    panel.focus();
  });
  $('reset-answers').addEventListener('click', () => { renderTask(); $('rna-sequence').focus(); });
  $('new-task').addEventListener('click', () => { taskIndex = (taskIndex + 1) % tasks.length; renderTask(); });
  renderTask();
  $('exercise').hidden = false;
  let previousWidth = -1;
  new ResizeObserver(([entry]) => {
    // Height changes as beads are added; only a width change needs a new layout.
    if (entry.contentRect.width === previousWidth) return;
    previousWidth = entry.contentRect.width;
    renderPeptide();
  }).observe($('peptide-drawing'));

})();

// Dependency-free educational surface. Mount outside the canvas. Units/phase
// convention belong to the scene; adapters must evaluate synchronously.
// freeze(phase) -> {phase, stepId, partId?, readout}; no separate lesson clock.
export function createEducationDock({ mount, title, summary, steps, parts,
  min = 0, max = 1, increment = 0.01, freeze, selectPart, setPlaying, resetView }) {
  if (!(max > min) || !(increment > 0) || !steps.length || !parts.length) throw new Error('invalid lesson contract');
  const ids = new Set(parts.map(p => p.id));
  if (ids.size !== parts.length || new Set(steps.map(s => s.id)).size !== steps.length) throw new Error('duplicate IDs');
  for (const s of steps) if (!ids.has(s.partId) || !Number.isFinite(s.phase) || s.phase < min || s.phase > max) throw new Error('invalid causal step');
  const make = (tag, text) => { const e = document.createElement(tag); if (text) e.textContent = text; return e; };
  const root = make('section'); root.className = 'education-dock'; root.setAttribute('aria-label', title);
  root.append(make('h1', title), make('p', summary));
  const controls = make('div'); controls.className = 'education-controls';
  const play = make('button', 'Play'); play.type = 'button'; play.setAttribute('aria-pressed', 'false');
  const reset = make('button', 'Reset view'); reset.type = 'button';
  const phaseLabel = make('label', 'Phase '), slider = make('input');
  slider.type = 'range'; slider.min = min; slider.max = max; slider.step = increment; slider.value = min;
  phaseLabel.append(slider);
  const partLabel = make('label', 'Part '), picker = make('select');
  for (const p of parts) { const o = make('option', p.label); o.value = p.id; picker.append(o); }
  partLabel.append(picker); controls.append(play, reset, phaseLabel, partLabel);
  const readout = make('output'), explanation = make('p');
  readout.setAttribute('aria-live', 'off'); // only deliberate step changes use status
  const disclosure = make('details'); disclosure.append(make('summary', 'How it works'));
  const list = make('ol'), buttons = new Map();
  const status = make('p'); status.className = 'education-sr-only'; status.setAttribute('role', 'status');
  let playing = false;
  const pause = () => { playing = false; setPlaying(false); play.textContent = 'Play'; play.setAttribute('aria-pressed', 'false'); };
  function sync(state) {
    if (!state || !Number.isFinite(state.phase) || state.phase < min || state.phase > max) throw new Error('invalid evaluated scene state');
    const step = steps.find(s => s.id === state.stepId);
    if (!step || (state.partId && !ids.has(state.partId))) throw new Error('unknown evaluated step/part');
    slider.value = state.phase; readout.textContent = state.readout ?? String(state.phase);
    explanation.textContent = `${step.title}: ${step.result}`;
    picker.value = state.partId ?? step.partId;
    for (const [id, button] of buttons) { if (id === state.stepId) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); }
  }
  for (const step of steps) {
    const li = make('li'), button = make('button', step.title); button.type = 'button';
    button.addEventListener('click', () => {
      pause(); const state = freeze(step.phase); sync(state);
      if (state.stepId !== step.id) throw new Error('lesson phase does not evaluate to requested step');
      selectPart(step.partId, state); status.textContent = `${step.title}. ${step.result}`;
    });
    buttons.set(step.id, button); li.append(button, make('p', step.result)); list.append(li);
  }
  disclosure.append(list); root.append(controls, readout, explanation, disclosure, status); mount.append(root);
  play.addEventListener('click', () => { playing = !playing; setPlaying(playing); play.textContent = playing ? 'Pause' : 'Play'; play.setAttribute('aria-pressed', String(playing)); });
  reset.addEventListener('click', resetView);
  slider.addEventListener('input', () => { pause(); sync(freeze(Number(slider.value))); });
  picker.addEventListener('change', () => selectPart(picker.value));
  // UI gestures must never become canvas orbit/pick gestures. Defaults remain
  // intact so native controls, disclosure and keyboard navigation still work.
  const stop = event => event.stopPropagation();
  const events = ['pointerdown', 'pointerup', 'pointermove', 'pointercancel', 'click', 'wheel', 'keydown', 'keyup'];
  for (const name of events) root.addEventListener(name, stop);
  return { root, sync, dispose() { pause(); root.remove(); } };
}

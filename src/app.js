import { AudioEngine } from './audioEngine.js';
import { reusableConfigurations, sampleCompositions, soundPresets } from './data.js';
import { clamp, formatTime, uid } from './format.js';
import { loadCompositions, saveCompositions } from './storage.js';

const root = document.querySelector('#app');
const engine = new AudioEngine();

const state = {
  compositions: loadCompositions(localStorage, sampleCompositions),
  selectedId: null,
  selectedLayerId: null,
  currentTime: 0,
  isPlaying: false,
  libraryOpen: false,
  soundQuery: '',
  saved: true,
  playbackStartedAt: 0,
  playbackOffset: 0,
  timer: null
};

state.selectedId = state.compositions[0]?.id ?? null;
state.selectedLayerId = state.compositions[0]?.layers[0]?.id ?? null;

const icons = {
  headphones: '◉', library: '▦', plus: '+', save: '✓', copy: '⧉', play: '▶', pause: 'Ⅱ', stop: '■', restart: '↺', volume: '◖)))', muted: '◖×', loop: '↻', trash: '⌫', search: '⌕', close: '×'
};

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function currentComposition() {
  return state.compositions.find((item) => item.id === state.selectedId) ?? state.compositions[0] ?? null;
}

function selectedLayer() {
  return currentComposition()?.layers.find((item) => item.id === state.selectedLayerId) ?? null;
}

function presetById(id) {
  return soundPresets.find((preset) => preset.id === id);
}

function freshComposition(name = 'Untitled Soundscape') {
  return {
    id: uid('composition'),
    name,
    description: 'A new ambient composition.',
    duration: 900,
    updatedAt: new Date().toISOString(),
    tags: ['Draft'],
    layers: []
  };
}

function markChanged() {
  state.saved = false;
}

function updateCurrent(mutator) {
  const current = currentComposition();
  if (!current) return;
  const updated = mutator(structuredClone(current));
  updated.updatedAt = new Date().toISOString();
  state.compositions = state.compositions.map((item) => item.id === current.id ? updated : item);
  markChanged();
}

function stopPlayback({ reset = false } = {}) {
  engine.stopAll();
  state.isPlaying = false;
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
  if (reset) state.currentTime = 0;
}

async function startPlayback() {
  const current = currentComposition();
  if (!current) return;
  try {
    await engine.resume();
  } catch (error) {
    showToast(error.message || 'Audio preview is unavailable in this browser.');
    return;
  }

  const offset = state.currentTime >= current.duration ? 0 : state.currentTime;
  engine.stopAll();
  for (const layer of current.layers) {
    if (layer.end <= offset || layer.muted) continue;
    const preset = presetById(layer.presetId);
    if (!preset) continue;
    const active = layer.start <= offset;
    engine.playLayer(layer, preset.kind, active ? offset - layer.start : 0, active ? 0 : layer.start - offset);
  }
  state.currentTime = offset;
  state.playbackOffset = offset;
  state.playbackStartedAt = performance.now();
  state.isPlaying = true;
  state.timer = setInterval(() => {
    const active = currentComposition();
    if (!active || !state.isPlaying) return;
    const next = state.playbackOffset + (performance.now() - state.playbackStartedAt) / 1000;
    if (next >= active.duration) {
      state.currentTime = active.duration;
      stopPlayback();
    } else {
      state.currentTime = next;
    }
    updateTransportUI();
  }, 100);
  render();
}

function updateTransportUI() {
  const current = currentComposition();
  if (!current) return;
  const readout = document.querySelector('[data-current-time]');
  const playhead = document.querySelector('.playhead');
  if (readout) readout.textContent = formatTime(state.currentTime);
  if (playhead) playhead.style.left = `calc(var(--track-label-width) + (100% - var(--track-label-width)) * ${clamp(state.currentTime / current.duration, 0, 1)})`;
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 3200);
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <div class="sidebar-heading">
        <div><span class="eyebrow">Workspace</span><h2>Compositions</h2></div>
        <button class="icon-button" data-action="new" aria-label="Create composition">${icons.plus}</button>
      </div>
      <div class="composition-list">
        ${state.compositions.map((composition) => `
          <article class="composition-card ${composition.id === state.selectedId ? 'selected' : ''}" data-action="select-composition" data-id="${composition.id}">
            <div class="composition-icon">♫</div>
            <div class="composition-card-main"><strong>${escapeHTML(composition.name)}</strong><span>${composition.layers.length} layers · ${formatTime(composition.duration)}</span></div>
            <button class="mini-action" data-action="duplicate" data-id="${composition.id}" aria-label="Duplicate ${escapeHTML(composition.name)}">${icons.copy}</button>
          </article>
        `).join('')}
      </div>
      <div class="sidebar-tip"><span class="tip-icon">⋯</span><div><strong>Version safely</strong><span>Duplicate a mix before experimenting with a new arrangement.</span></div></div>
    </aside>
  `;
}

function renderTransport(current) {
  return `
    <div class="transport" aria-label="Playback controls">
      <button class="icon-button" data-action="restart" aria-label="Restart preview">${icons.restart}</button>
      <button class="play-button" data-action="play-pause" aria-label="${state.isPlaying ? 'Pause' : 'Play'} preview">${state.isPlaying ? icons.pause : icons.play}</button>
      <button class="icon-button" data-action="stop" aria-label="Stop preview">${icons.stop}</button>
      <div class="time-readout"><strong data-current-time>${formatTime(state.currentTime)}</strong><span>/ ${formatTime(current.duration)}</span></div>
      <div class="preview-label">Preview playback</div>
    </div>
  `;
}

function renderTimeline(current) {
  const ticks = Array.from({ length: 7 }, (_, i) => Math.round((current.duration / 6) * i));
  return `
    <section class="timeline-panel panel">
      <div class="timeline-ruler">
        <div class="track-label-spacer">Timeline</div>
        <div class="ruler-track">${ticks.map((tick) => `<span style="left:${(tick / current.duration) * 100}%">${formatTime(tick)}</span>`).join('')}</div>
      </div>
      <div class="timeline-body">
        <div class="playhead" style="left:calc(var(--track-label-width) + (100% - var(--track-label-width)) * ${clamp(state.currentTime / current.duration, 0, 1)})"></div>
        ${current.layers.length ? current.layers.map((layer) => {
          const preset = presetById(layer.presetId);
          const left = (layer.start / current.duration) * 100;
          const width = Math.max(1, ((layer.end - layer.start) / current.duration) * 100);
          return `
            <div class="timeline-row ${layer.id === state.selectedLayerId ? 'active' : ''}">
              <button class="track-meta" data-action="select-layer" data-id="${layer.id}">
                <span class="sound-dot" style="background:${preset?.accent ?? '#64748b'}"></span>
                <span class="track-copy"><strong>${escapeHTML(layer.name)}</strong><small>${layer.volume}% volume</small></span>
                <span class="track-icons"><span>${layer.loop ? icons.loop : ''}</span><span data-action="toggle-mute" data-id="${layer.id}" aria-label="Toggle mute">${layer.muted ? icons.muted : icons.volume}</span></span>
              </button>
              <div class="track-lane" data-action="seek" data-duration="${current.duration}">
                <button class="timeline-block" data-action="select-layer" data-id="${layer.id}" style="left:${left}%;width:${width}%;border-color:${preset?.accent ?? '#64748b'};background:${preset?.accent ?? '#64748b'}26" title="${escapeHTML(layer.name)}: ${formatTime(layer.start)}–${formatTime(layer.end)}">
                  <span class="fade fade-in" style="width:${Math.min(40, (layer.fadeIn / Math.max(1, layer.end - layer.start)) * 100)}%"></span>
                  <span class="block-label">${formatTime(layer.start)} – ${formatTime(layer.end)}</span>
                  <span class="fade fade-out" style="width:${Math.min(40, (layer.fadeOut / Math.max(1, layer.end - layer.start)) * 100)}%"></span>
                </button>
              </div>
            </div>`;
        }).join('') : '<div class="empty-timeline">Add a sound layer to begin arranging your composition.</div>'}
      </div>
    </section>
  `;
}

function renderSoundBrowser() {
  const q = state.soundQuery.trim().toLowerCase();
  const filtered = q ? soundPresets.filter((preset) => `${preset.name} ${preset.category} ${preset.description}`.toLowerCase().includes(q)) : soundPresets;
  return `
    <section class="sound-browser panel">
      <div class="panel-title-row"><div><span class="eyebrow">Sound palette</span><h3>Add a layer</h3></div><span class="panel-icon">≈</span></div>
      <label class="search-box"><span>${icons.search}</span><input data-input="sound-search" value="${escapeHTML(state.soundQuery)}" placeholder="Search sounds" aria-label="Search sounds"></label>
      <div class="sound-grid">
        ${filtered.map((preset) => `
          <button class="sound-card" data-action="add-preset" data-id="${preset.id}" title="${escapeHTML(preset.description)}">
            <span class="sound-dot" style="background:${preset.accent}"></span>
            <span class="sound-copy"><strong>${escapeHTML(preset.name)}</strong><small>${preset.category}</small></span><span class="card-plus">${icons.plus}</span>
          </button>`).join('')}
      </div>
    </section>
  `;
}

function renderInspector(current) {
  const layer = selectedLayer();
  if (!layer) return `<aside class="inspector panel empty-inspector"><div><span class="eyebrow">Layer controls</span><h3>Select a timeline layer</h3><p>Fine-tune volume, timing, fades, looping, and mute state here.</p></div></aside>`;
  return `
    <aside class="inspector panel">
      <div class="panel-title-row"><div><span class="eyebrow">Layer controls</span><h3>${escapeHTML(layer.name)}</h3></div><button class="icon-button danger" data-action="delete-layer" aria-label="Delete layer">${icons.trash}</button></div>
      <div class="control-group">
        <div class="control-label"><span>${icons.volume} Volume</span><strong>${layer.volume}%</strong></div>
        <input type="range" min="0" max="100" value="${layer.volume}" data-layer-field="volume" aria-label="Layer volume">
      </div>
      <div class="input-grid">
        <label>Starts at<input type="number" min="0" max="${Math.max(0, layer.end - 1)}" value="${layer.start}" data-layer-field="start"><small>${formatTime(layer.start)}</small></label>
        <label>Ends at<input type="number" min="${layer.start + 1}" max="${current.duration}" value="${layer.end}" data-layer-field="end"><small>${formatTime(layer.end)}</small></label>
        <label>Fade in<input type="number" min="0" max="120" value="${layer.fadeIn}" data-layer-field="fadeIn"><small>seconds</small></label>
        <label>Fade out<input type="number" min="0" max="120" value="${layer.fadeOut}" data-layer-field="fadeOut"><small>seconds</small></label>
      </div>
      <div class="toggle-stack">
        <button class="toggle-row ${layer.loop ? 'on' : ''}" data-action="toggle-loop"><span>${icons.loop} Loop layer</span><span class="switch"><i></i></span></button>
        <button class="toggle-row ${layer.muted ? 'on' : ''}" data-action="toggle-selected-mute"><span>${layer.muted ? icons.muted : icons.volume} Mute layer</span><span class="switch"><i></i></span></button>
      </div>
      <p class="inspector-note">Timing values use seconds for precise editing. The timeline converts them to a visual arrangement automatically.</p>
    </aside>`;
}

function renderLibrary() {
  if (!state.libraryOpen) return '';
  return `
    <div class="modal-backdrop" data-action="close-library">
      <section class="modal" role="dialog" aria-modal="true" aria-label="Reusable sound configurations" data-modal>
        <div class="modal-header"><div><span class="eyebrow">Reusable library</span><h2>Sound configurations</h2><p>Start from a tested mix, then customize it for your own project.</p></div><button class="icon-button" data-action="close-library" aria-label="Close library">${icons.close}</button></div>
        <div class="library-grid">
          ${reusableConfigurations.map((config) => `
            <article class="library-card"><div class="library-card-top"><span class="pill">${escapeHTML(config.useCase)}</span><span class="location">⌖ ${escapeHTML(config.location)}</span></div>
              <h3>${escapeHTML(config.name)}</h3><p>${escapeHTML(config.description)}</p>
              <div class="layer-pills">${config.layers.map((layer) => `<span>${escapeHTML(layer.name)} · ${layer.volume}%</span>`).join('')}</div>
              <button class="button secondary full" data-action="use-config" data-id="${config.id}">${icons.plus} Add as composition</button>
            </article>`).join('')}
        </div>
      </section>
    </div>`;
}

function render() {
  const current = currentComposition();
  if (!current) {
    root.innerHTML = '<main class="fatal-state"><h1>No composition data available.</h1></main>';
    return;
  }
  root.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand"><div class="brand-mark">${icons.headphones}</div><div><strong>Soundscape Composer</strong><span>Ambient workspace</span></div></div>
        <div class="topbar-actions">
          <button class="button ghost" data-action="open-library">${icons.library}<span>Library</span></button>
          <button class="button ghost" data-action="new">${icons.plus}<span>New</span></button>
          <button class="button primary" data-action="save">${icons.save} ${state.saved ? 'Saved' : 'Save'}</button>
        </div>
        <div class="business-badge">✦ Built for small creative teams</div>
      </header>
      <div class="workspace">
        ${renderSidebar()}
        <main class="editor">
          <section class="editor-header">
            <div class="title-fields"><input class="composition-title" data-current-field="name" value="${escapeHTML(current.name)}" aria-label="Composition name"><input class="composition-description" data-current-field="description" value="${escapeHTML(current.description)}" aria-label="Composition description"></div>
            <div class="header-tools"><label class="duration-field"><span>Duration (sec)</span><input type="number" min="60" max="3600" step="30" data-current-field="duration" value="${current.duration}"></label><button class="button secondary" data-action="duplicate" data-id="${current.id}">${icons.copy} Duplicate</button></div>
          </section>
          ${renderTransport(current)}
          <div class="main-grid"><div class="arrangement-column">${renderTimeline(current)}${renderSoundBrowser()}</div>${renderInspector(current)}</div>
          <footer class="editor-footer">☷ Changes stay in this browser until you save. No account or audio upload is required.</footer>
        </main>
      </div>
      ${renderLibrary()}
    </div>`;
}

function duplicateComposition(id) {
  const source = state.compositions.find((item) => item.id === id);
  if (!source) return;
  stopPlayback({ reset: true });
  const copy = structuredClone(source);
  copy.id = uid('composition');
  copy.name = `${source.name} — Copy`;
  copy.updatedAt = new Date().toISOString();
  copy.layers = copy.layers.map((layer) => ({ ...layer, id: uid('layer') }));
  state.compositions = [copy, ...state.compositions];
  state.selectedId = copy.id;
  state.selectedLayerId = copy.layers[0]?.id ?? null;
  markChanged();
}

function addPreset(id) {
  const preset = presetById(id);
  const current = currentComposition();
  if (!preset || !current) return;
  const layer = { id: uid('layer'), presetId: preset.id, name: preset.name, volume: 50, start: 0, end: current.duration, fadeIn: 5, fadeOut: 8, loop: true, muted: false };
  updateCurrent((draft) => { draft.layers.push(layer); return draft; });
  state.selectedLayerId = layer.id;
}

function patchLayer(field, rawValue) {
  const current = currentComposition();
  const layer = selectedLayer();
  if (!current || !layer) return;
  const limits = {
    volume: [0, 100],
    start: [0, Math.max(0, layer.end - 1)],
    end: [layer.start + 1, current.duration],
    fadeIn: [0, 120],
    fadeOut: [0, 120]
  };
  const [min, max] = limits[field] ?? [0, 999999];
  const value = clamp(Number(rawValue) || 0, min, max);
  updateCurrent((draft) => {
    const target = draft.layers.find((item) => item.id === layer.id);
    if (target) target[field] = value;
    return draft;
  });
  if (state.isPlaying) stopPlayback();
}

root.addEventListener('click', async (event) => {
  const actionNode = event.target.closest('[data-action]');
  if (!actionNode) return;
  const action = actionNode.dataset.action;
  const id = actionNode.dataset.id;

  if (action === 'new') {
    stopPlayback({ reset: true });
    const next = freshComposition();
    state.compositions = [next, ...state.compositions];
    state.selectedId = next.id; state.selectedLayerId = null; markChanged();
  } else if (action === 'select-composition') {
    if (event.target.closest('.mini-action')) return;
    stopPlayback({ reset: true });
    state.selectedId = id;
    state.selectedLayerId = currentComposition()?.layers[0]?.id ?? null;
  } else if (action === 'duplicate') {
    duplicateComposition(id);
  } else if (action === 'save') {
    saveCompositions(localStorage, state.compositions); state.saved = true; showToast('Compositions saved in this browser.');
  } else if (action === 'open-library') {
    state.libraryOpen = true;
  } else if (action === 'close-library') {
    if (event.target.closest('[data-modal]') && !event.target.closest('button[data-action="close-library"]')) return;
    state.libraryOpen = false;
  } else if (action === 'use-config') {
    const config = reusableConfigurations.find((item) => item.id === id);
    if (config) {
      const duration = Math.max(900, ...config.layers.map((layer) => layer.end));
      const next = { id: uid('composition'), name: config.name, description: config.description, duration, updatedAt: new Date().toISOString(), tags: [config.useCase, config.location], layers: config.layers.map((layer) => ({ ...structuredClone(layer), id: uid('layer') })) };
      state.compositions = [next, ...state.compositions]; state.selectedId = next.id; state.selectedLayerId = next.layers[0]?.id ?? null; state.libraryOpen = false; state.currentTime = 0; markChanged();
    }
  } else if (action === 'add-preset') {
    addPreset(id);
  } else if (action === 'select-layer') {
    state.selectedLayerId = id;
  } else if (action === 'delete-layer') {
    const layer = selectedLayer();
    if (layer) { updateCurrent((draft) => { draft.layers = draft.layers.filter((item) => item.id !== layer.id); return draft; }); state.selectedLayerId = null; }
  } else if (action === 'toggle-loop') {
    const layer = selectedLayer(); if (layer) updateCurrent((draft) => { const target = draft.layers.find((item) => item.id === layer.id); if (target) target.loop = !target.loop; return draft; });
  } else if (action === 'toggle-selected-mute' || action === 'toggle-mute') {
    if (id) state.selectedLayerId = id;
    const layer = selectedLayer(); if (layer) updateCurrent((draft) => { const target = draft.layers.find((item) => item.id === layer.id); if (target) target.muted = !target.muted; return draft; });
  } else if (action === 'play-pause') {
    if (state.isPlaying) stopPlayback(); else await startPlayback();
  } else if (action === 'stop') {
    stopPlayback({ reset: true });
  } else if (action === 'restart') {
    stopPlayback({ reset: true });
    await startPlayback();
    return;
  } else if (action === 'seek') {
    if (event.target.closest('.timeline-block')) return;
    const rect = actionNode.getBoundingClientRect();
    state.currentTime = clamp(((event.clientX - rect.left) / rect.width) * Number(actionNode.dataset.duration), 0, Number(actionNode.dataset.duration));
    stopPlayback();
  }
  render();
});

root.addEventListener('input', (event) => {
  const target = event.target;
  if (target.matches('[data-input="sound-search"]')) {
    state.soundQuery = target.value;
    render();
    const search = document.querySelector('[data-input="sound-search"]');
    search?.focus();
    search?.setSelectionRange(state.soundQuery.length, state.soundQuery.length);
    return;
  }
  if (target.dataset.layerField) {
    patchLayer(target.dataset.layerField, target.value);
    render();
    return;
  }
  if (target.dataset.currentField) {
    const field = target.dataset.currentField;
    if (field === 'duration') {
      const duration = clamp(Number(target.value) || 60, 60, 3600);
      updateCurrent((draft) => {
        draft.duration = duration;
        draft.layers = draft.layers.map((layer) => ({ ...layer, start: Math.min(layer.start, duration - 1), end: Math.max(Math.min(layer.end, duration), Math.min(layer.start + 1, duration)) }));
        return draft;
      });
    } else {
      updateCurrent((draft) => { draft[field] = target.value; return draft; });
    }
    const cursor = target.selectionStart;
    render();
    const replacement = document.querySelector(`[data-current-field="${field}"]`);
    replacement?.focus();
    if (cursor != null && replacement?.setSelectionRange) replacement.setSelectionRange(cursor, cursor);
  }
});

window.addEventListener('beforeunload', () => engine.stopAll());
render();

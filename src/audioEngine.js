import { clamp } from './format.js';

function createNoiseBuffer(context, color = 'white') {
  const length = context.sampleRate * 4;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (color === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

export class AudioEngine {
  #context = null;
  #voices = [];

  getContext() {
    if (!this.#context) {
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio API is not supported in this browser.');
      this.#context = new AudioContextClass();
    }
    return this.#context;
  }

  async resume() {
    const context = this.getContext();
    if (context.state === 'suspended') await context.resume();
  }

  stopAll() {
    this.#voices.forEach((stop) => stop());
    this.#voices = [];
  }

  playLayer(layer, kind, offsetInLayer = 0, delay = 0) {
    if (layer.muted || layer.volume <= 0) return;
    const context = this.getContext();
    const now = context.currentTime + Math.max(0, delay);
    const remaining = Math.max(0.1, layer.end - layer.start - offsetInLayer);
    const duration = layer.loop ? remaining : Math.min(remaining, 4);
    const gain = context.createGain();
    const target = clamp(layer.volume / 100, 0, 1) * 0.2;
    gain.connect(context.destination);

    const fadeInRemaining = Math.min(duration, Math.max(0, layer.fadeIn - offsetInLayer));
    const fadeOutDuration = Math.min(duration, Math.max(0, layer.fadeOut));
    const fadeOutStart = Math.max(fadeInRemaining, duration - fadeOutDuration);
    gain.gain.setValueAtTime(fadeInRemaining > 0 ? 0.0001 : Math.max(target, 0.0001), now);
    if (fadeInRemaining > 0) gain.gain.exponentialRampToValueAtTime(Math.max(target, 0.0001), now + fadeInRemaining);
    if (fadeOutDuration > 0 && fadeOutStart < duration) {
      gain.gain.setValueAtTime(Math.max(target, 0.0001), now + fadeOutStart);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    const nodes = [];
    const addNoise = (filterType, frequency, color = 'white') => {
      const source = context.createBufferSource();
      source.buffer = createNoiseBuffer(context, color);
      source.loop = Boolean(layer.loop);
      const filter = context.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = frequency;
      source.connect(filter).connect(gain);
      source.start(now);
      source.stop(now + duration);
      nodes.push(source);
    };

    const addTone = (frequency, detune = 0, volume = 0.05) => {
      const oscillator = context.createOscillator();
      const toneGain = context.createGain();
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      toneGain.gain.value = volume;
      oscillator.connect(toneGain).connect(gain);
      oscillator.start(now);
      oscillator.stop(now + duration);
      nodes.push(oscillator);
    };

    switch (kind) {
      case 'rain': addNoise('highpass', 1200); break;
      case 'ocean': addNoise('lowpass', 600, 'brown'); addTone(72, -12, 0.02); break;
      case 'wind': addNoise('bandpass', 700, 'brown'); break;
      case 'fire': addNoise('lowpass', 950, 'brown'); addTone(58, 4, 0.025); break;
      case 'birds': addNoise('highpass', 2400); addTone(1980, 16, 0.028); addTone(2470, -10, 0.018); break;
      case 'cafe': addNoise('bandpass', 520, 'brown'); addTone(180, -7, 0.02); break;
      case 'brown-noise': addNoise('lowpass', 900, 'brown'); break;
      case 'night': addNoise('lowpass', 1100, 'brown'); addTone(3200, 12, 0.012); break;
      default: addNoise('lowpass', 1000, 'brown');
    }

    this.#voices.push(() => {
      nodes.forEach((node) => { try { node.stop(); } catch {} });
      try { gain.disconnect(); } catch {}
    });
  }
}

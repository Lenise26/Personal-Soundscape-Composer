export const soundPresets = [
  { id: 'rain', name: 'Soft Rain', kind: 'rain', category: 'Nature', description: 'Gentle rainfall with a soft, wide texture.', accent: '#5b8def' },
  { id: 'ocean', name: 'Pacific Waves', kind: 'ocean', category: 'Nature', description: 'Slow rolling coastal surf inspired by the U.S. Pacific coast.', accent: '#38bdf8' },
  { id: 'wind', name: 'Mountain Wind', kind: 'wind', category: 'Nature', description: 'Airy wind bed with natural movement.', accent: '#94a3b8' },
  { id: 'fire', name: 'Fireplace', kind: 'fire', category: 'Nature', description: 'Warm crackle texture for cozy work sessions.', accent: '#fb923c' },
  { id: 'birds', name: 'Morning Birds', kind: 'birds', category: 'Nature', description: 'Light, intermittent songbird tones.', accent: '#84cc16' },
  { id: 'cafe', name: 'Coffee Shop', kind: 'cafe', category: 'Urban', description: 'Low conversational wash and room tone.', accent: '#c084fc' },
  { id: 'brown-noise', name: 'Brown Noise', kind: 'brown-noise', category: 'Focus', description: 'Deep filtered noise for concentration and privacy.', accent: '#a78bfa' },
  { id: 'night', name: 'Night Field', kind: 'night', category: 'Nature', description: 'Soft nocturnal ambience with occasional high tones.', accent: '#6366f1' }
];

export const sampleCompositions = [
  {
    id: 'sample-rainy-morning',
    name: 'Rainy Morning Draft',
    description: 'A focused writing bed with a gentle transition into morning birds.',
    duration: 900,
    updatedAt: '2026-08-08T14:30:00.000Z',
    tags: ['Writing', 'Focus'],
    layers: [
      { id: 'layer-rain', presetId: 'rain', name: 'Soft Rain', volume: 68, start: 0, end: 900, fadeIn: 8, fadeOut: 12, loop: true, muted: false },
      { id: 'layer-brown', presetId: 'brown-noise', name: 'Brown Noise', volume: 24, start: 0, end: 720, fadeIn: 15, fadeOut: 20, loop: true, muted: false },
      { id: 'layer-birds', presetId: 'birds', name: 'Morning Birds', volume: 30, start: 630, end: 900, fadeIn: 25, fadeOut: 15, loop: true, muted: false }
    ]
  },
  {
    id: 'sample-portland-lounge',
    name: 'Client Lounge — Portland',
    description: 'Warm ambient mix for a small creative studio reception area.',
    duration: 1200,
    updatedAt: '2026-08-07T17:15:00.000Z',
    tags: ['Client Space', 'Studio'],
    layers: [
      { id: 'layer-fire', presetId: 'fire', name: 'Fireplace', volume: 42, start: 0, end: 1200, fadeIn: 10, fadeOut: 10, loop: true, muted: false },
      { id: 'layer-cafe', presetId: 'cafe', name: 'Coffee Shop', volume: 25, start: 60, end: 1140, fadeIn: 20, fadeOut: 25, loop: true, muted: false },
      { id: 'layer-portland-rain', presetId: 'rain', name: 'Soft Rain', volume: 32, start: 0, end: 1200, fadeIn: 8, fadeOut: 15, loop: true, muted: false }
    ]
  }
];

export const reusableConfigurations = [
  {
    id: 'seattle-focus',
    name: 'Seattle Rain Focus',
    description: 'A calm, rain-forward setup designed for focused creative work.',
    location: 'Seattle, WA',
    useCase: 'Deep work',
    layers: [
      { presetId: 'rain', name: 'Soft Rain', volume: 72, start: 0, end: 900, fadeIn: 8, fadeOut: 10, loop: true, muted: false },
      { presetId: 'brown-noise', name: 'Brown Noise', volume: 28, start: 15, end: 900, fadeIn: 20, fadeOut: 15, loop: true, muted: false }
    ]
  },
  {
    id: 'brooklyn-studio',
    name: 'Brooklyn Studio',
    description: 'Low café energy with a steady masking layer for design or writing sessions.',
    location: 'Brooklyn, NY',
    useCase: 'Creative studio',
    layers: [
      { presetId: 'cafe', name: 'Coffee Shop', volume: 48, start: 0, end: 1200, fadeIn: 5, fadeOut: 12, loop: true, muted: false },
      { presetId: 'brown-noise', name: 'Brown Noise', volume: 20, start: 0, end: 1200, fadeIn: 3, fadeOut: 8, loop: true, muted: false }
    ]
  },
  {
    id: 'big-sur-reset',
    name: 'Big Sur Reset',
    description: 'Slow ocean movement with wind for a spacious relaxation environment.',
    location: 'Big Sur, CA',
    useCase: 'Relaxation',
    layers: [
      { presetId: 'ocean', name: 'Pacific Waves', volume: 64, start: 0, end: 1500, fadeIn: 12, fadeOut: 18, loop: true, muted: false },
      { presetId: 'wind', name: 'Mountain Wind', volume: 26, start: 25, end: 1450, fadeIn: 20, fadeOut: 20, loop: true, muted: false }
    ]
  }
];

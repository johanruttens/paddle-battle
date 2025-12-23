/**
 * Sound Generator Utility
 * Generates simple 8-bit style sounds as base64 WAV data
 */

// WAV file header generator
function createWavHeader(dataLength: number, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // "RIFF"
  view.setUint8(0, 0x52);
  view.setUint8(1, 0x49);
  view.setUint8(2, 0x46);
  view.setUint8(3, 0x46);

  // File size
  view.setUint32(4, 36 + dataLength, true);

  // "WAVE"
  view.setUint8(8, 0x57);
  view.setUint8(9, 0x41);
  view.setUint8(10, 0x56);
  view.setUint8(11, 0x45);

  // "fmt "
  view.setUint8(12, 0x66);
  view.setUint8(13, 0x6d);
  view.setUint8(14, 0x74);
  view.setUint8(15, 0x20);

  // Subchunk1Size (16 for PCM)
  view.setUint32(16, 16, true);

  // AudioFormat (1 for PCM)
  view.setUint16(20, 1, true);

  // NumChannels (1 for mono)
  view.setUint16(22, 1, true);

  // SampleRate
  view.setUint32(24, sampleRate, true);

  // ByteRate
  view.setUint32(28, sampleRate, true);

  // BlockAlign
  view.setUint16(32, 1, true);

  // BitsPerSample
  view.setUint16(34, 8, true);

  // "data"
  view.setUint8(36, 0x64);
  view.setUint8(37, 0x61);
  view.setUint8(38, 0x74);
  view.setUint8(39, 0x61);

  // Subchunk2Size
  view.setUint32(40, dataLength, true);

  return buffer;
}

// Generate square wave samples
function generateSquareWave(
  frequency: number,
  duration: number,
  sampleRate: number,
  volume: number = 0.5
): Uint8Array {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Uint8Array(numSamples);
  const period = sampleRate / frequency;

  for (let i = 0; i < numSamples; i++) {
    const phase = (i % period) / period;
    const value = phase < 0.5 ? 1 : -1;
    // Apply envelope (fade out)
    const envelope = 1 - i / numSamples;
    samples[i] = Math.floor(128 + value * 127 * volume * envelope);
  }

  return samples;
}

// Generate sine wave samples
function generateSineWave(
  frequency: number,
  duration: number,
  sampleRate: number,
  volume: number = 0.5
): Uint8Array {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Uint8Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t);
    // Apply envelope (fade out)
    const envelope = 1 - i / numSamples;
    samples[i] = Math.floor(128 + value * 127 * volume * envelope);
  }

  return samples;
}

// Generate frequency sweep (for power-up sounds)
function generateSweep(
  startFreq: number,
  endFreq: number,
  duration: number,
  sampleRate: number,
  volume: number = 0.5
): Uint8Array {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Uint8Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples;
    const frequency = startFreq + (endFreq - startFreq) * t;
    const phase = (i / sampleRate) * frequency * 2 * Math.PI;
    const value = Math.sin(phase);
    const envelope = 1 - t * 0.5; // Slight fade
    samples[i] = Math.floor(128 + value * 127 * volume * envelope);
  }

  return samples;
}

// Generate noise burst (for impacts)
function generateNoise(
  duration: number,
  sampleRate: number,
  volume: number = 0.3
): Uint8Array {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Uint8Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const noise = Math.random() * 2 - 1;
    const envelope = 1 - i / numSamples;
    samples[i] = Math.floor(128 + noise * 127 * volume * envelope * envelope);
  }

  return samples;
}

// Combine samples into WAV data URI
function createWavDataUri(samples: Uint8Array, sampleRate: number): string {
  const header = createWavHeader(samples.length, sampleRate);
  const headerArray = new Uint8Array(header);
  const combined = new Uint8Array(headerArray.length + samples.length);
  combined.set(headerArray);
  combined.set(samples, headerArray.length);

  // Convert to base64
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  const base64 = btoa(binary);

  return `data:audio/wav;base64,${base64}`;
}

// Pre-generated sound data URIs
const SAMPLE_RATE = 22050;

export const SOUND_URIS = {
  // Paddle hit - short punchy square wave
  paddleHit: (): string => {
    const samples = generateSquareWave(440, 0.05, SAMPLE_RATE, 0.4);
    return createWavDataUri(samples, SAMPLE_RATE);
  },

  // Wall bounce - higher pitch, shorter
  wallBounce: (): string => {
    const samples = generateSquareWave(660, 0.03, SAMPLE_RATE, 0.3);
    return createWavDataUri(samples, SAMPLE_RATE);
  },

  // Player score - ascending sweep
  playerScore: (): string => {
    const samples = generateSweep(440, 880, 0.15, SAMPLE_RATE, 0.5);
    return createWavDataUri(samples, SAMPLE_RATE);
  },

  // AI score - descending tone
  aiScore: (): string => {
    const samples = generateSweep(440, 220, 0.2, SAMPLE_RATE, 0.4);
    return createWavDataUri(samples, SAMPLE_RATE);
  },

  // Game start - ascending arpeggio
  gameStart: (): string => {
    const s1 = generateSineWave(330, 0.1, SAMPLE_RATE, 0.4);
    const s2 = generateSineWave(440, 0.1, SAMPLE_RATE, 0.4);
    const s3 = generateSineWave(550, 0.15, SAMPLE_RATE, 0.5);
    const combined = new Uint8Array(s1.length + s2.length + s3.length);
    combined.set(s1);
    combined.set(s2, s1.length);
    combined.set(s3, s1.length + s2.length);
    return createWavDataUri(combined, SAMPLE_RATE);
  },

  // Game over (win) - triumphant
  gameWin: (): string => {
    const s1 = generateSineWave(523, 0.15, SAMPLE_RATE, 0.5); // C5
    const s2 = generateSineWave(659, 0.15, SAMPLE_RATE, 0.5); // E5
    const s3 = generateSineWave(784, 0.25, SAMPLE_RATE, 0.6); // G5
    const combined = new Uint8Array(s1.length + s2.length + s3.length);
    combined.set(s1);
    combined.set(s2, s1.length);
    combined.set(s3, s1.length + s2.length);
    return createWavDataUri(combined, SAMPLE_RATE);
  },

  // Game over (lose) - sad descending
  gameLose: (): string => {
    const s1 = generateSineWave(330, 0.2, SAMPLE_RATE, 0.4);
    const s2 = generateSineWave(262, 0.3, SAMPLE_RATE, 0.3);
    const combined = new Uint8Array(s1.length + s2.length);
    combined.set(s1);
    combined.set(s2, s1.length);
    return createWavDataUri(combined, SAMPLE_RATE);
  },

  // Menu select - quick blip
  menuSelect: (): string => {
    const samples = generateSineWave(880, 0.05, SAMPLE_RATE, 0.3);
    return createWavDataUri(samples, SAMPLE_RATE);
  },

  // Level up - exciting sweep
  levelUp: (): string => {
    const samples = generateSweep(440, 1760, 0.3, SAMPLE_RATE, 0.5);
    return createWavDataUri(samples, SAMPLE_RATE);
  },
};

export type SoundName = keyof typeof SOUND_URIS;

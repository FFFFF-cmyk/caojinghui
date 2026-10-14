// Web Audio API subtle acoustic synthesizer for plastering trowel friction
let audioCtx: AudioContext | null = null;
let noiseNode: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let isAudioEnabled = false;

export function toggleAudio(enable?: boolean): boolean {
  if (typeof enable === 'boolean') {
    isAudioEnabled = enable;
  } else {
    isAudioEnabled = !isAudioEnabled;
  }

  if (isAudioEnabled) {
    initAudio();
  } else {
    stopScrape();
  }
  return isAudioEnabled;
}

export function getAudioStatus(): boolean {
  return isAudioEnabled;
}

function initAudio() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (e) {
    console.warn('Web Audio not supported in this environment', e);
  }
}

export function playTrowelScrape(pressure: number, speed: number, angle: number) {
  if (!isAudioEnabled) return;
  initAudio();
  if (!audioCtx) return;

  try {
    // Generate pink noise burst modulated by pressure & angle
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.25;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    // Angle affects frequency brightness: lower angle (burnishing) is higher pitched
    filter.type = 'bandpass';
    filter.frequency.value = 400 + (45 - Math.min(45, angle)) * 18 + speed * 15;
    filter.Q.value = 1.4;

    const gain = audioCtx.createGain();
    const volume = Math.min(0.12, (pressure / 50) * 0.08 + (speed / 50) * 0.04);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    source.start();
  } catch {
    // Ignore audio errors gracefully
  }
}

export function stopScrape() {
  if (gainNode && audioCtx) {
    try {
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    } catch {
      // ignore
    }
  }
}

import { Atmosphere } from './drift-store';

class AmbientAudioManager {
  private audioContext: AudioContext | null = null;
  private nodes: AudioNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentAtmosphere: Atmosphere | null = null;
  private intervals: number[] = [];

  private cleanup() {
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];
    this.nodes.forEach(n => { try { n.disconnect(); } catch {} });
    this.nodes = [];
  }

  private createRain(ctx: AudioContext, dest: AudioNode) {
    // Brown noise filtered for rain
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Bandpass to shape like rain
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 0.5;

    // Highpass for crispness
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 200;
    hp.Q.value = 0.3;

    src.connect(bp);
    bp.connect(hp);
    hp.connect(dest);
    src.start();
    this.nodes.push(src, bp, hp);

    // Intermittent drip/patter layer
    const dripBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const dripData = dripBuffer.getChannelData(0);
    for (let i = 0; i < dripData.length; i++) {
      const t = i / ctx.sampleRate;
      dripData[i] = Math.sin(t * 3000) * Math.exp(-t * 60) * 0.3 * (Math.random() * 0.5 + 0.5);
    }

    const dripGain = ctx.createGain();
    dripGain.gain.value = 0.15;
    dripGain.connect(dest);
    this.nodes.push(dripGain);

    const playDrip = () => {
      const d = ctx.createBufferSource();
      d.buffer = dripBuffer;
      d.playbackRate.value = 0.7 + Math.random() * 0.6;
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 2 - 1;
      d.connect(pan);
      pan.connect(dripGain);
      d.start();
    };

    const id = window.setInterval(() => {
      if (Math.random() < 0.4) playDrip();
    }, 150);
    this.intervals.push(id);
  }

  private createBirds(ctx: AudioContext, dest: AudioNode) {
    // Very soft "air" bed (filtered pink noise)
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.012;
        b6 = w * 0.115926;
      }
    }
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = buffer;
    windSrc.loop = true;
    const windHp = ctx.createBiquadFilter();
    windHp.type = 'highpass';
    windHp.frequency.value = 450;
    windHp.Q.value = 0.4;
    const windLp = ctx.createBiquadFilter();
    windLp.type = 'lowpass';
    windLp.frequency.value = 3200;
    windLp.Q.value = 0.35;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.04;
    windSrc.connect(windHp);
    windHp.connect(windLp);
    windLp.connect(windGain);
    windGain.connect(dest);
    windSrc.start();
    this.nodes.push(windSrc, windHp, windLp, windGain);

    // Bird chirp synthesizer
    const birdGain = ctx.createGain();
    birdGain.gain.value = 0.2;
    birdGain.connect(dest);
    this.nodes.push(birdGain);

    const chirp = () => {
      const now = ctx.currentTime;
      const baseFreq = 1700 + Math.random() * 2600;
      const notes = 2 + Math.floor(Math.random() * 3);

      for (let n = 0; n < notes; n++) {
        const startTime = now + n * (0.08 + Math.random() * 0.06);
        const duration = 0.06 + Math.random() * 0.08;
        
        const osc = ctx.createOscillator();
        osc.type = Math.random() < 0.5 ? 'triangle' : 'sine';
        const noteFreq = baseFreq + (Math.random() - 0.5) * 900;
        osc.frequency.setValueAtTime(noteFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(
          noteFreq * (1.08 + Math.random() * 0.35),
          startTime + duration
        );

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.14 + Math.random() * 0.14, startTime + duration * 0.18);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        const pan = ctx.createStereoPanner();
        pan.pan.value = Math.random() * 2 - 1;

        const chirpFilter = ctx.createBiquadFilter();
        chirpFilter.type = 'bandpass';
        chirpFilter.frequency.value = noteFreq;
        chirpFilter.Q.value = 8;

        osc.connect(env);
        env.connect(chirpFilter);
        chirpFilter.connect(pan);
        pan.connect(birdGain);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.01);

        this.nodes.push(env, pan, chirpFilter, osc);
      }
    };

    // Kick off immediately so sunrise is not perceived as static
    chirp();
    const id1 = window.setInterval(() => {
      if (Math.random() < 0.65) chirp();
    }, 900);
    const id2 = window.setInterval(() => {
      if (Math.random() < 0.45) chirp();
    }, 1700);
    this.intervals.push(id1, id2);
  }

  private createCrickets(ctx: AudioContext, dest: AudioNode) {
    // Very quiet night drone
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        data[i] = last * 1.2;
      }
    }
    const droneSrc = ctx.createBufferSource();
    droneSrc.buffer = buffer;
    droneSrc.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 300;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.1;
    droneSrc.connect(lp);
    lp.connect(droneGain);
    droneGain.connect(dest);
    droneSrc.start();
    this.nodes.push(droneSrc, lp, droneGain);

    // Cricket chirps - rapid oscillation bursts
    const cricketGain = ctx.createGain();
    cricketGain.gain.value = 0.08;
    cricketGain.connect(dest);
    this.nodes.push(cricketGain);

    const cricketChirp = () => {
      const now = ctx.currentTime;
      const freq = 4000 + Math.random() * 1500;
      const pulses = 3 + Math.floor(Math.random() * 5);
      const pulseLen = 0.015 + Math.random() * 0.01;
      const gap = 0.02 + Math.random() * 0.015;

      for (let p = 0; p < pulses; p++) {
        const t = now + p * (pulseLen + gap);
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.4, t + pulseLen * 0.2);
        env.gain.setValueAtTime(0.4, t + pulseLen * 0.8);
        env.gain.linearRampToValueAtTime(0, t + pulseLen);

        const pan = ctx.createStereoPanner();
        pan.pan.value = Math.random() * 2 - 1;

        osc.connect(env);
        env.connect(pan);
        pan.connect(cricketGain);
        osc.start(t);
        osc.stop(t + pulseLen + 0.01);
      }
    };

    // Multiple cricket intervals for natural layering
    const id1 = window.setInterval(() => {
      if (Math.random() < 0.5) cricketChirp();
    }, 600 + Math.random() * 800);
    const id2 = window.setInterval(() => {
      if (Math.random() < 0.35) cricketChirp();
    }, 1200 + Math.random() * 1000);
    this.intervals.push(id1, id2);
  }

  async play(atmosphere: Atmosphere, volume = 0.3): Promise<void> {
    if (this.isPlaying && this.currentAtmosphere === atmosphere) return;
    this.stop();

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume;
    this.gainNode.connect(this.audioContext.destination);

    switch (atmosphere) {
      case 'rain':
        this.createRain(this.audioContext, this.gainNode);
        break;
      case 'sunrise':
        this.createBirds(this.audioContext, this.gainNode);
        break;
      case 'midnight':
        this.createCrickets(this.audioContext, this.gainNode);
        break;
    }

    this.isPlaying = true;
    this.currentAtmosphere = atmosphere;
  }

  stop(): void {
    this.cleanup();
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isPlaying = false;
    this.currentAtmosphere = null;
  }

  toggleMute(): boolean {
    if (this.gainNode) {
      const isMuted = this.gainNode.gain.value === 0;
      this.gainNode.gain.value = isMuted ? 0.3 : 0;
      return !isMuted;
    }
    return false;
  }

  get playing() {
    return this.isPlaying;
  }
}

export const ambientAudio = new AmbientAudioManager();

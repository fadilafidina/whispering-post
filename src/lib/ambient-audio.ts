import { Atmosphere } from './drift-store';

class AmbientAudioManager {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentAtmosphere: Atmosphere | null = null;

  private createNoise(type: 'brown' | 'white' | 'pink', duration: number): AudioBuffer {
    const ctx = this.audioContext!;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
          // Brown noise - like rain
          b0 = (b0 + (0.02 * white)) / 1.02;
          data[i] = b0 * 3.5;
        } else if (type === 'pink') {
          // Pink noise - like wind
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else {
          data[i] = white * 0.3;
        }
      }
    }
    return buffer;
  }

  async play(atmosphere: Atmosphere, volume = 0.3): Promise<void> {
    if (this.isPlaying && this.currentAtmosphere === atmosphere) return;
    this.stop();

    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume;
    this.gainNode.connect(this.audioContext.destination);

    let buffer: AudioBuffer;
    switch (atmosphere) {
      case 'rain':
        buffer = this.createNoise('brown', 4);
        break;
      case 'sunrise':
        buffer = this.createNoise('pink', 4);
        break;
      case 'midnight':
        buffer = this.createNoise('white', 4);
        this.gainNode.gain.value = volume * 0.3; // quieter for midnight
        break;
    }

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.loop = true;
    this.sourceNode.connect(this.gainNode);
    this.sourceNode.start();

    this.isPlaying = true;
    this.currentAtmosphere = atmosphere;
  }

  stop(): void {
    if (this.sourceNode) {
      try { this.sourceNode.stop(); } catch {}
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
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

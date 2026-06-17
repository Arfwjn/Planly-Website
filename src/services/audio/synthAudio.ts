/**
 * =============================================================================
 * Planly — synthAudio.ts
 * 
 * Kegunaan:
 * Service Layer frontend untuk melakukan kueri / pengiriman data ke server API Laravel (atau localStorage mock).
 * 
 * Relasi & Dependency:
 * - Menggunakan httpClient/apiHelper. Objek dikatalogkan terpadu di dalam api.ts untuk dipakai oleh UI.
 * 
 * Aliran Data / State:
 * - Melakukan request HTTP GET/POST/PUT/DELETE secara asinkron ke endpoint API backend dan mengembalikan raw data.
 * =============================================================================
 */

class SynthAudioPlayer {
  private ctx: AudioContext | null = null;
  private sourceNodes: AudioNode[] = [];
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentSoundId = 'none';
  private intervals: any[] = [];
  private timeouts: any[] = [];

  constructor() {}

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.init();
    if (this.gainNode && this.ctx) {
      // Smooth volume transition to prevent click sounds
      this.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    }
  }

  public play(soundId: string) {
    this.stop();
    this.currentSoundId = soundId;
    if (soundId === 'none') return;

    this.init();
    this.isPlaying = true;

    if (soundId === 'rain') {
      this.playRain();
    } else if (soundId === 'nature') {
      this.playNature();
    } else if (soundId === 'lofi') {
      this.playLofi();
    } else if (soundId === 'ocean') {
      this.playOcean();
    } else if (soundId === 'fireplace') {
      this.playFireplace();
    } else if (soundId === 'crickets') {
      this.playCrickets();
    } else if (soundId === 'cafe') {
      this.playCafe();
    } else if (soundId === 'train') {
      this.playTrain();
    }
  }

  public stop() {
    // Clear all scheduled intervals & timeouts
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];

    // Stop and disconnect all nodes
    this.sourceNodes.forEach(node => {
      try {
        (node as any).stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    this.sourceNodes = [];
    this.isPlaying = false;
    this.currentSoundId = 'none';
  }

  private registerNode(node: AudioNode) {
    this.sourceNodes.push(node);
  }

  private createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate volume loss
    }
    return noiseBuffer;
  }

  private createWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  // 1. Nature Waterfall / Ocean Rumbling
  private playNature() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const noiseBuffer = this.createBrownNoiseBuffer(ctx);

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    source.connect(filter);
    filter.connect(this.gainNode!);
    source.start();

    this.registerNode(source);
  }

  // 2. Heavy/Soft Rain Patters
  private playRain() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Steady brown noise (rumble)
    const brownBuffer = this.createBrownNoiseBuffer(ctx);
    const brownSource = ctx.createBufferSource();
    brownSource.buffer = brownBuffer;
    brownSource.loop = true;

    const brownFilter = ctx.createBiquadFilter();
    brownFilter.type = 'lowpass';
    brownFilter.frequency.value = 350;

    brownSource.connect(brownFilter);
    brownFilter.connect(this.gainNode!);
    brownSource.start();
    this.registerNode(brownSource);

    // High frequency rain crackle (filtered white noise)
    const whiteBuffer = this.createWhiteNoiseBuffer(ctx);
    const whiteSource = ctx.createBufferSource();
    whiteSource.buffer = whiteBuffer;
    whiteSource.loop = true;

    const whiteFilter = ctx.createBiquadFilter();
    whiteFilter.type = 'bandpass';
    whiteFilter.frequency.value = 2800;
    whiteFilter.Q.value = 1.5;

    const gainMod = ctx.createGain();
    gainMod.gain.value = 0.05;

    whiteSource.connect(whiteFilter);
    whiteFilter.connect(gainMod);
    gainMod.connect(this.gainNode!);
    whiteSource.start();
    this.registerNode(whiteSource);
  }

  // 3. Lo-Fi Ambient Chord Pad
  private playLofi() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.8;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.55;

    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.gainNode!);
    this.registerNode(delay);

    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.isPlaying || this.currentSoundId !== 'lofi' || !this.ctx) return;
      const freqs = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      freqs.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        // Detune slightly for lush chorus effect
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, this.ctx.currentTime);
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0, this.ctx.currentTime);
        oscGain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 2.5); // Warm attack
        oscGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 6.0); // Release

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, this.ctx.currentTime);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.gainNode!);
        oscGain.connect(delay);

        osc.start();
        osc.stop(this.ctx.currentTime + 6.5);

        this.sourceNodes.push(osc);
        
        const timeout = setTimeout(() => {
          this.sourceNodes = this.sourceNodes.filter(n => n !== osc);
          this.timeouts = this.timeouts.filter(t => t !== timeout);
        }, 7000);
        this.timeouts.push(timeout);
      });
    };

    playChord();
    const interval = setInterval(playChord, 6500);
    this.intervals.push(interval);
  }

  // 4. Dynamic Ocean Waves
  private playOcean() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Main rumble
    const noiseBuffer = this.createBrownNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    // Modulate volume slowly using a LFO (gain modulation)
    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.15; // Base gain

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // ~8.3 seconds wave cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.12; // Swell depth

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.gainNode!);

    lfo.start();
    source.start();

    this.registerNode(lfo);
    this.registerNode(source);
  }

  // 5. Fireplace Crackle
  private playFireplace() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Low frequency fireplace roar
    const brownBuffer = this.createBrownNoiseBuffer(ctx);
    const brownSource = ctx.createBufferSource();
    brownSource.buffer = brownBuffer;
    brownSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;

    brownSource.connect(filter);
    filter.connect(this.gainNode!);
    brownSource.start();
    this.registerNode(brownSource);

    // Crackle scheduling function
    const scheduleCrackles = () => {
      if (!this.isPlaying || this.currentSoundId !== 'fireplace' || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Schedule random crackling pops over the next second
      const popCount = 5 + Math.floor(Math.random() * 8);
      for (let i = 0; i < popCount; i++) {
        if (!this.ctx) return;
        const time = now + Math.random();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500 + Math.random() * 2500, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.012, time + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.015);

        osc.connect(gain);
        gain.connect(this.gainNode!);

        osc.start(time);
        osc.stop(time + 0.02);

        this.sourceNodes.push(osc);
        
        const timeout = setTimeout(() => {
          this.sourceNodes = this.sourceNodes.filter(n => n !== osc);
          this.timeouts = this.timeouts.filter(t => t !== timeout);
        }, 1100);
        this.timeouts.push(timeout);
      }
    };

    scheduleCrackles();
    const interval = setInterval(scheduleCrackles, 1000);
    this.intervals.push(interval);
  }

  // 6. Night Crickets Chirping
  private playCrickets() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Ambient night wind (very soft lowpass brown noise)
    const noiseBuffer = this.createBrownNoiseBuffer(ctx);
    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;

    windSource.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.gainNode!);
    windSource.start();
    this.registerNode(windSource);

    // Chirp scheduler
    const scheduleCrickets = () => {
      if (!this.isPlaying || this.currentSoundId !== 'crickets' || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Random cricket chirping rate
      if (Math.random() > 0.35) {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        const ampMod = this.ctx.createOscillator();
        const ampModGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(3600 + Math.random() * 200, now);

        // Amplitude LFO to create rapid cricket chirp vibration (~40Hz)
        ampMod.frequency.value = 38 + Math.random() * 6;
        ampModGain.gain.value = 0.45;

        // Envelope
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.04, now + 0.03);
        oscGain.gain.setValueAtTime(0.04, now + 0.18);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        ampMod.connect(ampModGain);
        ampModGain.connect(oscGain.gain);
        osc.connect(oscGain);
        oscGain.connect(this.gainNode!);

        ampMod.start(now);
        osc.start(now);
        ampMod.stop(now + 0.3);
        osc.stop(now + 0.3);

        this.sourceNodes.push(osc, ampMod);

        const timeout = setTimeout(() => {
          this.sourceNodes = this.sourceNodes.filter(n => n !== osc && n !== ampMod);
          this.timeouts = this.timeouts.filter(t => t !== timeout);
        }, 500);
        this.timeouts.push(timeout);
      }
    };

    scheduleCrickets();
    const interval = setInterval(scheduleCrickets, 800);
    this.intervals.push(interval);
  }

  // 7. Coffee Shop Ambience
  private playCafe() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Soft low-frequency chatter rumble
    const noiseBuffer = this.createBrownNoiseBuffer(ctx);
    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = noiseBuffer;
    rumbleSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 220;

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.12;

    rumbleSource.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(this.gainNode!);
    rumbleSource.start();
    this.registerNode(rumbleSource);

    // Cup clinks
    const scheduleClinks = () => {
      if (!this.isPlaying || this.currentSoundId !== 'cafe' || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Occasional random cup clinking noises
      if (Math.random() > 0.4) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400 + Math.random() * 800, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.004, now + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.gainNode!);
        osc.start(now);
        osc.stop(now + 0.15);

        this.sourceNodes.push(osc);
        
        const timeout = setTimeout(() => {
          this.sourceNodes = this.sourceNodes.filter(n => n !== osc);
          this.timeouts = this.timeouts.filter(t => t !== timeout);
        }, 300);
        this.timeouts.push(timeout);
      }
    };

    scheduleClinks();
    const interval = setInterval(scheduleClinks, 1200);
    this.intervals.push(interval);
  }

  // 8. Rhythmic Train Journey
  private playTrain() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Steady background hum of engine / cabin rumble
    const noiseBuffer = this.createBrownNoiseBuffer(ctx);
    const engineSource = ctx.createBufferSource();
    engineSource.buffer = noiseBuffer;
    engineSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 75;

    const engineGain = ctx.createGain();
    engineGain.gain.value = 0.18;

    engineSource.connect(lowpass);
    lowpass.connect(engineGain);
    engineGain.connect(this.gainNode!);
    engineSource.start();
    this.registerNode(engineSource);

    // Double "click-clack" rail tracks rhythm
    const scheduleRailClickClack = () => {
      if (!this.isPlaying || this.currentSoundId !== 'train' || !this.ctx) return;
      const now = this.ctx.currentTime;

      const playTrackTap = (time: number, volume: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(85 + Math.random() * 20, time);

        oscGain.gain.setValueAtTime(0, time);
        oscGain.gain.linearRampToValueAtTime(volume, time + 0.015);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 160;

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.gainNode!);

        osc.start(time);
        osc.stop(time + 0.1);

        this.sourceNodes.push(osc);

        const timeout = setTimeout(() => {
          this.sourceNodes = this.sourceNodes.filter(n => n !== osc);
          this.timeouts = this.timeouts.filter(t => t !== timeout);
        }, 200);
        this.timeouts.push(timeout);
      };

      // Double rhythm: tick-tock click-clack
      playTrackTap(now, 0.08);
      playTrackTap(now + 0.14, 0.05);
    };

    scheduleRailClickClack();
    const interval = setInterval(scheduleRailClickClack, 1700);
    this.intervals.push(interval);
  }
}

export const synthAudio = new SynthAudioPlayer();

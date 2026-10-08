/**
 * Web Audio API Sound Synthesizer for Neon Tetris
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('tetris_muted') === 'true';
    this.initOnInteraction = this.initOnInteraction.bind(this);
    
    // Attach listener to initialize AudioContext on first click/key
    window.addEventListener('click', this.initOnInteraction, { once: true });
    window.addEventListener('keydown', this.initOnInteraction, { once: true });
  }

  initOnInteraction() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('tetris_muted', this.isMuted);
    return this.isMuted;
  }

  // Helper for generating tones
  playTone(freq, type = 'sine', duration = 0.1, startGain = 0.15, endGain = 0.001) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(startGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endGain, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  // 1. Move Sound
  playMove() {
    this.playTone(320, 'sine', 0.04, 0.08);
  }

  // 2. Rotate Sound
  playRotate() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // 3. Drop Sound
  playDrop() {
    this.playTone(180, 'triangle', 0.06, 0.15);
  }

  // 4. Hard Drop Sound (Punchy bass impact)
  playHardDrop() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // 5. Line Clear Sound (Higher pitch arpeggios depending on lines cleared)
  playLineClear(linesCleared = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = {
      1: [523.25, 659.25],                  // C5, E5
      2: [523.25, 659.25, 783.99],           // C5, E5, G5
      3: [523.25, 659.25, 783.99, 1046.50],  // C5, E5, G5, C6
      4: [523.25, 659.25, 783.99, 1046.50, 1318.51] // C5, E5, G5, C6, E6 (TETRIS!)
    };

    const sequence = notes[linesCleared] || notes[1];
    sequence.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', linesCleared === 4 ? 0.2 : 0.12, 0.15);
      }, idx * 60);
    });
  }

  // 6. Level Up Sound
  playLevelUp() {
    if (this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.15, 0.15);
      }, idx * 80);
    });
  }

  // 7. Game Over Sound
  playGameOver() {
    if (this.isMuted) return;
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.2, 0.15);
      }, idx * 120);
    });
  }
}

window.soundEngine = new SoundEngine();

/**
 * SoundManager: tiny UI sounds synthesised with the Web Audio API.
 * No audio files are needed. Sound is OFF by default; the choice persists in localStorage.
 *
 * Usage in markup:
 *   data-sound="hover"  → soft tick when the pointer enters
 *   data-sound="click"  → pop on click (also plays a hover tick)
 * Links and buttons without data-sound still get the click sound.
 *
 * To use real samples instead, put files in /public/sounds and swap `play()`
 * for an HTMLAudioElement / AudioBuffer lookup.
 */

export type SoundName = 'hover' | 'click' | 'open' | 'close' | 'toggle';

const STORAGE_KEY = 'sound';

class SoundManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastHover = 0;
  enabled = false;

  constructor() {
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) === 'on';
    } catch {
      /* storage unavailable */
    }
  }

  private ensureContext() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setEnabled(value: boolean) {
    this.enabled = value;
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
    } catch {
      /* ignore */
    }
    if (value) this.play('toggle', true);
    document.dispatchEvent(new CustomEvent('sound:change', { detail: value }));
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  /** Pitched blip with an exponential decay envelope */
  private tone(freq: number, freqEnd: number, duration: number, gain: number, type: OscillatorType = 'sine', delay = 0) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(amp).connect(this.master!);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  /** Filtered noise sweep, a soft "whoosh" */
  private whoosh(from: number, to: number, duration: number, gain: number) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + duration);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + duration * 0.3);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(amp).connect(this.master!);
    src.start(t);
  }

  play(name: SoundName, force = false) {
    if (!this.enabled && !force) return;
    if (!this.ensureContext()) return;

    switch (name) {
      case 'hover': {
        const now = performance.now();
        if (now - this.lastHover < 60) return; // throttle
        this.lastHover = now;
        this.tone(2400, 1800, 0.035, 0.035, 'sine');
        break;
      }
      case 'click':
        this.tone(520, 220, 0.09, 0.14, 'triangle');
        this.tone(1400, 900, 0.04, 0.04, 'sine');
        break;
      case 'open':
        this.whoosh(400, 2400, 0.35, 0.12);
        this.tone(660, 990, 0.12, 0.04, 'sine', 0.05);
        break;
      case 'close':
        this.whoosh(2200, 400, 0.3, 0.1);
        break;
      case 'toggle':
        this.tone(880, 880, 0.07, 0.08, 'sine');
        this.tone(1320, 1320, 0.09, 0.07, 'sine', 0.07);
        break;
    }
  }
}

export const sound = new SoundManager();

let wired = false;

/** Global delegated listeners + the speaker toggle. Call once. */
export function initSound() {
  if (wired) return;
  wired = true;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.addEventListener('pointerover', (e) => {
    if (!sound.enabled || e.pointerType !== 'mouse' || !finePointer.matches) return;
    const target = (e.target as Element).closest('[data-sound]');
    if (!target) return;
    // ignore moves between children of the same element
    const from = e.relatedTarget as Node | null;
    if (from && target.contains(from)) return;
    sound.play('hover');
  });

  document.addEventListener('click', (e) => {
    if (!sound.enabled) return;
    const el = (e.target as Element).closest<HTMLElement>('[data-sound], a, button');
    if (!el || el.hasAttribute('data-sound-toggle') || el.hasAttribute('data-menu-open') || el.hasAttribute('data-menu-close')) return;
    sound.play('click');
  });

  const toggle = document.querySelector<HTMLButtonElement>('[data-sound-toggle]');
  const label = toggle?.querySelector('[data-sound-label]');
  const render = () => {
    if (!toggle) return;
    toggle.dataset.soundState = sound.enabled ? 'on' : 'off';
    toggle.setAttribute('aria-pressed', String(sound.enabled));
    if (label) label.textContent = sound.enabled ? 'Sound on' : 'Sound off';
  };
  toggle?.addEventListener('click', () => sound.toggle());
  document.addEventListener('sound:change', render);
  render();
}

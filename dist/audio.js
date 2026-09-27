/** Small procedural metal sounds: no streaming, network requests, or media files. */
export class CoinAudio {
  constructor() { this.context = null; this.noise = null; this.spinNode = null; this.spinGain = null; this.enabled = true; }
  async unlock() {
    if (!this.enabled) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        const buffer = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        this.noise = buffer;
      }
      if (this.context.state === 'suspended') await this.context.resume();
    } catch { /* Sound never blocks a toss. */ }
  }
  tone(frequency, duration, volume, type = 'sine', at = 0) {
    const ctx = this.context;
    if (!this.enabled || !ctx || ctx.state !== 'running') return;
    const start = ctx.currentTime + at;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, frequency * .82), start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .005);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start); oscillator.stop(start + duration + .015);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  launch(duration) {
    if (!this.enabled || !this.context || this.context.state !== 'running') return;
    this.tone(620, .105, .026, 'triangle');
    const ctx = this.context;
    const src = ctx.createBufferSource(); src.buffer = this.noise; src.loop = true;
    const filter = ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=980;filter.Q.value=.7;
    const gain=ctx.createGain();const now=ctx.currentTime;
    gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(.013,now+.13);
    gain.gain.setTargetAtTime(.007,now+.38,.35);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration/1000);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(now); src.stop(now+duration/1000+.04);
    src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect();if(this.spinNode===src){this.spinNode=null;this.spinGain=null;}};
    this.spinNode=src;this.spinGain=gain;
  }
  stopSpin() {
    if (!this.spinGain || !this.context) return;
    const now=this.context.currentTime;
    this.spinGain.gain.cancelScheduledValues(now);
    this.spinGain.gain.setValueAtTime(Math.max(.0001,this.spinGain.gain.value),now);
    this.spinGain.gain.exponentialRampToValueAtTime(.0001,now+.03);
  }
  impact() {
    this.stopSpin();
    this.tone(980,.28,.105,'sine');
    this.tone(1490,.19,.051,'sine',.002);
    this.tone(2250,.13,.021,'triangle',.001);
  }
  tick() {this.tone(1140,.12,.034,'sine');this.tone(1690,.075,.012,'triangle',.003);}
  confirm() {this.tone(690,.11,.016,'sine');this.tone(1040,.14,.009,'sine',.038);}
  mute() {this.stopSpin();this.enabled=false;}
}

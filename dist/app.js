import { fairSide } from './random.js';
import { loadState, saveState, addToss, clearTosses } from './state.js';
import { attachGesture } from './gesture.js';
import { CoinAudio } from './audio.js';
import { pose, renderPose, flightMs, totalMs } from './motion.js';

const $ = id => document.getElementById(id);
const state = loadState();
const audio = new CoinAudio();
audio.enabled = state.sound;
const ui = {
  coin: $('coin'), lift: $('coin-lift'), shadow: $('coin-shadow'), coinButton: $('coin-button'),
  toss: $('toss-button'), heads: $('heads-choice'), tails: $('tails-choice'),
  sound: $('sound-toggle'), soundLabel: $('sound-label'), result: $('result'),
  resultSide: $('result-side'), resultChoice: $('result-choice'), placeholder: $('result-placeholder'),
  history: $('history-marks'), clear: $('clear-history'), headsCount: $('heads-count'),
  tailsCount: $('tails-count'), totalCount: $('total-count'), announce: $('announcement'), flash: $('surface-flash')
};
let busy = false;
let currentSide = state.recent[0] || 'heads';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Build a thin, individually lit cylindrical wall between the two engraved faces.
const edge = $('coin-edge');
const fragment = document.createDocumentFragment();
for (let i = 0; i < 56; i++) {
  const reed = document.createElement('span');
  reed.className = 'reed';
  reed.style.transform = `rotateZ(${i * 360 / 56}deg) translateY(calc(var(--coin-size) * -.486)) rotateX(90deg)`;
  fragment.append(reed);
}
edge.append(fragment);

ui.heads.value = state.heads;
ui.tails.value = state.tails;
function paintSound() {
  ui.sound.setAttribute('aria-pressed', String(state.sound));
  ui.sound.setAttribute('aria-label', state.sound ? 'Mute sound' : 'Turn sound on');
  ui.sound.title = state.sound ? 'Sound on' : 'Sound off';
  ui.soundLabel.textContent = state.sound ? 'on' : 'off';
}
function paintHistory() {
  ui.headsCount.textContent = state.counts.heads;
  ui.tailsCount.textContent = state.counts.tails;
  ui.totalCount.textContent = state.counts.heads + state.counts.tails;
  ui.clear.hidden = state.counts.heads + state.counts.tails === 0;
  ui.history.replaceChildren();
  if (!state.recent.length) {
    const empty = document.createElement('span');
    empty.className = 'history-empty';
    empty.textContent = 'Your tosses will appear here';
    ui.history.append(empty);
    ui.history.setAttribute('aria-label', 'No tosses yet');
    return;
  }
  const list = document.createDocumentFragment();
  for (const side of state.recent.slice(0, 10)) {
    const mark = document.createElement('span');
    mark.className = 'history-mark';
    mark.textContent = side === 'heads' ? 'H' : 'T';
    mark.setAttribute('aria-hidden', 'true');
    list.append(mark);
  }
  ui.history.append(list);
  ui.history.setAttribute('aria-label', 'Recent tosses, newest first: ' + state.recent.slice(0,10).join(', '));
}
function setBusy(value) {
  busy = value;
  ui.toss.disabled = value;
  ui.coinButton.disabled = value;
  ui.heads.disabled = value;
  ui.tails.disabled = value;
  ui.coinButton.setAttribute('aria-label', value ? 'Coin is tossing' : 'Tap or flick up to toss coin');
}
function vibrate(ms) { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch {} } }
function renderResult(side, choice) {
  ui.resultSide.textContent = side.toUpperCase();
  ui.resultChoice.textContent = choice;
  ui.resultChoice.title = choice;
  ui.placeholder.hidden = true;
  ui.result.setAttribute('aria-hidden', 'false');
  ui.result.classList.add('visible');
  ui.announce.textContent = `${side.toUpperCase()}. ${choice}.`;
  audio.confirm(); vibrate(8);
  addToss(state, side);
  paintHistory();
  setBusy(false);
  document.dispatchEvent(new CustomEvent('coin:toss-complete', { detail: {side, choice} }));
}
async function toss(strength = 0) {
  if (busy) return;
  setBusy(true);
  ui.coin.classList.add('moving');
  ui.result.classList.remove('visible');
  ui.result.setAttribute('aria-hidden', 'true');
  ui.placeholder.hidden = true;
  ui.announce.textContent = '';
  // This cryptographic choice is independent of gesture strength and all motion calculations.
  const side = fairSide();
  const choice = (side === 'heads' ? ui.heads.value : ui.tails.value).trim() || (side === 'heads' ? 'Choice A' : 'Choice B');
  const from = currentSide;
  const reduced = reduceMotion.matches;
  const duration = reduced ? 360 : totalMs(strength);
  const impactAt = reduced ? 360 : 92 + flightMs(strength);
  try { await audio.unlock(); } catch {}
  audio.launch(reduced ? 300 : impactAt);
  vibrate(8);
  let began = 0, hit = false, bounced = false;
  function frame(now) {
    if (!began) began = now;
    const elapsed = Math.min(duration, now - began);
    const sample = pose(elapsed, strength, from, side, reduced);
    renderPose(ui, sample);
    if (!hit && elapsed >= impactAt) {
      hit = true;
      audio.impact(); vibrate(21);
      ui.flash.classList.remove('hit');
      void ui.flash.offsetWidth;
      ui.flash.classList.add('hit');
    }
    if (!bounced && !reduced && elapsed >= impactAt + 160) { bounced = true; audio.tick(); }
    if (elapsed < duration) { requestAnimationFrame(frame); return; }
    currentSide = side;
    ui.coin.classList.remove('moving');
    ui.coin.style.setProperty('--rest-angle',side === 'tails' ? '180deg' : '0deg');
    setTimeout(() => renderResult(side, choice), reduced ? 140 : 190);
  }
  requestAnimationFrame(frame);
}

ui.toss.addEventListener('click', () => toss(0));
attachGesture(ui.coinButton, toss);
ui.sound.addEventListener('click', () => {
  state.sound = !state.sound;
  if (!state.sound) audio.mute(); else {audio.enabled=true;audio.unlock();}
  saveState(state); paintSound();
});
for (const [side, input] of [['heads',ui.heads],['tails',ui.tails]]) {
  input.addEventListener('input', () => {state[side] = input.value;saveState(state);});
  input.addEventListener('keydown', e => {if(e.key === 'Enter'){ e.preventDefault();input.blur();toss(0); }});
}
ui.clear.addEventListener('click', () => { clearTosses(state);paintHistory(); });
paintSound();paintHistory();
renderPose(ui, pose(99999,0,'heads',currentSide));
ui.coin.style.setProperty('--rest-angle', currentSide === 'tails' ? '180deg' : '0deg');

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

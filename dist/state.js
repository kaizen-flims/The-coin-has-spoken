const KEY = 'coin-has-spoken:v1';
const MAX_RECENT = 12;
const empty = () => ({ heads: '', tails: '', sound: true, counts: { heads: 0, tails: 0 }, recent: [] });
export function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (!parsed || typeof parsed !== 'object') return empty();
    const counts = parsed.counts || {};
    return {
      heads: typeof parsed.heads === 'string' ? parsed.heads.slice(0, 70) : '',
      tails: typeof parsed.tails === 'string' ? parsed.tails.slice(0, 70) : '',
      sound: parsed.sound !== false,
      counts: {
        heads: Number.isSafeInteger(counts.heads) && counts.heads >= 0 ? counts.heads : 0,
        tails: Number.isSafeInteger(counts.tails) && counts.tails >= 0 ? counts.tails : 0
      },
      recent: Array.isArray(parsed.recent) ? parsed.recent.filter(x => x === 'heads' || x === 'tails').slice(0, MAX_RECENT) : []
    };
  } catch { return empty(); }
}
export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* Private storage may be unavailable. */ }
}
export function addToss(state, side) {
  state.counts[side]++;
  state.recent.unshift(side);
  state.recent.length = Math.min(state.recent.length, MAX_RECENT);
  saveState(state);
}
export function clearTosses(state) {
  state.counts = { heads: 0, tails: 0 };
  state.recent = [];
  saveState(state);
}

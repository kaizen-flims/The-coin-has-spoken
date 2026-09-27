/** The unbiased outcome is sampled once, before any animation parameters are calculated. */
export function fairSide() {
  if (globalThis.crypto?.getRandomValues) {
    const word = new Uint32Array(1);
    crypto.getRandomValues(word);
    return (word[0] & 1) === 0 ? 'heads' : 'tails';
  }
  return Math.random() < .5 ? 'heads' : 'tails';
}

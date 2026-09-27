const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const ease = t => 1 - Math.pow(1 - t, 1.55);
export const flightMs = strength => 1230 + strength * 190;
export const totalMs = strength => 92 + flightMs(strength) + 340;
export function pose(elapsed, strength, fromSide, toSide, reduced = false) {
  const origin = fromSide === 'tails' ? 180 : 0;
  const target = toSide === 'tails' ? 180 : 0;
  if (reduced) {
    const p = clamp(elapsed / 360);
    const turn = target + 360 * (fromSide === toSide ? 1 : 2);
    return { angle: origin + (turn - origin) * ease(p), tilt: Math.sin(p * Math.PI) * 8, roll: 0, x: 0, y: -16 * Math.sin(p * Math.PI), scale: 1, shadowScale: 1 - .2 * Math.sin(p * Math.PI), shadowOpacity: .84, shine: (p * 80 - 40) + '%', phase: p === 1 ? 'done' : 'flight' };
  }
  const launch = 92;
  const flight = flightMs(strength);
  const impactAt = launch + flight;
  const rotations = 4 + Math.round(strength * 2);
  const desired = rotations * 360 + target + (target <= origin ? 360 : 0);
  const height = 76 + 20 * strength;
  if (elapsed < launch) {
    const p = clamp(elapsed / launch);
    return { angle: origin - p * 12, tilt: -p * 5, roll: 0, x: 0, y: 6 * p, scale: 1 - .035 * p, shadowScale: 1 + .1 * p, shadowOpacity: .9, shine: '2%', phase: 'launch' };
  }
  if (elapsed < impactAt) {
    const p = clamp((elapsed - launch) / flight);
    const arc = 4 * p * (1-p);
    const lateral = Math.sin(p * Math.PI) * (9 + 7 * strength) * (strength > .4 ? 1 : -1);
    const spin = ease(p);
    return { angle: origin + (desired - origin) * spin, tilt: Math.sin(p * Math.PI * 5) * (11 * (1-p)+2), roll: Math.sin(p * Math.PI * 3) * 8 * (1-p), x: lateral, y: -height * arc, scale: 1 - .15 * arc, shadowScale: 1 - .43 * arc, shadowOpacity: .84 - .64 * arc, shine: (Math.sin(p * Math.PI * 11)*42) + '%', phase: 'flight' };
  }
  const b = elapsed - impactAt;
  if (b < 340) {
    // Damped mechanical rebounds with a barely perceptible last rock.
    const lift = b < 160 ? 11 * Math.sin(Math.PI * b / 160) * (1 - b / 220) : b < 278 ? 3.2 * Math.sin(Math.PI * (b-160) / 118) : 0;
    const decay = Math.exp(-b/95);
    return { angle: desired + Math.sin(b / 33) * 9 * decay, tilt: Math.sin(b/40) * 7 * decay, roll: Math.sin(b/49) * 3 * decay, x: 0, y: -lift, scale: 1 + (b < 36 ? -.027 * (1-b/36) : 0), shadowScale: 1 - lift*.018, shadowOpacity: .84, shine:'0%', phase:b < 160 ? 'bounce' : 'settle' };
  }
  return { angle: desired, tilt: 0, roll: 0, x: 0, y: 0, scale: 1, shadowScale: 1, shadowOpacity:.84, shine:'0%', phase:'done' };
}
export function renderPose(elements, state) {
  const { lift, coin, shadow } = elements;
  lift.style.transform = `translate3d(${state.x.toFixed(2)}px,${(state.y + 12).toFixed(2)}px,0) scale(${state.scale.toFixed(4)})`;
  coin.style.transform = `rotateX(${state.angle.toFixed(3)}deg) rotateY(${state.tilt.toFixed(3)}deg) rotateZ(${state.roll.toFixed(3)}deg)`;
  coin.style.setProperty('--shine',state.shine);
  shadow.style.transform = `translateX(-50%) scale(${state.shadowScale.toFixed(3)})`;
  shadow.style.opacity = state.shadowOpacity.toFixed(3);
}

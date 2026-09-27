import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { fairSide } from '../dist/random.js';
import { pose, totalMs, flightMs } from '../dist/motion.js';

const storage = new Map();
globalThis.localStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
const { loadState, saveState, addToss, clearTosses } = await import('../dist/state.js');

const state=loadState();
assert.equal(state.sound,true);
state.heads='Watch a film';state.tails='Edit a film';state.sound=false;saveState(state);
assert.equal(loadState().tails,'Edit a film');assert.equal(loadState().sound,false);

let from='heads', heads=0, tails=0;
const start=performance.now();
for(let i=0;i<105;i++){
  const outcome=fairSide();const strength=(i%9)/8;
  assert.ok(outcome==='heads'||outcome==='tails');
  const duration=totalMs(strength);
  assert.ok(duration>=1600&&duration<=2200);
  const pre=pose(91,strength,from,outcome);
  const apex=pose(92+flightMs(strength)/2,strength,from,outcome);
  const impact=pose(92+flightMs(strength),strength,from,outcome);
  const landed=pose(duration,strength,from,outcome);
  assert.ok(pre.y>0&&apex.y<-60&&Math.abs(impact.y)<.001);
  assert.ok(apex.shadowScale<impact.shadowScale&&apex.shadowOpacity<impact.shadowOpacity);
  assert.equal(((landed.angle%360)+360)%360,outcome==='heads'?0:180);
  assert.equal(landed.phase,'done');
  const reduced=pose(360,strength,from,outcome,true);
  assert.equal(((reduced.angle%360)+360)%360,outcome==='heads'?0:180);
  addToss(state,outcome);if(outcome==='heads')heads++;else tails++;
  from=outcome;
}
assert.equal(state.counts.heads,heads);assert.equal(state.counts.tails,tails);
assert.equal(state.recent.length,12);assert.equal(loadState().counts.heads+loadState().counts.tails,105);
clearTosses(state);assert.equal(loadState().recent.length,0);
assert.equal(loadState().counts.heads+loadState().counts.tails,0);

// Serve-all / installability contract: every precached item exists locally.
const worker=readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8');
const paths=[...worker.matchAll(/'\.\/(?:[^']+)'/g)].map(x=>x[0].slice(3,-1));
for(const item of paths)assert.ok(existsSync(new URL('../dist/'+(item||'index.html'),import.meta.url)),`missing offline asset: ${item}`);
const manifest=JSON.parse(readFileSync(new URL('../dist/manifest.webmanifest',import.meta.url)));
assert.equal(manifest.display,'standalone');
for(const icon of manifest.icons)assert.ok(existsSync(new URL('../dist/'+icon.src,import.meta.url)));
console.log(`PASS: 105 complete trajectories and outcomes, reduced motion, persisted counts and preferences, cache assets, PWA manifest (${Math.round(performance.now()-start)}ms)`);

import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

class Element {
  constructor(id='') {
    this.id=id;this.value='';this.disabled=false;this.hidden=false;this.textContent='';this.title='';
    this.listeners=new Map();this.children=[];this.attributes=new Map();this.props=new Map();
    this.style={transform:'',opacity:'',setProperty:(name,value)=>this.props.set(name,value)};
    this.classes=new Set();this.classList={add:name=>this.classes.add(name),remove:name=>this.classes.delete(name),contains:name=>this.classes.has(name)};
  }
  addEventListener(type,callback){const list=this.listeners.get(type)||[];list.push(callback);this.listeners.set(type,list)}
  dispatch(type,event={}){for(const cb of this.listeners.get(type)||[])cb(event)}
  setAttribute(name,value){this.attributes.set(name,value)}
  getAttribute(name){return this.attributes.get(name)}
  append(child){this.children.push(child)}
  replaceChildren(...children){this.children=children}
  setPointerCapture(){}
  blur(){}
  get offsetWidth(){return 25}
}
const elements=new Map();
const ids=['coin','coin-lift','coin-shadow','coin-button','toss-button','heads-choice','tails-choice','sound-toggle','sound-label','result','result-side','result-choice','result-placeholder','history-marks','clear-history','heads-count','tails-count','total-count','announcement','surface-flash','coin-edge'];
for(const id of ids)elements.set(id,new Element(id));
const doc = new Element('document');
doc.getElementById=id=>elements.get(id);
doc.createElement=()=>new Element();
doc.createDocumentFragment=()=>new Element('fragment');
globalThis.document=doc;
globalThis.window={};
Object.defineProperty(globalThis,'navigator',{value:{vibrate:()=>true},configurable:true});
globalThis.matchMedia=()=>({matches:globalThis.reducedMotion||false});
const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
let time=0;
globalThis.requestAnimationFrame=fn=>setImmediate(()=>fn(time+=16.7));
globalThis.setTimeout=fn=>setImmediate(fn);
await import('../dist/app.js');
const get=id=>elements.get(id);
get('heads-choice').value='Watch a film';get('heads-choice').dispatch('input');
get('tails-choice').value='Edit a film';get('tails-choice').dispatch('input');
get('sound-toggle').dispatch('click');assert.equal(get('sound-toggle').getAttribute('aria-pressed'),'false');

async function completed(action){
  const result=new Promise(resolve=>{const listener=ev=>{doc.listeners.set('coin:toss-complete',(doc.listeners.get('coin:toss-complete')||[]).filter(x=>x!==listener));resolve(ev.detail)};doc.addEventListener('coin:toss-complete',listener)});
  action();return result;
}
// Document events are emitted by the app after the complete visual sequence.
doc.dispatchEvent=function(event){this.dispatch(event.type,event)};
const first=await completed(()=>{
  get('toss-button').dispatch('click');
  for(let n=0;n<5;n++)get('toss-button').dispatch('click');
});
assert.equal(Number(get('total-count').textContent),1,'rapid clicks were ignored');
assert.equal(get('result-choice').textContent, first.side==='heads'?'Watch a film':'Edit a film');
assert.equal(get('coin').props.get('--rest-angle'),first.side==='heads'?'0deg':'180deg');

const swipe=await completed(()=>{
  const button=get('coin-button');
  button.dispatch('pointerdown',{pointerId:5,pointerType:'touch',clientX:100,clientY:300});
  button.dispatch('pointerup',{pointerId:5,pointerType:'touch',clientX:102,clientY:90});
});
assert.ok(['heads','tails'].includes(swipe.side));
assert.equal(Number(get('total-count').textContent),2);

globalThis.reducedMotion=true;
for(let i=0;i<100;i++){
  await completed(()=>get('toss-button').dispatch('click'));
  assert.equal(get('coin').props.get('--rest-angle'),get('result-side').textContent==='HEADS'?'0deg':'180deg');
}
assert.equal(Number(get('total-count').textContent),102);
assert.equal(get('history-marks').children.length,1); // one fragment with the recent marks
assert.equal(get('history-marks').children[0].children.length,10);
const saved=JSON.parse(storage.get('coin-has-spoken:v1'));
assert.equal(saved.counts.heads+saved.counts.tails,102);
get('clear-history').dispatch('click');
assert.equal(Number(get('total-count').textContent),0);
console.log('PASS: 102 app interactions, rapid-tap lock, flick, side alignment, reveal, sound preference, clear, reduced motion');

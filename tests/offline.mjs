import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const base='https://kaizen-flims.github.io/The-coin-has-spoken/';
const origin=new URL(base).origin;
const prefix=new URL(base).pathname;
const listeners=new Map();
const db=new Map();
const cache={
  async addAll(items){for(const path of items){const url=new URL(path,base);const filename=url.pathname===prefix?'index.html':url.pathname.slice(prefix.length);db.set(url.href,new Response(readFileSync(new URL('../dist/'+filename,import.meta.url)),{status:200}));}},
  async put(req,res){db.set(new URL(req.url,base).href,res)},
};
const caches={async open(){return cache},async match(req){return db.get(new URL(typeof req==='string'?req:req.url,base).href)},async keys(){return ['coin-spoken-v1']},async delete(){return true}};
const self={location:{origin},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(event,handler)=>listeners.set(event,handler)};
const sandbox={self,caches,Response,URL,fetch:async()=>{throw Error('network unavailable')},Promise};
vm.runInNewContext(readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8'),sandbox);
let wait;
listeners.get('install')({waitUntil:promise=>wait=promise});await wait;
assert.ok(db.size>=14);
listeners.get('activate')({waitUntil:promise=>wait=promise});await wait;
async function offline(url,mode='same-origin') {
  let response;
  listeners.get('fetch')({request:{url:new URL(url,base).href,method:'GET',mode},respondWith:promise=>response=promise});
  return response;
}
assert.match(await (await offline('./','navigate')).text(),/TOSS THE COIN/);
assert.match(await (await offline('./assets/heads.svg')).text(),/HEADS/);
assert.match(await (await offline('./app.js')).text(),/fairSide/);
assert.match(await (await offline('./a/deep/path','navigate')).text(),/TOSS THE COIN/);
console.log('PASS: installation precaches assets, airplane-mode navigation and assets load from cache');

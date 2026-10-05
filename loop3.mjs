import fs from 'node:fs'
const ROOT='/workspace/variant-barrel', BASE='http://localhost:3103'
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
const leaf=`${ROOT}/src/lib/data.ts`, barrel=`${ROOT}/src/lib/index.ts`, dash=`${ROOT}/src/app/(main)/dash/page.tsx`, item=`${ROOT}/src/app/(main)/items/[id]/page.tsx`
const baseLeaf=`import 'server-only'\n\nexport type Item = { id: string; title: string }\n\nexport async function getItems(): Promise<Item[]> { return [{ id: '1', title: 'One' }] }\n\nexport async function getItem(id: string): Promise<Item> { return { id, title: \`Item \${id}\` } }\n`
const writeLeaf=(n,extra=true)=>{let s=baseLeaf; if(extra&&n) s+=`\nexport function newFn${n}(): string { return 'NEW${n}' }\n`; fs.writeFileSync(leaf,s)}
const writeBarrelNamed=(n,incl=true)=>fs.writeFileSync(barrel,`export type { Item } from './data'\nexport { getItems, getItem${incl&&n?`, newFn${n}`:''} } from './data'\nexport * from './db'\nexport * from './users'\nexport * from './generated'\n`)
const writeBarrelStar=()=>fs.writeFileSync(barrel,`export * from './data'\nexport * from './db'\nexport * from './users'\nexport * from './generated'\n`)
const writeDash=n=>fs.writeFileSync(dash,`import { getItems, compute1${n?`, newFn${n}`:''} } from '@/lib'\n\nexport default async function Dash() {\n  const items = await getItems()\n  return <main>dash:{items.length}:{compute1(2)}:${n?`{newFn${n}()}`:''}</main>\n}\n`)
const writeItem=n=>fs.writeFileSync(item,`import { getItem, compute2${n?`, newFn${n}`:''} } from '@/lib'\n\nexport default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params\n  const it = await getItem(id)\n  return <main>item:{it.title}:{compute2(3)}:${n?`{newFn${n}()}`:''}</main>\n}\n`)
const BAD=['is not a function','not found in module',"doesn't exist in target module"]
async function get(){try{const r=await fetch(BASE+'/dash');const t=await r.text();return{s:r.status,bad:BAD.filter(b=>t.includes(b)),t}}catch(e){return{s:0,bad:['fetch:'+e.message],t:''}}}
async function check(n,label,waits){const out=[];let bad=false,stale=false
 for(const w of waits){await sleep(w);const r=await get();const hasNew=r.t.includes(`NEW${n}`);if(r.bad.length)bad=true;if(r.s===200&&!hasNew)stale=true
  out.push(`${w}ms->${r.s}${r.bad.length?'BAD['+r.bad.join('|')+']':''}${r.s===200?(hasNew?' hasNEW':' STALE-no-NEW'):''}`)}
 console.log(`${label}: ${out.join(' ; ')}`);return{bad,stale}}
writeLeaf(0);writeBarrelStar();writeDash(0);writeItem(0);await sleep(2500);console.log('base',(await get()).s)
let persistent=0
for(let i=200;i<232;i++){
 const mode=i%6
 const label=`iter${i} m${mode}`
 if(mode===0){ // star barrel, zero delay, concurrent load during edits
   writeBarrelStar();const p=Promise.all([get(),get(),get()]);writeLeaf(i);writeDash(i);writeItem(i);await p
 } else if(mode===1){ // named barrel forgotten (never add to barrel) then added
   writeLeaf(i);writeBarrelNamed(i,false);writeDash(i);writeItem(i);await sleep(1500);await get();writeBarrelNamed(i,true)
 } else if(mode===2){ // add then immediately remove then re-add leaf export
   writeBarrelStar();writeLeaf(i);writeDash(i);writeItem(i);await sleep(400);writeLeaf(i,false);await sleep(400);writeLeaf(i)
 } else if(mode===3){ // edit leaf while request in flight
   writeBarrelStar();writeDash(i);writeItem(i);const p=get();await sleep(50);writeLeaf(i);await p
 } else if(mode===4){ // named barrel, barrel first then leaf
   writeBarrelNamed(i,true);await sleep(700);await get();writeLeaf(i);await sleep(300);writeDash(i);writeItem(i)
 } else { // rapid-fire many writes
   writeBarrelStar();for(let k=0;k<5;k++){writeLeaf(i);writeDash(i);writeItem(i);await sleep(80)}
 }
 let {bad,stale}=await check(i,label,[600,1500,3000])
 if(bad||stale){
   const r2=await check(i,label+' wait',[6000,6000])
   if(r2.bad||r2.stale){
     fs.appendFileSync(leaf,`\n// touch ${Date.now()}\n`);fs.appendFileSync(barrel,`\n// touch ${Date.now()}\n`)
     const r3=await check(i,label+' after-touch',[4000,6000,8000])
     if(r3.bad||r3.stale){persistent++;console.log(`${label} PERSISTENT`)}else console.log(`${label} recovered-after-touch`)
   } else console.log(`${label} recovered-after-wait`)
 }
}
console.log('DONE3 persistent='+persistent)

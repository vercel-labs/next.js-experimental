const fs=require('fs');
const p=JSON.parse(fs.readFileSync(process.argv[2]));
const nodes=new Map(); p.nodes.forEach(n=>nodes.set(n.id,n));
const self=new Map();
// compute self time
const total=p.timeDeltas.reduce((a,b)=>a+b,0);
for(let i=0;i<p.samples.length;i++){const id=p.samples[i];const d=p.timeDeltas[i]||0;self.set(id,(self.get(id)||0)+d);}
// parent map
const parent=new Map();
p.nodes.forEach(n=>(n.children||[]).forEach(c=>parent.set(c,n.id)));
const name=n=>`${n.callFrame.functionName||'(anon)'} @ ${n.callFrame.url.replace(/.*node_modules\//,'')}:${n.callFrame.lineNumber}`;
// aggregate self by function name
const agg=new Map();
for(const [id,t] of self){const n=nodes.get(id); if(!n) continue; const k=name(n); agg.set(k,(agg.get(k)||0)+t);}
console.log('TOTAL profile us:', total, 'samples', p.samples.length);
console.log('--- top self time ---');
[...agg].sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,v])=>console.log((v/1000).toFixed(1)+'ms', k));
// inclusive time for matching functions
const incl=(match)=>{
  let sum=0;
  for(const [id,t] of self){let cur=id,hit=false,guard=0;
    while(cur&&guard++<200){const n=nodes.get(cur); if(n&&match(name(n))){hit=true;break;} cur=parent.get(cur);}
    if(hit) sum+=t;}
  return sum;
};
for(const pat of process.argv.slice(3)){
  console.log('INCLUSIVE', pat, (incl(s=>s.toLowerCase().includes(pat.toLowerCase()))/1000).toFixed(1)+'ms');
}

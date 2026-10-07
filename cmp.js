const fs=require('fs');
function stats(f){const p=JSON.parse(fs.readFileSync(f));const nodes=new Map();p.nodes.forEach(n=>nodes.set(n.id,n));
const parent=new Map();p.nodes.forEach(n=>(n.children||[]).forEach(c=>parent.set(c,n.id)));
const self=new Map();for(let i=0;i<p.samples.length;i++)self.set(p.samples[i],(self.get(p.samples[i])||0)+(p.timeDeltas[i]||0));
let busy=0,frame=0;
for(const [id,t] of self){const n=nodes.get(id);const fn=n.callFrame.functionName;
 if(fn!=='(idle)'&&fn!=='(program)')busy+=t;
 let cur=id,g=0;while(cur&&g++<300){const m=nodes.get(cur);if(m.callFrame.functionName==='DetermineComponentFrameRoot'){frame+=t;break;}cur=parent.get(cur);}}
return {busyMs:busy/1000, frameMs:frame/1000};}
const c=stats(process.argv[2]), t=stats(process.argv[3]);
const N=101;
console.log('control  busy/req', (c.busyMs/N).toFixed(1)+'ms', ' componentFrame/req', (c.frameMs/N).toFixed(1)+'ms');
console.log('throwing busy/req', (t.busyMs/N).toFixed(1)+'ms', ' componentFrame/req', (t.frameMs/N).toFixed(1)+'ms');

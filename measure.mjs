import { chromium } from 'playwright'
const base=process.env.BASE||'http://localhost:3000', label=process.env.LABEL||'run'
const b=await chromium.launch(); const ctx=await b.newContext(); const p=await ctx.newPage()
const msgs=[]
p.on('console',m=>{const t=m.text(); if(/WebSocket|HMR|error/i.test(t)) msgs.push(t)})
p.on('websocket',w=>{msgs.push('WS open '+w.url()); w.on('close',()=>msgs.push('WS close '+w.url()))})
await p.goto(base,{waitUntil:'load'}); await p.waitForSelector('#home'); await p.waitForTimeout(700)
const t=Date.now(); await p.click('#about-link')
// detect whether URL changed promptly
let urlChangeMs=null
try{ await p.waitForFunction(()=>location.pathname==='/about',null,{timeout:60000}); urlChangeMs=Date.now()-t }catch{}
await p.waitForSelector('#about',{timeout:120000}); const renderMs=Date.now()-t
await p.screenshot({path:`/workspace/.next-maintainer/reproduction-artifacts/playwright/${label}.png`})
console.log(JSON.stringify({label,urlChangeMs,renderMs,msgs}))
await b.close()

import React, { useMemo, useState } from "react";

// PUT YOUR IMAGE IN public/logo.jpg - this image will be the logo
const LOGO = "/logo.jpg";

const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11] },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12] },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8] },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,5,4,3,4,5,4,3,4,5,4,3,4,4,5], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3] },
  { name: "McCabe Golf Course", short: "MCCABE", pars: [4,4,3,5,4,3,4,4,3,4,4,4,3,5,4,3,4,4], si: [8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9] },
  { name: "Harpeth Hills", short: "HARPETH", pars: [4,5,3,4,4,4,3,4,5,4,4,3,4,4,3,5,4,5], si: [9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6] },
];

function calc(scores, pars, sis, hcpMap, useHcp) {
  const players = Object.keys(scores);
  const hp = {}; players.forEach(p => hp[p] = Array(18).fill(0));
  const strokeAlloc = {}; players.forEach(p => strokeAlloc[p] = Array(18).fill(0));
  let carry = 0, cc = 0;
  for (let h = 0; h < 18; h++) {
    const nets = [];
    players.forEach(p => {
      const g = scores[p][h]; if (g === "" || g == null) return;
      let s = 0;
      if (useHcp) {
        if (p === "Joe") { if (sis[h] === 1 || sis[h] === 2) s = 1; }
        else { const hc = hcpMap[p] || 0; if (hc >= sis[h]) s = 1; if (hc >= 18 && sis[h] <= hc - 18) s++; }
        strokeAlloc[p][h] = s;
      }
      nets.push({ p, net: g - s });
    });
    if (!nets.length) continue;
    const min = Math.min(...nets.map(x => x.net));
    const winners = nets.filter(x => x.net === min);
    if (winners.length === 1) {
      const perLoser = Math.min(2 + carry, 6);
      const winner = winners[0].p;
      hp[winner][h] += perLoser * (players.length - 1);
      players.forEach(p => { if (p !== winner && scores[p][h] !== "" && scores[p][h] != null) hp[p][h] -= perLoser; });
      carry = 0; cc = 0;
    } else { if (cc < 2) { carry += 2; cc++; } else carry = 4; }
  }
  for (let h = 0; h < 18; h++) {
    const bm = [], em = [];
    players.forEach(p => { const g = scores[p][h]; if (g === "" || g == null) return; if (g === pars[h] - 1) bm.push(p); else if (g <= pars[h] - 2) em.push(p); });
    bm.forEach(m => { const o = players.filter(p => p !== m && scores[p][h] !== "" && scores[p][h] != null); hp[m][h] += 2 * o.length; o.forEach(x => hp[x][h] -= 2); });
    em.forEach(m => { const o = players.filter(p => p !== m && scores[p][h] !== "" && scores[p][h] != null); hp[m][h] += 5 * o.length; o.forEach(x => hp[x][h] -= 5); });
  }
  const totals = {}, gross = {}; players.forEach(p => { totals[p] = hp[p].reduce((a,b)=>a+b,0); gross[p] = (scores[p]||[]).reduce((a,v)=>a+(parseInt(v)||0),0); });
  return { hp, totals, gross, carry, strokeAlloc };
}

export default function App() {
  const [cIdx, setCIdx] = useState(1); const course = COURSES[cIdx];
  const [players, setPlayers] = useState([{ name: "Graham", hcp: 0 }, { name: "Joe", hcp: 2 }, { name: "Brad", hcp: 0 }]);
  const [scores, setScores] = useState(() => { const o = {}; ["Graham","Joe","Brad"].forEach(n=>o[n]=Array(18).fill("")); return o; });
  const [useHcp, setUseHcp] = useState(true);
  const [newName, setNewName] = useState(""); const [newHcp, setNewHcp] = useState(10);
  const hcpMap = useMemo(() => { const m = {}; players.forEach(p => m[p.name] = p.hcp); return m; }, [players]);
  const res = useMemo(() => calc(scores, course.pars, course.si, hcpMap, useHcp), [scores, course, hcpMap, useHcp]);
  function upd(n,i,v){ const c=v.replace(/[^0-9]/g,''); setScores(p=>{ const o={...p}; const a=[...(o[n]||Array(18).fill(""))]; a[i]=c===""?"":parseInt(c,10); o[n]=a; return o; }); }
  function addPlayer(){ const name=newName.trim(); if(!name||players.length>=4||players.find(p=>p.name===name)) return; setPlayers(p=>[...p,{name,hcp:parseInt(newHcp)||0}]); setScores(s=>({...s,[name]:Array(18).fill("")})); setNewName(""); }
  function removePlayer(name){ if(players.length<=2) return; setPlayers(p=>p.filter(x=>x.name!==name)); setScores(s=>{ const o={...s}; delete o[name]; return o; }); }
  function updateHcp(name,hcp){ setPlayers(p=>p.map(x=>x.name===name?{...x,hcp:parseInt(hcp)||0}:x)); }

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <div className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur border-b border-white/10 p-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={LOGO} alt="DarkScore Tour Logo - Graham Joe Brad" className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]" onError={(e)=>e.target.style.display='none'} />
          <div><div className="font-black flex items-center gap-2 text-[15px]">DarkScore Tour <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">JOE: SI 1&2 • LOGO</span></div><div className="text-[11px] opacity-50 mt-0.5">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • Joe SI 1&2 • Birdie +2 • Eagle +5 • {useHcp?"NET":"GROSS"} • Carry {res.carry}</div></div>
        </div>
        <label className="flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/10 cursor-pointer"><input type="checkbox" checked={useHcp} onChange={e=>setUseHcp(e.target.checked)} />HCP {useHcp?"ON":"OFF"}</label>
      </div>
      <div className="max-w-[1600px] mx-auto p-4 space-y-4">
        <div className="rounded-[22px] bg-[#0E131E] border border-white/10 p-4"><div className="text-[11px] font-bold opacity-40 mb-3">SELECT COURSE</div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">{COURSES.map((c,i)=>(<button key={c.short} onClick={()=>setCIdx(i)} className={`rounded-2xl border p-4 text-left ${i===cIdx?"bg-white text-black":"bg-[#121828] border-white/10"}`}><span className="text-[10px] px-2 py-0.5 rounded-full border font-bold">{c.short}</span><div className="font-black text-[13px] mt-3">{c.name}</div></button>))}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">{players.map(p=>(<div key={p.name} className="rounded-2xl bg-[#0E131E] border border-white/10 p-4"><div className="flex justify-between"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-full bg-emerald-400 text-black flex items-center justify-center font-black">{p.name[0]}</div><span className="font-bold text-sm">{p.name}</span>{p.name==="Joe"&&<span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-black font-black">SI 1&2</span>}</div><button onClick={()=>removePlayer(p.name)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">✕</button></div><div className="mt-3 flex gap-2 items-center"><span className="text-[11px] opacity-50">HCP</span><input type="number" value={p.hcp} onChange={e=>updateHcp(p.name,e.target.value)} className="w-16 h-8 rounded-lg bg-black/40 border border-white/10 text-center" /></div><div className="mt-3 flex justify-between"><span className="text-3xl font-black">{res.gross[p.name]||0}</span><span className={`text-sm font-black px-2.5 py-1 rounded-full ${res.totals[p.name]>0?"bg-emerald-400 text-black":res.totals[p.name]<0?"bg-red-400 text-black":"bg-white/10"}`}>{res.totals[p.name]||0} PTS</span></div></div>))}{players.length<4&&(<div className="rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-500/[0.05] p-4"><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="w-full h-9 rounded-lg bg-black/40 border border-white/10 px-3 text-sm mb-2" /><div className="flex gap-2"><input type="number" value={newHcp} onChange={e=>setNewHcp(e.target.value)} className="w-20 h-9 rounded-lg bg-black/40 border border-white/10 text-center" /><button onClick={addPlayer} className="flex-1 h-9 rounded-lg bg-white text-black font-black text-sm">+ Add</button></div></div>)}</div>
      </div>
    </div>
  );
}

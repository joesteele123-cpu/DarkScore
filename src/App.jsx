import React, { useEffect, useMemo, useState } from "react";

const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11] },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12] },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8] },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,4,5], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3] },
  { name: "McCabe Golf Course", short: "MCCABE", pars: [4,4,3,5,4,3,4,4,3,4,4,3,5,4,3,4,4], si: [8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9] },
  { name: "Harpeth Hills", short: "HARPETH", pars: [4,5,3,4,4,4,3,4,5,4,4,3,4,4,3,5,4,5], si: [9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6] },
];

function calc(scores, pars, sis, hcpMap, useHcp) {
  const players = Object.keys(scores);
  const hp = {}; players.forEach(p => hp[p] = Array(18).fill(0));
  let carry = 0, cc = 0;
  for (let h = 0; h < 18; h++) {
    const nets = [];
    players.forEach(p => {
      const g = scores[p][h]; if (g === "" || g == null) return;
      let s = 0;
      if (useHcp) { const hc = hcpMap[p] || 0; if (hc >= sis[h]) s = 1; if (hc >= 18 && sis[h] <= hc - 18) s++; }
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
  return { hp, totals, gross, carry };
}

export default function App() {
  const [cIdx, setCIdx] = useState(1); const course = COURSES[cIdx];
  const [players] = useState([{ name: "Graham", hcp: 9 }, { name: "Joe", hcp: 14 }, { name: "Brad", hcp: 18 }]);
  const [scores, setScores] = useState(() => { const o = {}; players.forEach(p => o[p.name] = Array(18).fill("")); return o; });
  const [useHcp, setUseHcp] = useState(false);
  const [standings, setStandings] = useState({}); const [rounds, setRounds] = useState([]);
  const hcpMap = useMemo(() => { const m = {}; players.forEach(p => m[p.name] = p.hcp); return m; }, [players]);
  const res = useMemo(() => calc(scores, course.pars, course.si, hcpMap, useHcp), [scores, course, hcpMap, useHcp]);
  function upd(n,i,v){ const c=v.replace(/[^0-9]/g,''); setScores(p=>{ const o={...p}; const a=[...(o[n]||Array(18).fill(""))]; a[i]=c===""?"":parseInt(c,10); o[n]=a; return o; }); }
  async function saveRound(){ const now=new Date(); const rd={id:Date.now(),dateStr:now.toLocaleDateString()+' '+now.toLocaleTimeString(),course,scores:{...scores},totals:{...res.totals},gross:{...res.gross}}; const nr=[rd,...rounds].slice(0,50); setRounds(nr); const ns={...standings}; players.forEach(p=>{ const cur=ns[p.name]||{rounds:0,points:0}; ns[p.name]={rounds:cur.rounds+1,points:cur.points+(res.totals[p.name]||0)}; }); setStandings(ns); try{ await fetch('/api/standings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({standings:ns,rounds:nr})}); }catch{} const cl={}; players.forEach(p=>cl[p.name]=Array(18).fill("")); setScores(cl); }

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <div className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center">
        <div><div className="font-black flex items-center gap-2">DarkScore Tour <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">ZERO-SUM FIXED</span></div><div className="text-[11px] opacity-50 mt-1">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • Win 2 per player • Max 6 + bonuses • Birdie +2 • Eagle +5 • {useHcp?"NET":"GROSS"} • Carry {res.carry}</div></div>
        <label className="flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/10 cursor-pointer"><input type="checkbox" checked={useHcp} onChange={e=>setUseHcp(e.target.checked)} />HANDICAP {useHcp?"ON":"OFF"}</label>
      </div>
      <div className="max-w-[1600px] mx-auto p-4 space-y-4">
        <div className="rounded-[22px] bg-[#0E131E] border border-white/10 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="text-[11px] font-bold opacity-40 mb-3 tracking-widest">SELECT COURSE • 6 VENUES</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {COURSES.map((c,i)=>(
              <button key={c.short} onClick={()=>setCIdx(i)} className={`rounded-2xl border p-4 text-left transition-all ${i===cIdx?"bg-white text-black border-white shadow-[0_0_30px_rgba(16,185,129,0.35)] scale-[1.02]":"bg-[#121828] border-white/10 hover:border-emerald-400/30 hover:bg-[#161E32]"}`}>
                <div className="flex justify-between"><span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${i===cIdx?"bg-black/10 border-black/20":"bg-white/10 border-white/10"}`}>{c.short}</span><span className="text-[10px] opacity-60">Par {c.pars.reduce((a,b)=>a+b,0)}</span></div>
                <div className="font-black text-[13px] mt-3 leading-tight">{c.name}</div>
                <div className="text-[11px] opacity-60 mt-1">{c.pars.filter(p=>p===3).length}xP3 • {c.pars.filter(p=>p===4).length}xP4 • {c.pars.filter(p=>p===5).length}xP5</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {players.map(p=>(
            <div key={p.name} className="rounded-2xl bg-[#0E131E] border border-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex justify-between items-center"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-full bg-emerald-400 text-black flex items-center justify-center font-black text-sm">{p.name[0]}</div><span className="font-bold text-sm">{p.name}</span></div><span className="text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10">HCP {p.hcp}</span></div>
              <div className="mt-3 flex justify-between items-baseline"><span className="text-3xl font-black tracking-tight">{res.gross[p.name]||0}</span><span className={`text-sm font-black px-2.5 py-1 rounded-full ${res.totals[p.name]>0?"bg-emerald-400 text-black":res.totals[p.name]<0?"bg-red-400 text-black":"bg-white/10"}`}>{res.totals[p.name]>0?`+${res.totals[p.name]}`:res.totals[p.name]||"0"} PTS</span></div>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-4 flex items-center justify-center text-[11px] opacity-40 tracking-widest">ADD PLAYER (MAX 4)</div>
        </div>

        <div className="rounded-2xl bg-[#0E131E] border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="p-4 flex justify-between items-center border-b border-white/10"><div className="font-black text-sm">{course.name} • Scorecard • 18 HOLES</div><div className="text-[11px] flex gap-3 opacity-60"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>positive</span><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span>negative</span></div></div>
          <div className="overflow-x-auto"><div className="min-w-[1200px] grid" style={{gridTemplateColumns:"56px 56px 56px repeat(3, 1fr) 80px"}}>
            <div className="p-3 text-[11px] opacity-40 font-bold">HOLE</div><div className="p-3 text-[11px] opacity-40 font-bold">PAR</div><div className="p-3 text-[11px] opacity-40 font-bold">SI</div>{players.map(p=><div key={p.name} className="p-3 text-[11px] font-black opacity-80">{p.name.toUpperCase()} H{p.hcp}</div>)}<div className="p-3 text-[11px] opacity-40 font-bold">POT</div>
            {Array.from({length:18},(_,h)=>(
              <React.Fragment key={h}>
                <div className="p-3 border-t border-white/[0.06] font-bold text-sm">{h+1}</div><div className="p-3 border-t border-white/[0.06]"><span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{course.pars[h]}</span></div><div className="p-3 border-t border-white/[0.06] text-xs opacity-50">{course.si[h]}</div>
                {players.map(p=>{
                  const hp=res.hp[p.name]?.[h]||0; const val=scores[p.name]?.[h]??""; const par=course.pars[h]; const isB=val!=="" && val===par-1; const isE=val!=="" && val<=par-2;
                  return <div key={p.name} className="p-2 border-t border-white/[0.06] flex items-center gap-2"><input value={val} onChange={e=>upd(p.name,h,e.target.value)} className={`w-14 h-9 rounded-xl bg-black/40 border text-center text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-400/30 ${hp>0?"border-emerald-400/40 text-emerald-200":hp<0?"border-red-400/40 text-red-200":"border-white/10"}`} placeholder="–"/>{isB && <span className="text-[10px] font-black text-emerald-300">• B</span>}{isE && <span className="text-[10px] font-black text-amber-300">• E</span>}{hp!==0 && <span className={`min-w-[32px] h-7 px-1.5 rounded-full text-black text-[11px] font-black flex items-center justify-center ${hp>0?"bg-emerald-400":"bg-red-400"}`}>{hp>0?`+${hp}`:hp}</span>}</div>;
                })}
                <div className="p-3 border-t border-white/[0.06] text-xs opacity-60">{res.carry>0?`CARRY ${res.carry}`:"–"}</div>
              </React.Fragment>
            ))}
          </div></div>
          <div className="p-4 flex justify-between items-center bg-black/30 border-t border-white/10"><div className="text-[11px] opacity-60 font-mono">Zero-sum: Winner +4 / Losers -2 (3 players). Birdie +4/-2/-2 gross only. Max 6 per loser + bonuses. {useHcp?"NET wins":"GROSS wins - fixes Hole 7"}</div><button onClick={saveRound} className="px-6 py-2.5 bg-white text-black rounded-full font-black text-sm hover:bg-emerald-300 transition-colors">End Round → Save</button></div>
        </div>
      </div>
    </div>
  );
}

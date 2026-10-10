import React, { useMemo, useState } from "react";

const LOGO = "/logo.jpg";

const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11] },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12] },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8] },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,4,5], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3] },
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
  const [players, setPlayers] = useState([{ name: "Graham", hcp: 9 }, { name: "Joe", hcp: 2 }, { name: "Brad", hcp: 18 }]);
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
    <div className="min-h-screen bg-[#05080F] text-white font-sans">
      {/* HEADER WITH LOGO */}
      <div className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={LOGO} alt="DarkScore Tour" className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.35)]" onError={(e)=>{e.target.src='https://i.imgur.com/8Km9tLL.png'}} />
          <div>
            <div className="font-black text-[16px] flex items-center gap-2">DarkScore Tour <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold tracking-wider">PRETTIER • JOE SI 1&2</span></div>
            <div className="text-[11px] opacity-50 mt-1 font-mono">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • Joe gets SI 1&2 • Birdie +2 • Eagle +5 • {useHcp?"NET":"GROSS"} • Carry {res.carry}</div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-full bg-white/10 border border-white/10 cursor-pointer hover:bg-white/15 transition-colors"><input type="checkbox" checked={useHcp} onChange={e=>setUseHcp(e.target.checked)} className="accent-emerald-400" />HCP {useHcp?"ON":"OFF"}</label>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 space-y-5">
        {/* COURSES - PRETTIER */}
        <div className="rounded-[24px] bg-gradient-to-b from-[#0E131E] to-[#0B0F1A] border border-white/10 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="text-[11px] font-black opacity-40 mb-4 tracking-[0.2em]">SELECT COURSE • 6 VENUES</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {COURSES.map((c,i)=>(
              <button key={c.short} onClick={()=>setCIdx(i)} className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${i===cIdx?"bg-white text-black border-white shadow-[0_0_30px_rgba(16,185,129,0.35)] scale-[1.03]":"bg-[#121828] border-white/10 hover:border-emerald-400/30 hover:bg-[#161E32] hover:scale-[1.02]"}`}>
                <div className="flex justify-between items-center"><span className={`text-[10px] px-2 py-1 rounded-full border font-black tracking-wider ${i===cIdx?"bg-black/10 border-black/15 text-black":"bg-white/10 border-white/10 text-white/70"}`}>{c.short}</span><span className="text-[10px] opacity-60 font-bold">Par {c.pars.reduce((a,b)=>a+b,0)}</span></div>
                <div className="font-black text-[13px] mt-3.5 leading-tight">{c.name}</div>
                <div className="text-[11px] opacity-60 mt-1.5 font-medium">{c.pars.filter(p=>p===3).length}xP3 • {c.pars.filter(p=>p===4).length}xP4 • {c.pars.filter(p=>p===5).length}xP5</div>
              </button>
            ))}
          </div>
        </div>

        {/* PLAYERS - PRETTIER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {players.map(p=>(
            <div key={p.name} className="rounded-[20px] bg-gradient-to-b from-[#0E131E] to-[#0A0E19] border border-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.3)] hover:border-white/15 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 text-black flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]">{p.name[0]}</div><span className="font-bold text-[15px]">{p.name}</span>{p.name==="Joe" && <span className="text-[9px] px-2 py-1 rounded-full bg-amber-400 text-black font-black tracking-wider">SI 1&2</span>}</div>
                <button onClick={()=>removePlayer(p.name)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-300 flex items-center justify-center text-xs transition-colors">✕</button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[11px] opacity-40 font-bold tracking-wider">HCP</span>
                <input type="number" min="0" max="36" value={p.hcp} onChange={e=>updateHcp(p.name,e.target.value)} className="w-20 h-9 rounded-xl bg-black/50 border border-white/10 text-center text-sm font-bold focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20" />
                <span className="text-[10px] opacity-40">{p.name==="Joe"?"SI 1,2":""}</span>
              </div>
              <div className="mt-4 flex justify-between items-baseline"><span className="text-[32px] font-black tracking-tight leading-none">{res.gross[p.name]||0}</span><span className={`text-[13px] font-black px-3 py-1.5 rounded-full shadow-lg ${res.totals[p.name]>0?"bg-emerald-400 text-black shadow-emerald-400/20":res.totals[p.name]<0?"bg-red-400 text-black shadow-red-400/20":"bg-white/10 text-white/60"}`}>{res.totals[p.name]>0?`+${res.totals[p.name]}`:res.totals[p.name]||"0"} PTS</span></div>
            </div>
          ))}
          {players.length<4 && (
            <div className="rounded-[20px] border border-dashed border-emerald-400/30 bg-gradient-to-b from-emerald-500/[0.07] to-transparent p-4 flex flex-col justify-center">
              <div className="text-[11px] font-black opacity-60 tracking-[0.15em] mb-3">ADD PLAYER</div>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name (e.g. Mike)" className="w-full h-10 rounded-xl bg-black/50 border border-white/10 px-3.5 text-sm focus:border-emerald-400/30 focus:outline-none mb-2.5" />
              <div className="flex gap-2.5"><input type="number" value={newHcp} onChange={e=>setNewHcp(e.target.value)} className="w-20 h-10 rounded-xl bg-black/50 border border-white/10 text-center text-sm font-bold" /><button onClick={addPlayer} className="flex-1 h-10 rounded-xl bg-white text-black font-black text-sm hover:bg-emerald-300 transition-colors">+ Add Player</button></div>
            </div>
          )}
        </div>

        {/* SCORECARD - RESTORED PRETTIER */}
        <div className="rounded-[20px] bg-[#0E131E] border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="p-5 flex justify-between items-center border-b border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent"><div className="font-black text-[14px] tracking-wide">{course.name} • Score Entry • 18 HOLES • Enter Gross Scores</div><div className="text-[11px] flex gap-4 opacity-60 font-medium"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>winning</span><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></span>losing</span><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>Joe stroke</span></div></div>
          
          <div className="overflow-x-auto">
            <div className="min-w-[1200px] grid" style={{gridTemplateColumns: `56px 56px 56px repeat(${players.length}, 1fr) 90px`}}>
              <div className="p-3.5 text-[11px] opacity-40 font-black tracking-wider bg-black/20">HOLE</div><div className="p-3.5 text-[11px] opacity-40 font-black tracking-wider bg-black/20">PAR</div><div className="p-3.5 text-[11px] opacity-40 font-black tracking-wider bg-black/20">SI / STROKE</div>{players.map(p=><div key={p.name} className="p-3.5 text-[11px] font-black opacity-80 bg-black/20 flex items-center gap-2">{p.name.toUpperCase()}<span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">H{p.hcp}</span>{p.name==="Joe" && <span className="text-[8px] px-1 py-0.5 rounded bg-amber-400 text-black font-black">SI 1&2</span>}</div>)}<div className="p-3.5 text-[11px] opacity-40 font-black tracking-wider bg-black/20">POT</div>
              
              {Array.from({length:18},(_,h)=>{
                const isJoeHole = course.si[h]===1 || course.si[h]===2;
                return (
                  <React.Fragment key={h}>
                    <div className={`p-3.5 border-t border-white/[0.06] font-black text-[14px] flex items-center gap-1.5 ${isJoeHole?"bg-amber-400/10 text-amber-200":""}`}>{h+1}{isJoeHole && <span className="text-[10px]">★</span>}</div>
                    <div className="p-2.5 border-t border-white/[0.06]"><span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[13px] font-bold border border-white/5">{course.pars[h]}</span></div>
                    <div className={`p-3.5 border-t border-white/[0.06] text-[12px] font-bold ${isJoeHole?"text-amber-300":"opacity-50"}`}>SI {course.si[h]}{isJoeHole && <div className="text-[9px] font-black text-amber-400 leading-none mt-0.5">JOE -1</div>}</div>
                    {players.map(p=>{
                      const hp=res.hp[p.name]?.[h]||0; const val=scores[p.name]?.[h]??""; const stroke=res.strokeAlloc[p.name]?.[h]||0; const par=course.pars[h]; const isB=val!=="" && val===par-1; const isE=val!=="" && val<=par-2;
                      return (
                        <div key={p.name} className="p-2 border-t border-white/[0.06] flex items-center gap-2">
                          <input inputMode="numeric" value={val} onChange={e=>upd(p.name,h,e.target.value)} className={`w-[64px] h-10 rounded-xl bg-black/50 border-2 text-center text-[15px] font-black outline-none transition-all focus:scale-[1.05] ${hp>0?"border-emerald-400/60 text-emerald-100 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]":hp<0?"border-red-400/50 text-red-200 bg-red-500/10":stroke>0?"border-amber-400/40 text-amber-100 bg-amber-500/10":"border-white/10 focus:border-white/20"} ${isB?"ring-2 ring-emerald-400/30":""} ${isE?"ring-2 ring-amber-400/40":""}`} placeholder="–" />
                          {stroke>0 && <span className="w-6 h-6 rounded-full bg-amber-400 text-black text-[11px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.4)]">-{stroke}</span>}
                          {isB && <span className="text-[10px] font-black text-emerald-300 tracking-wider">BIRDIE</span>}
                          {isE && <span className="text-[10px] font-black text-amber-300 tracking-wider">EAGLE</span>}
                          {hp!==0 && <span className={`min-w-[38px] h-8 px-2 rounded-full text-black text-[12px] font-black flex items-center justify-center shadow-lg ${hp>0?"bg-emerald-400 shadow-emerald-400/20":"bg-red-400 shadow-red-400/20"}`}>{hp>0?`+${hp}`:hp}</span>}
                        </div>
                      );
                    })}
                    <div className="p-3.5 border-t border-white/[0.06] text-[11px] font-bold opacity-60">{res.carry>0?`CARRY ${res.carry}`:"—"}</div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 flex justify-between items-center bg-black/40 border-t border-white/10 backdrop-blur">
            <div className="text-[11px] opacity-50 font-mono leading-relaxed">Zero-sum • Winner +4 / Losers -2 (3 players) • Max 6 per loser + Birdie +2 / Eagle +5 • Joe gets SI 1&2 • {useHcp?"NET":"GROSS"} — fixes old Hole 7 bug</div>
            <button className="px-7 py-3 bg-white text-black rounded-full font-black text-[13px] tracking-wide hover:bg-emerald-300 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">End Round → Save</button>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0E131E] border border-white/10 p-5">
          <div className="font-black text-sm mb-3">Leaderboard Totals</div>
          <div className="grid grid-cols-3 gap-3">
            {players.map(p=>(
              <div key={p.name} className="flex justify-between items-center p-3 rounded-xl bg-black/30 border border-white/5">
                <span className="font-bold">{p.name}</span>
                <span className="flex gap-3"><span className="opacity-60">{res.gross[p.name]||0} gross</span><span className={`font-black ${res.totals[p.name]>0?"text-emerald-400":res.totals[p.name]<0?"text-red-400":""}`}>{res.totals[p.name]>0?`+${res.totals[p.name]}`:res.totals[p.name]||0} pts</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

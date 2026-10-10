import React, { useEffect, useMemo, useState } from "react";
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
      players.forEach(p => { if (p!== winner && scores[p][h]!== "" && scores[p][h]!= null) hp[p][h] -= perLoser; });
      carry = 0; cc = 0;
    } else { if (cc < 2) { carry += 2; cc++; } else carry = 4; }
  }
  for (let h = 0; h < 18; h++) {
    const bm = [], em = [];
    players.forEach(p => { const g = scores[p][h]; if (g === "" || g == null) return; if (g === pars[h] - 1) bm.push(p); else if (g <= pars[h] - 2) em.push(p); });
    bm.forEach(m => { const o = players.filter(p => p!== m && scores[p][h]!== "" && scores[p][h]!= null); hp[m][h] += 2 * o.length; o.forEach(x => hp[x][h] -= 2); });
    em.forEach(m => { const o = players.filter(p => p!== m && scores[p][h]!== "" && scores[p][h]!= null); hp[m][h] += 5 * o.length; o.forEach(x => hp[x][h] -= 5); });
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
  const [standings, setStandings] = useState({}); const [rounds, setRounds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const [expandedRound, setExpandedRound] = useState(null);
  const hcpMap = useMemo(() => { const m = {}; players.forEach(p => m[p.name] = p.hcp); return m; }, [players]);
  const res = useMemo(() => calc(scores, course.pars, course.si, hcpMap, useHcp), [scores, course, hcpMap, useHcp]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/standings');
        if (r.ok) {
          const d = await r.json();
          if (d.standings && Object.keys(d.standings).length) setStandings(d.standings);
          if (d.rounds && d.rounds.length) setRounds(d.rounds);
        }
      } catch {}
    })();
  }, []);
  function upd(n,i,v){ const c=v.replace(/[^0-9]/g,''); setScores(p=>{ const o={...p}; const a=[...(o[n]||Array(18).fill(""))]; a[i]=c===""?"":parseInt(c,10); o[n]=a; return o; }); }
  function addPlayer(){ const name=newName.trim(); if(!name||players.length>=4||players.find(p=>p.name===name)) return; setPlayers(p=>[...p,{name,hcp:parseInt(newHcp)||0}]); setScores(s=>({...s,[name]:Array(18).fill("")})); setNewName(""); }
  function removePlayer(name){ if(players.length<=2) return; setPlayers(p=>p.filter(x=>x.name!==name)); setScores(s=>{ const o={...s}; delete o[name]; return o; }); }
  function updateHcp(name,hcp){ setPlayers(p=>p.map(x=>x.name===name?{...x,hcp:parseInt(hcp)||0}:x)); }
  async function saveRound() {
    setIsSaving(true);
    const now = new Date();
    const rd = { id: Date.now(), dateStr: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(), course: { name: course.name, short: course.short, pars: course.pars, si: course.si }, scores: {...scores }, totals: {...res.totals }, gross: {...res.gross }, hp: {...res.hp}, strokeAlloc: {...res.strokeAlloc} };
    const nr = [rd,...rounds].slice(0, 50);
    setRounds(nr);
    const ns = {...standings };
    players.forEach(p => { const cur = ns[p.name] || { rounds: 0, points: 0 }; ns[p.name] = { rounds: cur.rounds + 1, points: cur.points + (res.totals[p.name] || 0) }; });
    setStandings(ns);
    try {
      const resp = await fetch('/api/standings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ standings: ns, rounds: nr }) });
      if (!resp.ok) throw new Error('save failed');
    } catch (e) {
      localStorage.setItem('darkscore:standings', JSON.stringify(ns));
      localStorage.setItem('darkscore:rounds', JSON.stringify(nr));
    } finally { setIsSaving(false); }
    const cl = {}; players.forEach(p => cl[p.name] = Array(18).fill("")); setScores(cl);
  }
  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans">
      <div className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <img src={LOGO} alt="Galactic Skins" className="w-14 h-14 rounded-2xl object-cover border-2 border-fuchsia-400/40" />
            <div><div className="font-black text-[18px] flex items-center gap-3">Galactic Skins <span className="text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 border border-fuchsia-400/30 text-fuchsia-200 font-bold">GALACTIC SKINS</span></div><div className="text-[11px] opacity-50 mt-1 font-mono">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • Joe SI 1&2 • Birdie +2 • Eagle +5 • {useHcp?"NET":"GROSS"} • Carry {res.carry} • {rounds.length} rounds</div></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
              <button onClick={()=>setActiveTab("live")} className={`px-5 py-2 rounded-full text-sm font-black ${activeTab==="live"?"bg-white text-black":"text-white/60"}`}>Live Round</button>
              <button onClick={()=>setActiveTab("history")} className={`px-5 py-2 rounded-full text-sm font-black ${activeTab==="history"?"bg-white text-black":"text-white/60"}`}>History • {rounds.length}</button>
            </div>
            <label className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-full bg-white/10 border border-white/10"><input type="checkbox" checked={useHcp} onChange={e=>setUseHcp(e.target.checked)} />HCP {useHcp?"ON":"OFF"}</label>
          </div>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto p-4 space-y-5">
        {activeTab==="live" && (<>
          <div className="rounded-[24px] bg-[#0E131E] border border-white/10 p-5"><div className="text-[11px] font-black opacity-40 mb-4">SELECT COURSE • 6 VENUES</div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">{COURSES.map((c,i)=>(<button key={c.short} onClick={()=>setCIdx(i)} className={`rounded-2xl border p-4 text-left ${i===cIdx?"bg-white text-black":"bg-[#121828] border-white/10"}`}><span className="text-[10px] px-2 py-1 rounded-full border font-black">{c.short}</span><div className="font-black text-[13px] mt-3.5">{c.name}</div></button>))}</div></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{players.map(p=>(<div key={p.name} className="rounded-[20px] bg-[#0E131E] border border-white/10 p-4"><div className="flex justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black">{p.name[0]}</div><span className="font-bold">{p.name}</span>{p.name==="Joe" && <span className="text-[9px] px-2 py-1 rounded-full bg-amber-400 text-black font-black">SI 1&2</span>}</div><button onClick={()=>removePlayer(p.name)} className="w-7 h-7 rounded-full bg-white/10">✕</button></div><div className="mt-4 flex items-center gap-3"><span className="text-[11px] opacity-40">HCP</span><input type="number" value={p.hcp} onChange={e=>updateHcp(p.name,e.target.value)} className="w-20 h-9 rounded-xl bg-black/50 border border-white/10 text-center font-bold" /></div><div className="mt-4 flex justify-between"><span className="text-[32px] font-black">{res.gross[p.name]||0}</span><span className={`text-[13px] font-black px-3 py-1.5 rounded-full ${res.totals[p.name]>0?"bg-fuchsia-400 text-black":res.totals[p.name]<0?"bg-red-400 text-black":"bg-white/10"}`}>{res.totals[p.name]||0} PTS</span></div></div>))}{players.length<4 && (<div className="rounded-[20px] border border-dashed border-fuchsia-400/30 bg-fuchsia-500/[0.07] p-4"><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="w-full h-10 rounded-xl bg-black/50 border border-white/10 px-3.5 mb-2.5" /><div className="flex gap-2.5"><input type="number" value={newHcp} onChange={e=>setNewHcp(e.target.value)} className="w-20 h-10 rounded-xl bg-black/50 border border-white/10 text-center" /><button onClick={addPlayer} className="flex-1 h-10 rounded-xl bg-white text-black font-black">+ Add</button></div></div>)}</div>
          <div className="rounded-[20px] bg-[#0E131E] border border-white/10 overflow-hidden"><div className="p-5 flex justify-between border-b border-white/10 bg-gradient-to-r from-fuchsia-500/10 to-transparent"><div className="font-black">Galactic Skins • {course.name} • Score Entry • Birdie/Eagle Highlighted</div><div className="text-[11px] flex gap-2"><span className="px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-300 font-bold">BIRDIE</span><span className="px-2 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold">EAGLE</span></div></div><div className="overflow-x-auto"><div className="min-w-[1300px] grid" style={{gridTemplateColumns: `56px 56px 56px repeat(${players.length}, 1fr) 90px`}}><div className="p-3.5 text-[11px] opacity-40 font-black bg-black/20">HOLE</div><div className="p-3.5 text-[11px] opacity-40 font-black bg-black/20">PAR</div><div className="p-3.5 text-[11px] opacity-40 font-black bg-black/20">SI</div>{players.map(p=><div key={p.name} className="p-3.5 text-[11px] font-black bg-black/20">{p.name.toUpperCase()} H{p.hcp}</div>)}<div className="p-3.5 text-[11px] opacity-40 font-black bg-black/20">POT</div>{Array.from({length:18},(_,h)=>{const par=course.pars[h]; return (<React.Fragment key={h}><div className={`p-3.5 border-t border-white/[0.06] font-black ${(course.si[h]===1||course.si[h]===2)?"bg-amber-400/10 text-amber-200":""}`}>{h+1}</div><div className="p-2.5 border-t border-white/[0.06]"><span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">{par}</span></div><div className={`p-3.5 border-t border-white/[0.06] text-[12px] font-bold ${course.si[h]<=2?"text-amber-300":"opacity-50"}`}>SI {course.si[h]}</div>{players.map(p=>{const hp=res.hp[p.name]?.[h]||0; const val=scores[p.name]?.[h]??""; const isB=val!==""&&val===par-1; const isE=val!==""&&val<=par-2; return <div key={p.name} className={`p-2 border-t border-white/[0.06] flex items-center gap-2 ${isB?"bg-emerald-500/10":isE?"bg-amber-500/15":""}`}><input inputMode="numeric" value={val} onChange={e=>upd(p.name,h,e.target.value)} className={`w-[64px] h-10 rounded-xl bg-black/50 border-2 text-center font-black ${isE?"border-amber-400 bg-amber-400/20":isB?"border-emerald-400 bg-emerald-400/20":hp>0?"border-fuchsia-400/60":"border-white/10"}`} placeholder="–" />{isB&&<span className="text-[9px] px-2 py-1 rounded-full bg-emerald-400 text-black font-black">BIRDIE</span>}{isE&&<span className="text-[9px] px-2 py-1 rounded-full bg-amber-400 text-black font-black">EAGLE</span>}{hp!==0&&<span className={`min-w-[38px] h-8 px-2 rounded-full text-black text-[12px] font-black ${hp>0?"bg-fuchsia-400":"bg-red-400"}`}>{hp>0?`+${hp}`:hp}</span>}</div>;})}<div className="p-3.5 border-t border-white/[0.06] text-[11px] opacity-60">{res.carry>0?`CARRY ${res.carry}`:"—"}</div></React.Fragment>);})}</div></div><div className="p-4 flex justify-between bg-black/40 border-t border-white/10"><div className="text-[11px] opacity-50">Graham 0 • Brad 0 • Joe 2 • Birdie +2 • Eagle +5 • {rounds.length} rounds</div><button onClick={saveRound} disabled={isSaving} className="px-7 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full font-black">{isSaving?"Saving...":"End Round → Save"}</button></div></div>
        </>)}
        {activeTab==="history" && (
          <div className="rounded-[24px] bg-[#0E131E] border border-white/10 p-6"><div className="font-black text-[20px]">Past Rounds • {rounds.length}</div>{rounds.length===0?(<div className="text-center py-16 opacity-40">No rounds saved yet</div>):(<div className="space-y-3 mt-6">{rounds.map((r)=>(<div key={r.id} className="rounded-[16px] bg-black/30 border border-white/10"><button onClick={()=>setExpandedRound(expandedRound===r.id?null:r.id)} className="w-full flex justify-between p-4 text-left"><span>{r.dateStr} • {r.course.short}</span><span>{Object.entries(r.totals||{}).map(([n,pts])=>`${n}: ${pts>0?`+${pts}`:pts}`).join(" • ")}</span></button>{expandedRound===r.id&&(<div className="border-t border-white/10 p-4"><div className="grid grid-cols-6 md:grid-cols-9 gap-2">{Array.from({length:18},(_,h)=>{const par=r.course.pars?.[h]||4; return <div key={h} className="rounded-xl bg-white/5 border border-white/10 p-2"><div className="text-[10px] opacity-50">H{h+1} Par{par}</div><div className="mt-1 space-y-1">{Object.keys(r.scores||{}).map(pName=>{const sc=r.scores[pName]?.[h]; const isB=sc===par-1; const isE=sc<=par-2&&sc!==""; if(sc==="") return null; return <div key={pName} className={`text-[11px] flex justify-between ${isE?"text-amber-300":isB?"text-emerald-300":""}`}>{pName[0]}:{sc}{isB&&" B"}{isE&&" E"}</div>;})}</div></div>;})}</div></div>)}</div>))}</div>)}</div>
        )}
      </div>
    </div>
  );
}

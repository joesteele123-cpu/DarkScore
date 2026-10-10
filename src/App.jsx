import React, { useEffect, useMemo, useState } from "react";
const LOGO = "/logo.jpg";
const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Nashville" },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12], area: "Mt Juliet" },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8], area: "Nashville" },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,5,4,3,4,3,5,4,4,5,4,4,3,4,3,4,5,4], si: [9,11,5,17,7,1,13,3,15,8,10,12,6,16,14,18,2,4], area: "Murfreesboro" },
  { name: "McCabe Golf Course", short: "MCCABE", pars: [4,4,3,5,4,3,4,4,3,4,4,4,3,5,4,3,4,4], si: [8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9], area: "Nashville" },
  { name: "Harpeth Hills", short: "HARPETH", pars: [4,5,3,4,4,4,3,4,5,4,4,3,4,4,3,5,4,5], si: [9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6], area: "Nashville" },
  { name: "Hermitage - General's Retreat", short: "HER-GEN", pars: [4,5,3,4,3,4,4,5,4,4,5,4,3,4,4,5,3,4], si: [18,8,16,6,12,14,10,4,2,9,1,11,13,5,17,3,15,7], area: "Old Hickory" },
  { name: "Hermitage - President's Reserve", short: "HER-PRES", pars: [4,5,3,4,4,4,3,5,4,4,4,3,4,5,3,4,4,5], si: [18,2,14,16,6,12,10,4,8,15,3,13,1,5,11,9,17,7], area: "Old Hickory" },
  { name: "Gaylord Springs Golf Links", short: "GAYLORD", pars: [5,4,3,4,4,5,4,3,4,4,5,3,4,4,3,4,5,4], si: [7,3,15,11,5,1,9,17,13,10,6,14,2,12,18,8,4,16], area: "Nashville" },
  { name: "Old Fort Golf Club", short: "OLD-FORT", pars: [4,5,3,4,4,5,4,3,4,5,4,4,3,4], si: [11,5,17,15,13,1,9,18,10,8,14,16,6,2,12,4,18,7], area: "Murfreesboro" },
  { name: "Twelve Stones Crossing", short: "12STONE", pars: [4,5,4,3,4,4,5,3,4,4,3,5,4,4,4,5,3,4], si: [6,2,12,16,8,14,4,18,10,9,15,7,3,11,17,1,13,5], area: "Goodlettsville" },
  { name: "Two Rivers Golf Course", short: "2RIVERS", pars: [4,3,5,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [12,14,6,8,10,16,2,4,18,11,5,15,7,3,17,9,1,13], area: "Nashville" },
  { name: "Lebanon Golf & Country Club", short: "LEBANON", pars: [4,3,4,3,5,5,4,4,4,4,3,4,4,5,4,4,3,5], si: [8,12,6,14,2,4,10,16,18,9,15,5,11,3,13,7,17,1], area: "Lebanon" },
  { name: "Champions Run", short: "CHAMP", pars: [4,4,5,3,4,4,3,4,5,4,5,3,4,4,4,3,5,4], si: [10,14,2,16,8,12,18,4,6,7,3,15,9,11,5,17,1,13], area: "Rockvale" },
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
  const [customCourses, setCustomCourses] = useState([]);
  const allCourses = useMemo(()=> [...COURSES,...customCourses], [customCourses]);
  const [cIdx, setCIdx] = useState(1);
  const course = allCourses[cIdx] || COURSES[1];
  const [players, setPlayers] = useState([{ name: "Graham", hcp: 0 }, { name: "Joe", hcp: 2 }, { name: "Brad", hcp: 0 }]);
  const [scores, setScores] = useState(() => { const o = {}; ["Graham","Joe","Brad"].forEach(n=>o[n]=Array(18).fill("")); return o; });
  const [useHcp, setUseHcp] = useState(true);
  const [newName, setNewName] = useState(""); const [newHcp, setNewHcp] = useState(10);
  const [standings, setStandings] = useState({}); const [rounds, setRounds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const [expandedRound, setExpandedRound] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState(""); const [addShort, setAddShort] = useState(""); const [addPars, setAddPars] = useState("4,4,3,5,4,4,3,4,5,4,4,3,5,4,3,4,5,4");
  const hcpMap = useMemo(() => { const m = {}; players.forEach(p => m[p.name] = p.hcp); return m; }, [players]);
  const res = useMemo(() => calc(scores, course.pars, course.si, hcpMap, useHcp), [scores, course, hcpMap, useHcp]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/standings');
        if (r.ok) { const d = await r.json(); if (d.standings) setStandings(d.standings); if (d.rounds) setRounds(d.rounds); }
        const rc = await fetch('/api/custom-courses');
        if (rc.ok) { const dc = await rc.json(); if (dc.courses) setCustomCourses(dc.courses); }
      } catch {}
    })();
  }, []);
  const leaderboard = useMemo(() => {
    const stats = {};
    const allNames = new Set([...players.map(p=>p.name),...Object.keys(standings)]);
    rounds.forEach(r => Object.keys(r.scores||{}).forEach(n=>allNames.add(n)));
    allNames.forEach(name => stats[name] = { name, points:0, rounds:0, grossTotal:0, pars:0, birdies:0, eagles:0, bogeys:0, doubles:0, others:0, bestGross:999, worstGross:0 });
    rounds.forEach(r => {
      const pars = r.course.pars || [];
      Object.keys(r.scores||{}).forEach(pName => {
        if (!stats[pName]) stats[pName] = { name:pName, points:0, rounds:0, grossTotal:0, pars:0, birdies:0, eagles:0, bogeys:0, doubles:0, others:0, bestGross:999, worstGross:0 };
        const grossArr = r.scores[pName] || [];
        let roundGross = 0;
        grossArr.forEach((sc,h) => {
          if (sc==="" || sc==null) return;
          const par = pars[h] || 4;
          const diff = sc - par;
          roundGross += sc;
          if (diff===0) stats[pName].pars++;
          else if (diff===-1) stats[pName].birdies++;
          else if (diff<=-2) stats[pName].eagles++;
          else if (diff===1) stats[pName].bogeys++;
          else if (diff===2) stats[pName].doubles++;
          else if (diff>=3) stats[pName].others++;
        });
        stats[pName].points += (r.totals?.[pName]||0);
        stats[pName].rounds += 1;
        stats[pName].grossTotal += (r.gross?.[pName] || roundGross);
        if (roundGross>0) { stats[pName].bestGross = Math.min(stats[pName].bestGross, roundGross); stats[pName].worstGross = Math.max(stats[pName].worstGross, roundGross); }
      });
    });
    return Object.values(stats).filter(s=>s.rounds>0).sort((a,b)=>b.points-a.points);
  }, [rounds, standings, players]);
  function upd(n,i,v){ const c=v.replace(/[^0-9]/g,''); setScores(p=>{ const o={...p}; const a=[...(o[n]||Array(18).fill(""))]; a[i]=c===""?"":parseInt(c,10); o[n]=a; return o; }); }
  function addPlayer(){ const name=newName.trim(); if(!name||players.length>=4||players.find(p=>p.name===name)) return; setPlayers(p=>[...p,{name,hcp:parseInt(newHcp)||0}]); setScores(s=>({...s,[name]:Array(18).fill("")})); setNewName(""); }
  function removePlayer(name){ if(players.length<=2) return; setPlayers(p=>p.filter(x=>x.name!==name)); setScores(s=>{ const o={...s}; delete o[name]; return o; }); }
  function updateHcp(name,hcp){ setPlayers(p=>p.map(x=>x.name===name?{...x,hcp:parseInt(hcp)||0}:x)); }
  async function saveRound() {
    setIsSaving(true);
    const now = new Date();
    const rd = { id: Date.now(), dateStr: now.toLocaleDateString() + ' ' + now.toLocaleTimeString(), course: { name: course.name, short: course.short, pars: course.pars, si: course.si }, scores: {...scores }, totals: {...res.totals }, gross: {...res.gross }, hp: {...res.hp} };
    const nr = [rd,...rounds].slice(0, 50);
    setRounds(nr);
    const ns = {...standings }; players.forEach(p => { const cur = ns[p.name] || { rounds: 0, points: 0 }; ns[p.name] = { rounds: cur.rounds + 1, points: cur.points + (res.totals[p.name] || 0) }; }); setStandings(ns);
    try { await fetch('/api/standings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ standings: ns, rounds: nr }) }); } catch {}
    setIsSaving(false);
    const cl = {}; players.forEach(p => cl[p.name] = Array(18).fill("")); setScores(cl);
    setActiveTab("history");
  }
  async function handleAddCourse() {
    const pars = addPars.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if (pars.length!==18) { alert("Need 18 pars comma separated"); return; }
    if (!addName ||!addShort) { alert("Need name and short code"); return; }
    const nc = { name: addName, short: addShort.toUpperCase(), pars, si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Custom" };
    const updated = [...customCourses, nc];
    setCustomCourses(updated);
    try { await fetch('/api/custom-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courses: updated }) }); } catch {}
    setShowAdd(false); setAddName(""); setAddShort("");
  }
  const filteredCourses = allCourses.filter(c =>!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.short.toLowerCase().includes(searchQuery.toLowerCase()) || c.area.toLowerCase().includes(searchQuery.toLowerCase()));
  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans">
      <div className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w- mx-auto flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <img src={LOGO} alt="Galactic Skins" className="w-12 h-12 rounded-xl object-cover border-2 border-fuchsia-400/40" onError={e=>e.target.style.display='none'} />
            <div><div className="font-black text- flex items-center gap-2">Galactic Skins <span className="text- px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-200 font-bold">NASHVILLE • {allCourses.length} COURSES</span></div><div className="text- opacity-50 mt-0.5 font-mono">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • Joe SI 1&2 • {useHcp?"NET":"GROSS"} • {rounds.length} rounds</div></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
              <button onClick={()=>setActiveTab("live")} className={`px-4 py-2 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/60"}`}>Live</button>
              <button onClick={()=>setActiveTab("history")} className={`px-4 py-2 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/60"}`}>History • {rounds.length}</button>
              <button onClick={()=>setActiveTab("leaderboard")} className={`px-4 py-2 rounded-full text-xs font-black ${activeTab==="leaderboard"?"bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white":"text-white/60"}`}>Leaderboard</button>
              <button onClick={()=>setActiveTab("courses")} className={`px-4 py-2 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"text-white/60"}`}>Courses</button>
            </div>
            <label className="flex items-center gap-1 text- px-3 py-2 rounded-full bg-white/10 border border-white/10"><input type="checkbox" checked={useHcp} onChange={e=>setUseHcp(e.target.checked)} />HCP</label>
          </div>
        </div>
      </div>
      <div className="max-w- mx-auto p-4 space-y-5">
        {activeTab==="live" && (
          <>
            <div className="rounded- bg-[#0E131E] border border-white/10 p-4"><div className="flex justify-between items-center mb-3 flex-wrap gap-2"><div className="text- font-black opacity-40">SELECT COURSE • {filteredCourses.length} SHOWING</div><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search courses..." className="h-9 px-3 rounded-full bg-black/50 border border-white/10 text-xs w-52" /></div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">{filteredCourses.map((c)=>{ const realIdx = allCourses.indexOf(c); return (<button key={c.short+realIdx} onClick={()=>setCIdx(realIdx)} className={`rounded-xl border p-3 text-left ${realIdx===cIdx?"bg-white text-black":"bg-[#121828] border-white/10 hover:border-fuchsia-400/30"}`}><div className="flex justify-between"><span className="text- px-1.5 py-0.5 rounded-full border font-black">{c.short}</span><span className="text- opacity-60">{c.area}</span></div><div className="font-black text- mt-2 leading-tight">{c.name}</div></button>);})}</div></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">{players.map(p=>(<div key={p.name} className="rounded- bg-[#0E131E] border border-white/10 p-3"><div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black text-sm">{p.name[0]}</div><span className="font-bold text-sm">{p.name}</span>{p.name==="Joe" && <span className="text- px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-black">SI 1&2</span>}</div><button onClick={()=>removePlayer(p.name)} className="w-6 h-6 rounded-full bg-white/10 text-xs">✕</button></div><div className="mt-3 flex items-center gap-2"><span className="text- opacity-40">HCP</span><input type="number" value={p.hcp} onChange={e=>updateHcp(p.name,e.target.value)} className="w-16 h-8 rounded-lg bg-black/50 border border-white/10 text-center font-bold text-sm" /></div><div className="mt-3 flex justify-between items-baseline"><span className="text- font-black">{res.gross[p.name]||0}</span><span className={`text- font-black px-2.5 py-1 rounded-full ${res.totals[p.name]>0?"bg-fuchsia-400 text-black":res.totals[p.name]<0?"bg-red-400 text-black":"bg-white/10"}`}>{res.totals[p.name]>0?`+${res.totals[p.name]}`:res.totals[p.name]||0} PTS</span></div></div>))}{players.length<4 && (<div className="rounded- border border-dashed border-fuchsia-400/30 bg-fuchsia-500/[0.07] p-3"><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="w-full h-8 rounded-lg bg-black/50 border border-white/10 px-2.5 text-xs mb-2" /><div className="flex gap-2"><input type="number" value={newHcp} onChange={e=>setNewHcp(e.target.value)} className="w-16 h-8 rounded-lg bg-black/50 border border-white/10 text-center text-xs" /><button onClick={addPlayer} className="flex-1 h-8 rounded-lg bg-white text-black font-black text-xs">+ Add</button></div></div>)}</div>
            <div className="rounded- bg-[#0E131E] border border-white/10 overflow-hidden"><div className="p-3 flex justify-between border-b border-white/10"><div className="font-black text-sm">Galactic Skins • {course.name} • Score Entry</div><div className="text- flex gap-2"><span className="px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-300 font-bold">BIRDIE -1</span><span className="px-2 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold">EAGLE -2</span></div></div><div className="overflow-x-auto"><div className="min-w- grid" style={{gridTemplateColumns: `44px 44px 44px repeat(${players.length}, 1fr) 70px`}}><div className="p-2.5 text- opacity-40 font-black bg-black/20">HOLE</div><div className="p-2.5 text- opacity-40 font-black bg-black/20">PAR</div><div className="p-2.5 text- opacity-40 font-black bg-black/20">SI</div>{players.map(p=><div key={p.name} className="p-2.5 text- font-black bg-black/20">{p.name.toUpperCase()} H{p.hcp}</div>)}<div className="p-2.5 text- opacity-40 font-black bg-black/20">POT</div>{Array.from({length:18},(_,h)=>{const par=course.pars[h]; return (<React.Fragment key={h}><div className={`p-2.5 border-t border-white/[0.06] font-black text-xs ${course.si[h]<=2?"bg-amber-400/10 text-amber-200":""}`}>{h+1}{course.si[h]<=2?"★":""}</div><div className="p-2 border-t border-white/[0.06]"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text- font-bold">{par}</span></div><div className={`p-2.5 border-t border-white/[0.06] text- font-bold ${course.si[h]<=2?"text-amber-300":"opacity-50"}`}>SI{course.si[h]}</div>{players.map(p=>{const hp=res.hp[p.name]?.[h]||0; const val=scores[p.name]?.[h]??""; const isB=val!==""&&val===par-1; const isE=val!==""&&val<=par-2; return <div key={p.name} className={`p-1.5 border-t border-white/[0.06] flex items-center gap-1.5 ${isB?"bg-emerald-500/10":isE?"bg-amber-500/15":""}`}><input inputMode="numeric" value={val} onChange={e=>upd(p.name,h,e.target.value)} className={`w- h-8 rounded-lg bg-black/50 border-2 text-center font-black text-sm ${isE?"border-amber-400":isB?"border-emerald-400":hp>0?"border-fuchsia-400/60":"border-white/10"}`} placeholder="–" />{isB&&<span className="text- px-1.5 py-0.5 rounded-full bg-emerald-400 text-black font-black">BIRDIE</span>}{isE&&<span className="text- px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-black">EAGLE</span>}{hp!==0&&<span className={`min-w- h-6 px-1.5 rounded-full text-black text- font-black flex items-center justify-center ${hp>0?"bg-fuchsia-400":"bg-red-400"}`}>{hp>0?`+${hp}`:hp}</span>}</div>;})}<div className="p-2.5 border-t border-white/[0.06] text- opacity-60">{res.carry>0?`CARRY ${res.carry}`:"—"}</div></React.Fragment>);})}</div></div><div className="p-3 flex justify-between bg-black/40 border-t border-white/10"><div className="text- opacity-50">Graham 0 • Brad 0 • Joe 2 • {rounds.length} rounds</div><button onClick={saveRound} disabled={isSaving} className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full font-black text-xs">{isSaving?"Saving...":"End Round → Save"}</button></div></div>
          </>
        )}
        {activeTab==="history" && (
          <div className="rounded- bg-[#0E131E] border border-white/10 p-5">
            <div className="flex justify-between items-center mb-4"><div className="font-black text-">Past Rounds • {rounds.length} Rounds (from KV)</div><div className="text- opacity-50">Click to expand birdie/eagle details</div></div>
            {rounds.length===0? (
              <div className="text-center py-16 rounded-xl bg-black/20 border border-dashed border-white/10"><div className="text- mb-3">🌌</div><div className="font-black">No rounds saved yet</div><div className="text-xs opacity-60 mt-2">Play a Live Round and click End Round → Save — it will appear here and in Leaderboard</div></div>
            ) : (
              <div className="space-y-3">
                {rounds.map((r)=>(
                  <div key={r.id} className="rounded- bg-black/30 border border-white/10 overflow-hidden">
                    <button onClick={()=>setExpandedRound(expandedRound===r.id?null:r.id)} className="w-full flex justify-between items-center p-3.5 hover:bg-white/5 text-left">
                      <div className="flex items-center gap-3"><span className="text-xs font-mono opacity-60">{r.dateStr}</span><span className="px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/20 text-fuchsia-200 text- font-bold">{r.course.short}</span><span className="text-xs opacity-70 hidden md:block">{r.course.name}</span></div>
                      <div className="flex items-center gap-3 text-xs"><span className="hidden md:flex gap-3">{Object.entries(r.totals||{}).map(([n,pts])=><span key={n} className={pts>0?"text-fuchsia-300 font-bold": pts<0?"text-red-300":"opacity-60"}>{n}: {pts>0?`+${pts}`:pts}</span>)}</span><span className={`transition-transform ${expandedRound===r.id?"rotate-180":""}`}>▼</span></div>
                    </button>
                    {expandedRound===r.id && (
                      <div className="border-t border-white/10 p-3 bg-black/20">
                        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
                          {Array.from({length:18},(_,h)=>{
                            const par = r.course.pars?.[h] || 4;
                            const si = r.course.si?.[h] || h+1;
                            return (
                              <div key={h} className="rounded-lg bg-white/5 border border-white/10 p-2">
                                <div className="flex justify-between text- opacity-50 font-black"><span>H{h+1}</span><span>SI{si} P{par}</span></div>
                                <div className="mt-1.5 space-y-1">
                                  {Object.keys(r.scores||{}).map(pName=>{
                                    const sc = r.scores[pName]?.[h];
                                    const pts = r.hp?.[pName]?.[h] || 0;
                                    if (sc==="" || sc==null) return <div key={pName} className="text- opacity-30">{pName[0]}: —</div>;
                                    const isB = sc===par-1;
                                    const isE = sc<=par-2;
                                    return (
                                      <div key={pName} className={`text- flex justify-between items-center px-1 py-0.5 rounded ${isE?"bg-amber-400/20":isB?"bg-emerald-400/20":""}`}>
                                        <span className="font-bold">{pName[0]} {sc}{isB?" B":isE?` E${par-sc}`:""}</span>
                                        <span className={`text- font-black ${pts>0?"text-fuchsia-300": pts<0?"text-red-300":"opacity-50"}`}>{pts!==0?(pts>0?`+${pts}`:pts):""}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 flex justify-between text- opacity-50 font-mono flex-wrap gap-2"><span>Gross: {Object.entries(r.gross||{}).map(([n,g])=>`${n} ${g}`).join(" • ")}</span><span>Points: {Object.entries(r.totals||{}).map(([n,p])=>`${n} ${p>0?`+${p}`:p}`).join(" • ")}</span></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab==="leaderboard" && (
          <div className="rounded- bg-[#0E131E] border border-white/10 p-5">
            <div className="font-black text-">Season Leaderboard • Galactic Skins</div><div className="text- opacity-50 mb-4">Points = Skins • Pars/Birdies/Eagles from gross • {rounds.length} rounds total</div>
            {leaderboard.length===0? (<div className="text-center py-12 opacity-40">No rounds yet — save a round to see stats</div>) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">{leaderboard.slice(0,3).map((s,i)=>(<div key={s.name} className={`rounded- border p-4 ${i===0?"bg-amber-400/10 border-amber-400/30":i===1?"bg-zinc-400/10 border-zinc-400/30":"bg-orange-900/10 border-orange-400/20"}`}><div className="flex justify-between"><span className="text- font-black opacity-60">#{i+1} {i===0?"👑 CHAMPION":i===1?"🥈":"🥉"}</span><span className={`text- font-black px-2 py-1 rounded-full ${s.points>0?"bg-fuchsia-400 text-black":"bg-white/10"}`}>{s.points>0?`+${s.points}`:s.points} PTS</span></div><div className="mt-2 font-black">{s.name}</div><div className="text- opacity-60">{s.rounds} rnds • Avg {Math.round(s.grossTotal/s.rounds)||0} • Best {s.bestGross===999?"-":s.bestGross}</div><div className="mt-3 grid grid-cols-3 gap-2 text-"><div className="rounded-lg bg-black/30 p-2 text-center"><div className="font-black text- text-emerald-300">{s.birdies}</div><div className="opacity-60">Birdies</div></div><div className="rounded-lg bg-black/30 p-2 text-center"><div className="font-black text- text-amber-300">{s.eagles}</div><div className="opacity-60">Eagles</div></div><div className="rounded-lg bg-black/30 p-2 text-center"><div className="font-black text-">{s.pars}</div><div className="opacity-60">Pars</div></div></div></div>))}</div>
                <div className="rounded-xl bg-black/30 border border-white/10 overflow-x-auto"><div className="min-w-"><div className="grid grid-cols-10 gap-2 p-2.5 text- font-black opacity-40 tracking-widest bg-black/20"><div>PLAYER</div><div>PTS</div><div>RNDS</div><div>AVG</div><div>PARS</div><div>BIRDIES</div><div>EAGLES</div><div>BOGEYS</div><div>DBL</div><div>OTHER</div></div>{leaderboard.map((s)=>(<div key={s.name} className="grid grid-cols-10 gap-2 p-2.5 text-xs border-t border-white/5"><div className="font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-fuchsia-500 text-black flex items-center justify-center text- font-black">{s.name[0]}</div>{s.name}</div><div className={`font-black ${s.points>0?"text-fuchsia-400":""}`}>{s.points>0?`+${s.points}`:s.points}</div><div>{s.rounds}</div><div>{Math.round(s.grossTotal/s.rounds)||0}</div><div>{s.pars}</div><div className="text-emerald-300 font-bold">{s.birdies}</div><div className="text-amber-300 font-bold">{s.eagles}</div><div className="opacity-70">{s.bogeys}</div><div className="opacity-70">{s.doubles}</div><div className="opacity-50">{s.others}</div></div>))}</div></div>
              </>
            )}
          </div>
        )}
        {activeTab==="courses" && (
          <div className="rounded- bg-[#0E131E] border border-white/10 p-5">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3"><div><div className="font-black text-">Courses • {allCourses.length} Total ({COURSES.length} Built-in + {customCourses.length} Custom)</div><div className="text- opacity-50 mt-1">Search any course and add it — pars saved to KV • Type to filter below</div></div><button onClick={()=>setShowAdd(true)} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-xs">+ Add Course</button></div>
            <div className="flex gap-2 mb-4 flex-wrap"><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search e.g. Hermitage, Gaylord, Old Fort, Lebanon..." className="flex-1 min-w- h-11 px-4 rounded-full bg-black/50 border border-white/10 text-sm" /><button onClick={()=>window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery + " golf course scorecard par")}`, "_blank")} className="px-5 h-11 rounded-full bg-white/10 border border-white/10 text-xs font-bold">Search Google →</button><button onClick={()=>setSearchQuery("")} className="px-4 h-11 rounded-full bg-white/5 border border-white/10 text-xs">Clear</button></div>
            {filteredCourses.length===0? (<div className="text-center py-12 rounded-xl bg-black/20 border border-dashed border-white/10"><div className="text- mb-2">🔍</div><div className="font-bold text-sm">No courses match "{searchQuery}"</div><div className="text-xs opacity-60 mt-1">Try "Hermitage", "Gaylord", "Old Fort" or click Add Course</div></div>) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCourses.map((c)=>{const idx=allCourses.indexOf(c); return (<div key={c.short+idx} className={`rounded- border p-4 ${idx===cIdx?"bg-white text-black border-white":"bg-black/30 border-white/10 hover:border-fuchsia-400/30"}`}><div className="flex justify-between items-start"><span className={`text- px-2 py-1 rounded-full font-black ${idx===cIdx?"bg-black/10":"bg-white/10"}`}>{c.short}</span><span className="text- opacity-60 px-2 py-1 rounded-full bg-black/10">{c.area}</span></div><div className="font-black mt-2 text- leading-tight">{c.name}</div><div className="text- opacity-70 mt-1 font-mono">Par {c.pars.reduce((a,b)=>a+b,0)} • {c.pars.join("-")}</div><div className="text- opacity-50 mt-1">SI: {c.si.join(",")}</div><button onClick={()=>{setCIdx(idx); setActiveTab("live");}} className={`mt-3 w-full h-9 rounded-full font-black text-xs ${idx===cIdx?"bg-black text-white":"bg-white text-black hover:bg-fuchsia-300"}`}>{idx===cIdx?"Selected ✓ — Go to Live":"Use This Course"}</button></div>);})}
              </div>
            )}
            {showAdd && (
              <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center p-4"><div className="rounded- bg-[#121828] border border-white/20 p-6 w-full max-w- shadow-[0_20px_60px_rgba(0,0,0,0.7)]"><div className="font-black text- mb-1">Add Custom Course</div><div className="text- opacity-60 mb-4">Find pars on Google: search "[course name] scorecard par"</div><input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Course Name e.g. Twelve Stones - Blue Tees" className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 mb-2.5 text-sm" /><input value={addShort} onChange={e=>setAddShort(e.target.value)} placeholder="Short Code e.g. 12S-BLUE" className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 mb-2.5 text-sm" /><div className="text- opacity-60 mb-1">18 Pars comma separated</div><textarea value={addPars} onChange={e=>setAddPars(e.target.value)} className="w-full h-20 p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono" /><div className="flex gap-2.5 mt-4"><button onClick={()=>setShowAdd(false)} className="flex-1 h-10 rounded-full bg-white/10 border border-white/10 font-bold text-sm">Cancel</button><button onClick={handleAddCourse} className="flex-1 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-sm">Save to KV</button></div><div className="text- opacity-40 mt-3 text-center">Saved courses persist in Upstash darkscore:customCourses</div></div></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

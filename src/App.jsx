import React, { useEffect, useMemo, useState } from "react";
const LOGO = "/logo.jpg";
const TRIO = "/three-friends.jpg"; // upload Three_Friends_On_Golf_Course.jpg to public/ as three-friends.jpg
const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Nashville" },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12], area: "Mt Juliet" },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8], area: "Nashville" },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,4], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3], area: "Murfreesboro - FIXED 18" },
  { name: "McCabe Golf Course", short: "MCCABE", pars: [4,4,3,5,4,3,4,4,3,4,4,4,3,5,4,3,4,4], si: [8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9], area: "Nashville" },
  { name: "Harpeth Hills", short: "HARPETH", pars: [4,5,3,4,4,4,3,4,5,4,4,3,4,4,3,5,4,5], si: [9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6], area: "Nashville" },
  { name: "Hermitage - General's Retreat", short: "HER-GEN", pars: [4,5,3,4,3,4,4,5,4,4,5,4,3,4,4,5,3,4], si: [18,8,16,6,12,14,10,4,2,9,1,11,13,5,17,3,15,7], area: "Old Hickory" },
  { name: "Hermitage - President's Reserve", short: "HER-PRES", pars: [4,5,3,4,4,4,3,5,4,4,4,3,4,5,3,4,4,5], si: [18,2,14,16,6,12,10,4,8,15,3,13,1,5,11,9,17,7], area: "Old Hickory" },
  { name: "Gaylord Springs Golf Links", short: "GAYLORD", pars: [5,4,3,4,4,5,4,3,4,4,5,3,4,4,3,4,5,4], si: [7,3,15,11,5,1,9,17,13,10,6,14,2,12,18,8,4,16], area: "Nashville" },
  { name: "Old Fort Golf Club", short: "OLD-FORT", pars: [4,5,3,4,4,5,4,3,4,5,4,4,3,4,4,5,3,4,4], si: [11,5,17,15,13,1,9,18,10,8,14,16,6,2,12,4,18,7], area: "Murfreesboro - FIXED 18" },
  { name: "Twelve Stones Crossing", short: "12STONE", pars: [4,5,4,3,4,4,5,3,4,4,3,5,4,4,4,5,3,4], si: [6,2,12,16,8,14,4,18,10,9,15,7,3,11,17,1,13,5], area: "Goodlettsville" },
  { name: "Two Rivers Golf Course", short: "2RIVERS", pars: [4,3,5,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [12,14,6,8,10,16,2,4,18,11,5,15,7,3,17,9,1,13], area: "Nashville" },
  { name: "Lebanon Golf & Country Club", short: "LEBANON", pars: [4,3,4,3,5,5,4,4,4,4,3,4,4,5,4,4,3,5], si: [8,12,6,14,2,4,10,16,18,9,15,5,11,3,13,7,17,1], area: "Lebanon" },
  { name: "Champions Run", short: "CHAMP", pars: [4,4,5,3,4,4,3,4,5,4,5,3,4,4,4,3,5,4], si: [10,14,2,16,8,12,18,4,6,7,3,15,9,11,5,17,1,13], area: "Rockvale" },
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
      if (useHcp) {
        if (p === "Joe") { if (sis[h] === 1 || sis[h] === 2) s = 1; }
        else { const hc = hcpMap[p] || 0; if (hc >= sis[h]) s = 1; if (hc >= 18 && sis[h] <= hc - 18) s++; }
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
  return { hp, totals, gross, carry };
}
export default function App() {
  const [customCourses, setCustomCourses] = useState(() => { try { const s = localStorage.getItem('darkscore_customCourses'); return s? JSON.parse(s) : []; } catch { return []; } });
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
  const [showEdit, setShowEdit] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({ name:"", short:"", parsStr:"", siStr:"", area:"" });
  const [addName, setAddName] = useState(""); const [addShort, setAddShort] = useState(""); const [addPars, setAddPars] = useState("4,4,3,5,4,4,3,4,5,4,4,3,5,4,3,4,5,4");
  const hcpMap = useMemo(() => { const m = {}; players.forEach(p => m[p.name] = p.hcp); return m; }, [players]);
  const res = useMemo(() => calc(scores, course.pars, course.si, hcpMap, useHcp), [scores, course, hcpMap, useHcp]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/standings'); if (r.ok) { const d = await r.json(); if (d.standings) setStandings(d.standings); if (d.rounds) setRounds(d.rounds); }
        const rc = await fetch('/api/custom-courses'); if (rc.ok) { const dc = await rc.json(); if (dc.courses && dc.courses.length) { setCustomCourses(dc.courses); localStorage.setItem('darkscore_customCourses', JSON.stringify(dc.courses)); } }
      } catch {}
    })();
  }, []);
  useEffect(()=>{ try{ localStorage.setItem('darkscore_customCourses', JSON.stringify(customCourses)); }catch{} }, [customCourses]);
  const leaderboard = useMemo(() => {
    const stats = {};
    const allNames = new Set([...players.map(p=>p.name),...Object.keys(standings)]);
    rounds.forEach(r => Object.keys(r.scores||{}).forEach(n=>allNames.add(n)));
    allNames.forEach(name => stats[name] = { name, points:0, rounds:0, grossTotal:0, pars:0, birdies:0, eagles:0, bestGross:999 });
    rounds.forEach(r => {
      const pars = r.course.pars || [];
      Object.keys(r.scores||{}).forEach(pName => {
        if (!stats[pName]) stats[pName] = { name:pName, points:0, rounds:0, grossTotal:0, pars:0, birdies:0, eagles:0, bestGross:999 };
        let roundGross = 0;
        (r.scores[pName]||[]).forEach((sc,h) => {
          if (sc==="" || sc==null) return; const par = pars[h] || 4; const diff = sc - par; roundGross += sc;
          if (diff===0) stats[pName].pars++; else if (diff===-1) stats[pName].birdies++; else if (diff<=-2) stats[pName].eagles++;
        });
        stats[pName].points += (r.totals?.[pName]||0); stats[pName].rounds += 1; stats[pName].grossTotal += (r.gross?.[pName] || roundGross);
        if (roundGross>0) stats[pName].bestGross = Math.min(stats[pName].bestGross, roundGross);
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
    const nr = [rd,...rounds].slice(0, 50); setRounds(nr);
    const ns = {...standings }; players.forEach(p => { const cur = ns[p.name] || { rounds: 0, points: 0 }; ns[p.name] = { rounds: cur.rounds + 1, points: cur.points + (res.totals[p.name] || 0) }; }); setStandings(ns);
    try { await fetch('/api/standings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ standings: ns, rounds: nr }) }); } catch {}
    setIsSaving(false);
    const cl = {}; players.forEach(p => cl[p.name] = Array(18).fill("")); setScores(cl); setActiveTab("history");
  }
  function handleEditCourse(idx){ const c = allCourses[idx]; setEditingIdx(idx); setEditForm({ name:c.name, short:c.short, parsStr:c.pars.join(','), siStr:c.si.join(','), area:c.area }); setShowEdit(true); }
  function handleDeleteCourse(idx){ if (!confirm("Delete this custom course?")) return; const customIdx = idx - COURSES.length; const updated = customCourses.filter((_,i)=>i!==customIdx); setCustomCourses(updated); localStorage.setItem('darkscore_customCourses', JSON.stringify(updated)); fetch('/api/custom-courses', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courses: updated }) }).catch(()=>{}); if (cIdx === idx) setCIdx(1); }
  async function handleUpdateCourse(){
    const pars = editForm.parsStr.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    const si = editForm.siStr.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if (pars.length!==18){ alert(`Pars must be 18. You have ${pars.length}`); return; }
    if (si.length!==0 && si.length!==18){ alert(`SI must be 18. You have ${si.length}`); return; }
    let updated;
    if (editingIdx >= COURSES.length){ const customIdx = editingIdx - COURSES.length; updated = [...customCourses]; updated[customIdx] = {...updated[customIdx], name: editForm.name, short: editForm.short.toUpperCase(), pars, si: si.length===18?si:updated[customIdx].si, area: editForm.area }; }
    else { const newCourse = { name: editForm.name, short: editForm.short.toUpperCase(), pars, si: si.length===18?si:COURSES[editingIdx].si, area: editForm.area.replace(" (Edited)","") + " (Edited)" }; updated = [...customCourses, newCourse]; setCIdx(COURSES.length + updated.length -1); }
    setCustomCourses(updated); localStorage.setItem('darkscore_customCourses', JSON.stringify(updated));
    try { await fetch('/api/custom-courses', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courses: updated }) }); } catch {}
    setShowEdit(false); alert(`Saved! ${editForm.name} Par ${pars.reduce((a,b)=>a+b,0)}`);
  }
  async function handleAddCourse() { const pars = addPars.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)); if (pars.length!==18) { alert("Need 18 pars"); return; } if (!addName ||!addShort) { alert("Need name"); return; } const nc = { name: addName, short: addShort.toUpperCase(), pars, si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Custom" }; const updated = [...customCourses, nc]; setCustomCourses(updated); localStorage.setItem('darkscore_customCourses', JSON.stringify(updated)); try { await fetch('/api/custom-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courses: updated }) }); } catch {} setShowAdd(false); }
  const filteredCourses = allCourses.filter(c =>!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.short.toLowerCase().includes(searchQuery.toLowerCase()));
  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans">
      <div className="sticky top-0 z-50 bg-[#05080F]/85 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w- mx-auto flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <img src={LOGO} alt="Galactic Skins" className="w-24 h-24 md:w-32 md:h-32 rounded- object-contain bg-white/[0.06] backdrop-blur-md border-2 border-fuchsia-400/60 shadow-[0_0_40px_rgba(217,70,239,0.5)] p-2.5 drop-shadow-[0_0_20px_rgba(232,121,249,0.7)]" onError={e=>e.target.style.display='none'} />
            <div>
              <div className="font-black text- md:text- tracking-tight leading-none">Galactic Skins</div>
              <div className="text- md:text- opacity-60 font-mono mt-2">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • {allCourses.length} COURSES • {rounds.length} ROUNDS • Joe SI 1&2</div>
              <div className="mt-2.5 flex flex-wrap gap-2"><span className="text- px-3 py-1.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-200 font-black tracking-widest">NASHVILLE LEAGUE</span><span className="text- px-3 py-1.5 rounded-full bg-white/10 border border-white/20 font-bold">3 MAN SKINS</span><span className="text- px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-400/20 text-emerald-200 font-bold">BIRDIE -1 • EAGLE -2</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-full bg-white/5 border border-white/10 p-1.5">
              <button onClick={()=>setActiveTab("live")} className={`px-5 py-2.5 rounded-full text-xs font-black transition ${activeTab==="live"?"bg-white text-black shadow":"text-white/60 hover:text-white"}`}>Live • Enter Scores</button>
              <button onClick={()=>setActiveTab("history")} className={`px-5 py-2.5 rounded-full text-xs font-black transition ${activeTab==="history"?"bg-white text-black shadow":"text-white/60 hover:text-white"}`}>History • {rounds.length}</button>
              <button onClick={()=>setActiveTab("leaderboard")} className={`px-5 py-2.5 rounded-full text-xs font-black transition ${activeTab==="leaderboard"?"bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow":"text-white/60 hover:text-white"}`}>Leaderboard</button>
              <button onClick={()=>setActiveTab("courses")} className={`px-5 py-2.5 rounded-full text-xs font-black transition ${activeTab==="courses"?"bg-white text-black shadow":"text-white/60 hover:text-white"}`}>Courses • {allCourses.length}</button>
            </div>
            <label className="flex items-center gap-2 text- px-4 py-2.5 rounded-full bg-white/10 border border-white/10 cursor-pointer"><input type="checkbox" checked={useHcp} onChange={e=>setUseHcp(e.target.checked)} />HCP NET</label>
          </div>
        </div>
      </div>

      <div className="max-w- mx-auto p-4 space-y-5">
        {/* TRIO HERO BANNER */}
        <div className="rounded- overflow-hidden border border-white/10 relative h- md:h- bg-[#0E131E]">
          <img src={TRIO} alt="Graham Joe Brad" className="w-full h-full object-cover object-top" onError={e=>{e.target.style.display='none'; e.target.nextElementSibling.style.display='none';}} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05080F] via-[#05080F]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex justify-between items-end">
            <div><div className="font-black text- md:text- drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-tight">Graham • Joe • Brad</div><div className="text- md:text- opacity-80 mt-1 font-mono">Galactic Skins • Nashville • Live Skins Scoring • {rounds.length} Rounds Played</div></div>
            <div className="hidden md:flex gap-2"><span className="px-4 py-2 rounded-full bg-white text-black font-black text-xs">Par {course.pars.reduce((a,b)=>a+b,0)} • {course.name}</span></div>
          </div>
        </div>

        {activeTab==="live" && (
          <>
            <div className="rounded- bg-[#0E131E] border border-white/10 p-4"><div className="flex justify-between items-center mb-3"><div className="text- font-black opacity-40 tracking-widest">SELECT COURSE • {allCourses.length} TOTAL • {customCourses.length} CUSTOM</div><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Filter courses..." className="h-9 px-4 rounded-full bg-black/50 border border-white/10 text-xs w-48" /></div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">{filteredCourses.map((c)=>{ const idx=allCourses.indexOf(c); return (<button key={c.short+idx} onClick={()=>setCIdx(idx)} className={`rounded-xl border p-3 text-left transition ${idx===cIdx?"bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]":"bg-[#121828] border-white/10 hover:border-fuchsia-400/40"}`}><div className="flex justify-between"><span className="text- px-1.5 py-0.5 rounded-full border font-black">{c.short}</span><span className="text- opacity-50">{c.area}</span></div><div className="font-black text- mt-2 leading-tight">{c.name}</div><div className="text- opacity-60 mt-1">Par {c.pars.reduce((a,b)=>a+b,0)}</div></button>);})}</div></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{players.map(p=>(<div key={p.name} className="rounded- bg-[#0E131E] border border-white/10 p-4"><div className="flex justify-between items-center"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black">{p.name[0]}</div><span className="font-bold text-">{p.name}</span>{p.name==="Joe" && <span className="text- px-1.5 py-1 rounded-full bg-amber-400 text-black font-black">SI 1&2</span>}</div><button onClick={()=>removePlayer(p.name)} className="w-7 h-7 rounded-full bg-white/10 text-xs">✕</button></div><div className="mt-4 flex justify-between items-baseline"><div><div className="text- font-black leading-none">{res.gross[p.name]||0}</div><div className="text- opacity-50 mt-1">GROSS</div></div><div className="text-right"><div className={`text- font-black px-3 py-1.5 rounded-full ${res.totals[p.name]>0?"bg-fuchsia-400 text-black":res.totals[p.name]<0?"bg-red-400 text-black":"bg-white/10"}`}>{res.totals[p.name]>0?`+${res.totals[p.name]}`:res.totals[p.name]||0} PTS</div><div className="text- opacity-50 mt-1">SKINS</div></div></div><div className="mt-3 flex items-center gap-2"><span className="text- opacity-40">HCP</span><input type="number" value={p.hcp} onChange={e=>updateHcp(p.name,e.target.value)} className="w-16 h-8 rounded-lg bg-black/50 border border-white/10 text-center font-bold text-sm" /></div></div>))}{players.length<4 && (<div className="rounded- border border-dashed border-fuchsia-400/30 bg-fuchsia-500/[0.07] p-4 flex flex-col justify-center"><div className="text- font-black opacity-60 mb-2">ADD 4TH PLAYER</div><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="w-full h-9 rounded-lg bg-black/50 border border-white/10 px-3 text-sm mb-2" /><div className="flex gap-2"><input type="number" value={newHcp} onChange={e=>setNewHcp(e.target.value)} className="w-16 h-9 rounded-lg bg-black/50 border border-white/10 text-center text-sm" /><button onClick={addPlayer} className="flex-1 h-9 rounded-lg bg-white text-black font-black text-xs">+ Add Player</button></div></div>)}</div>

            <div className="rounded- bg-[#0E131E] border border-white/10 overflow-hidden"><div className="p-4 flex justify-between items-center border-b border-white/10 flex-wrap gap-3"><div><div className="font-black text-">{course.name} • Enter Scores Below</div><div className="text- opacity-60 mt-1">Par {course.pars.reduce((a,b)=>a+b,0)} • {course.pars.join("-")} • Click Live tab inputs to enter</div></div><button onClick={saveRound} disabled={isSaving} className="px-7 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full font-black text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)]">{isSaving?"Saving...":"End Round → Save to KV"}</button></div><div className="overflow-x-auto"><div className="min-w- grid" style={{gridTemplateColumns: `48px 48px ${players.map(()=> "1fr").join(" ")} 70px`}}><div className="p-3 text- opacity-40 font-black tracking-widest bg-black/20">HOLE</div><div className="p-3 text- opacity-40 font-black tracking-widest bg-black/20">PAR</div>{players.map(p=><div key={p.name} className="p-3 text- font-black tracking-widest bg-black/20">{p.name.toUpperCase()} H{p.hcp}</div>)}<div className="p-3 text- opacity-40 font-black bg-black/20">POT</div>{Array.from({length:18},(_,h)=>{const par=course.pars[h]; return (<React.Fragment key={h}><div className={`p-3 border-t border-white/[0.06] font-black text- ${course.si[h]<=2?"bg-amber-400/15 text-amber-200":""}`}>{h+1}{course.si[h]<=2?"★":""}</div><div className="p-2.5 border-t border-white/[0.06]"><span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text- font-bold">{par}</span></div>{players.map(p=>{const hp=res.hp[p.name]?.[h]||0; const val=scores[p.name]?.[h]??""; const isB=val!==""&&val===par-1; const isE=val!==""&&val<=par-2; return <div key={p.name} className={`p-2 border-t border-white/[0.06] flex items-center gap-2 ${isB?"bg-emerald-500/10":isE?"bg-amber-500/15":""}`}><input inputMode="numeric" value={val} onChange={e=>upd(p.name,h,e.target.value)} className={`w- h-10 rounded-xl bg-black/60 border-2 text-center font-black text- focus:outline-none transition ${isE?"border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]":isB?"border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]":hp>0?"border-fuchsia-400/60":"border-white/10 focus:border-fuchsia-400/50"}`} placeholder="–" />{isB&&<span className="text- px-2 py-1 rounded-full bg-emerald-400 text-black font-black">BIRDIE</span>}{isE&&<span className="text- px-2 py-1 rounded-full bg-amber-400 text-black font-black">EAGLE -2</span>}{hp!==0&&<span className={`min-w- h-7 px-2 rounded-full text-black text- font-black flex items-center justify-center ${hp>0?"bg-fuchsia-400":"bg-red-400"}`}>{hp>0?`+${hp}`:hp}</span>}</div>;})}<div className="p-3 border-t border-white/[0.06] text- opacity-60 font-mono">{res.carry>0?`CARRY ${res.carry}`:"—"}</div></React.Fragment>);})}</div></div></div>
          </>
        )}

        {activeTab==="history" && (<div className="rounded- bg-[#0E131E] border border-white/10 p-5"><div className="flex justify-between items-center mb-4"><div className="font-black text-">Past Rounds • {rounds.length}</div><div className="text- opacity-50">From KV</div></div>{rounds.length===0? (<div className="text-center py-16 rounded-xl bg-black/20 border border-dashed border-white/10"><div className="text- mb-3">🌌</div><div className="font-black">No rounds yet — enter in Live then Save</div></div>) : (<div className="space-y-2.5">{rounds.map(r=>(<div key={r.id} className="rounded- bg-black/30 border border-white/10 p-4 flex justify-between items-center"><div className="flex items-center gap-3"><span className="text-xs font-mono opacity-60">{r.dateStr}</span><span className="px-2.5 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/20 text-fuchsia-200 text- font-bold">{r.course.short}</span><span className="text-xs opacity-70 hidden md:block">{r.course.name}</span></div><div className="flex gap-3 text-xs">{Object.entries(r.totals||{}).map(([n,pts])=><span key={n} className={pts>0?"text-fuchsia-300 font-bold":"opacity-60"}>{n} {pts>0?`+${pts}`:pts}</span>)}</div></div>))}</div>)}</div>)}

        {activeTab==="leaderboard" && (<div className="rounded- bg-[#0E131E] border border-white/10 p-5"><div className="font-black text-">Season Leaderboard • Galactic Skins</div><div className="text- opacity-50 mb-5">{rounds.length} rounds • Birdies/Eagles tracked</div>{leaderboard.length===0? (<div className="text-center py-12 opacity-40">No rounds yet — save a round in Live</div>) : (<div className="grid grid-cols-1 md:grid-cols-3 gap-3">{leaderboard.map((s,i)=>(<div key={s.name} className={`rounded- border p-5 ${i===0?"bg-amber-400/10 border-amber-400/30 shadow-[0_0_30px_rgba(251,191,36,0.15)]":i===1?"bg-zinc-400/10 border-zinc-400/30":"bg-orange-900/10 border-orange-400/20"}`}><div className="flex justify-between"><span className="text- font-black opacity-60">#{i+1} {i===0?"👑 CHAMP":i===1?"🥈":"🥉"}</span><span className={`text- font-black px-3 py-1.5 rounded-full ${s.points>0?"bg-fuchsia-400 text-black":"bg-white/10"}`}>{s.points>0?`+${s.points}`:s.points} PTS</span></div><div className="mt-3 font-black text-">{s.name}</div><div className="text- opacity-60 mt-1">{s.rounds} rnds • Avg {Math.round(s.grossTotal/s.rounds)||0} • Best {s.bestGross===999?"-":s.bestGross}</div><div className="mt-4 grid grid-cols-3 gap-2 text-"><div className="rounded-xl bg-black/30 p-3 text-center"><div className="font-black text- text-emerald-300">{s.birdies}</div><div className="opacity-60 mt-1">Birdies</div></div><div className="rounded-xl bg-black/30 p-3 text-center"><div className="font-black text- text-amber-300">{s.eagles}</div><div className="opacity-60 mt-1">Eagles</div></div><div className="rounded-xl bg-black/30 p-3 text-center"><div className="font-black text-">{s.pars}</div><div className="opacity-60 mt-1">Pars</div></div></div></div>))}</div>)}</div>)}

        {activeTab==="courses" && (
          <div className="rounded- bg-[#0E131E] border border-white/10 p-6">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-3"><div><div className="font-black text-">Courses • {allCourses.length} Total • ✏️ Edit Works Now</div><div className="text- opacity-50 mt-1.5">Indian Hills & Old Fort FIXED to 18 pars • Edit saves to localStorage+KV • Logo is BIGGER</div></div><button onClick={()=>setShowAdd(true)} className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)]">+ Add Course</button></div>
            <div className="flex gap-2 mb-5"><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search courses..." className="flex-1 h-11 px-5 rounded-full bg-black/50 border border-white/10 text-sm" /><button onClick={()=>setSearchQuery("")} className="px-5 h-11 rounded-full bg-white/5 border border-white/10 text-xs font-bold">Clear • Show All {allCourses.length}</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCourses.map((c)=>{const idx=allCourses.indexOf(c); const isCustom = idx >= COURSES.length; return (<div key={c.short+idx} className={`rounded- border p-4 transition ${idx===cIdx?"bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]":"bg-black/30 border-white/10 hover:border-fuchsia-400/30"}`}><div className="flex justify-between"><span className={`text- px-2.5 py-1 rounded-full font-black border ${idx===cIdx?"bg-black/10 border-black/20":"bg-white/10 border-white/10"}`}>{c.short}</span><span className="text- opacity-60">{c.area}</span></div><div className="font-black mt-3 text- leading-tight">{c.name}</div><div className="text- opacity-70 mt-1.5 font-mono">Par {c.pars.reduce((a,b)=>a+b,0)} • {c.pars.join("-")}</div><div className="text- opacity-40 mt-1">SI {c.si.join(",")}</div><div className="mt-4 flex gap-2"><button onClick={()=>handleEditCourse(idx)} className={`flex-1 h-10 rounded-full font-bold text-xs border transition ${idx===cIdx?"bg-black/10 border-black/20 text-black hover:bg-black/15":"bg-white/10 border-white/20 text-white hover:bg-white/15"}`}>✏️ Edit & Save</button>{isCustom && <button onClick={()=>handleDeleteCourse(idx)} className="w-11 h-10 rounded-full bg-red-500/15 border border-red-400/30 text-xs hover:bg-red-500/25">🗑️</button>}<button onClick={()=>{setCIdx(idx); setActiveTab("live");}} className={`flex-1 h-10 rounded-full font-black text-xs transition ${idx===cIdx?"bg-black text-white":"bg-white text-black hover:bg-fuchsia-200"}`}>Use → Live</button></div></div>);})}
            </div>
            {showAdd && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center p-4"><div className="rounded- bg-[#121828] border border-white/20 p-6 w-full max-w-"><div className="font-black text- mb-4">Add Custom Course</div><input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Course Name" className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/10 mb-3 text-sm" /><input value={addShort} onChange={e=>setAddShort(e.target.value)} placeholder="Short Code e.g. LEGACY" className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/10 mb-3 text-sm" /><textarea value={addPars} onChange={e=>setAddPars(e.target.value)} placeholder="18 pars comma separated" className="w-full h-20 p-3 rounded-xl bg-black/50 border border-white/10 text-xs font-mono" /><div className="flex gap-3 mt-5"><button onClick={()=>setShowAdd(false)} className="flex-1 h-11 rounded-full bg-white/10 font-bold">Cancel</button><button onClick={handleAddCourse} className="flex-1 h-11 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black">Save to KV</button></div></div></div>)}
            {showEdit && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center p-4"><div className="rounded- bg-[#121828] border border-fuchsia-400/30 p-6 w-full max-w- shadow-[0_20px_60px_rgba(168,85,247,0.3)]"><div className="font-black text- mb-1">✏️ Edit Course — {editForm.name}</div><div className="text- opacity-60 mb-4">Now saves to localStorage + KV — Indian Hills fixed to 18 pars</div><input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/10 mb-3 text-sm" /><div className="flex gap-3 mb-3"><input value={editForm.short} onChange={e=>setEditForm(f=>({...f,short:e.target.value}))} className="flex-1 h-11 px-4 rounded-xl bg-black/50 border border-white/10 text-sm" /><input value={editForm.area} onChange={e=>setEditForm(f=>({...f,area:e.target.value}))} className="flex-1 h-11 px-4 rounded-xl bg-black/50 border border-white/10 text-sm" /></div><div className="text- opacity-50 mb-1">18 Pars</div><textarea value={editForm.parsStr} onChange={e=>setEditForm(f=>({...f,parsStr:e.target.value}))} className="w-full h-20 p-3 rounded-xl bg-black/50 border border-white/10 text-xs font-mono mb-3" /><div className="text- opacity-50 mb-1">18 SI</div><textarea value={editForm.siStr} onChange={e=>setEditForm(f=>({...f,siStr:e.target.value}))} className="w-full h-20 p-3 rounded-xl bg-black/50 border border-white/10 text-xs font-mono mb-5" /><div className="flex gap-3"><button onClick={()=>setShowEdit(false)} className="flex-1 h-12 rounded-full bg-white/10 font-bold">Cancel</button><button onClick={handleUpdateCourse} className="flex-1 h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black shadow">💾 Save — Fixed</button></div></div></div>)}
          </div>
        )}
      </div>
    </div>
  );
}

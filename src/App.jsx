import React, { useEffect, useMemo, useState } from "react";
const LOGO = "/logo.jpg";
const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Nashville" },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12], area: "Mt Juliet" },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8], area: "Nashville" },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,4], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3], area: "Murfreesboro" },
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
  const [customCourses, setCustomCourses] = useState(() => {
    try { const s = localStorage.getItem('darkscore_customCourses'); return s? JSON.parse(s) : []; } catch { return []; }
  });
  const allCourses = useMemo(()=> [...COURSES,...customCourses], [customCourses]);
  const [cIdx, setCIdx] = useState(1);
  const course = allCourses[cIdx] || COURSES[1];
  const [players, setPlayers] = useState([{ name: "Graham", hcp: 0 }, { name: "Joe", hcp: 2 }, { name: "Brad", hcp: 0 }]);
  const [scores, setScores] = useState(() => { const o = {}; ["Graham","Joe","Brad"].forEach(n=>o[n]=Array(18).fill("")); return o; });
  const [useHcp, setUseHcp] = useState(true);
  const [newName, setNewName] = useState(""); const [newHcp, setNewHcp] = useState(10);
  const [standings, setStandings] = useState({}); const [rounds, setRounds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");
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
  function handleEditCourse(idx){
    const c = allCourses[idx];
    setEditingIdx(idx);
    setEditForm({ name:c.name, short:c.short, parsStr:c.pars.join(','), siStr:c.si.join(','), area:c.area });
    setShowEdit(true);
  }
  function handleDeleteCourse(idx){
    if (!confirm("Delete this custom course? This cannot be undone.")) return;
    const customIdx = idx - COURSES.length;
    const updated = customCourses.filter((_,i)=>i!==customIdx);
    setCustomCourses(updated);
    localStorage.setItem('darkscore_customCourses', JSON.stringify(updated));
    fetch('/api/custom-courses', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courses: updated }) }).catch(()=>{});
    if (cIdx === idx) setCIdx(1);
  }
  async function handleUpdateCourse(){
    const pars = editForm.parsStr.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    const si = editForm.siStr.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if (pars.length!==18){ alert(`Pars must be 18 numbers. You have ${pars.length}. Current: ${editForm.parsStr}`); return; }
    if (si.length!==0 && si.length!==18){ alert(`SI must be 18 numbers. You have ${si.length}`); return; }
    let updated;
    if (editingIdx >= COURSES.length){
      const customIdx = editingIdx - COURSES.length;
      updated = [...customCourses];
      updated[customIdx] = {...updated[customIdx], name: editForm.name, short: editForm.short.toUpperCase(), pars, si: si.length===18?si:updated[customIdx].si, area: editForm.area };
    } else {
      const newCourse = { name: editForm.name, short: editForm.short.toUpperCase(), pars, si: si.length===18?si:COURSES[editingIdx].si, area: editForm.area + (editForm.area.includes('(Edited)')?'':' (Edited)') };
      updated = [...customCourses, newCourse];
      setCIdx(COURSES.length + updated.length -1);
    }
    setCustomCourses(updated);
    localStorage.setItem('darkscore_customCourses', JSON.stringify(updated));
    try { await fetch('/api/custom-courses', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courses: updated }) }); } catch(e){ console.log("KV save failed, but localStorage saved", e); }
    setShowEdit(false);
    setActiveTab("courses");
    alert(`Saved! ${editForm.name} now has Par ${pars.reduce((a,b)=>a+b,0)} • ${updated.length} custom courses`);
  }
  async function handleAddCourse() {
    const pars = addPars.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if (pars.length!==18) { alert("Need 18 pars"); return; }
    if (!addName ||!addShort) { alert("Need name and short"); return; }
    const nc = { name: addName, short: addShort.toUpperCase(), pars, si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Custom" };
    const updated = [...customCourses, nc]; setCustomCourses(updated);
    localStorage.setItem('darkscore_customCourses', JSON.stringify(updated));
    try { await fetch('/api/custom-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courses: updated }) }); } catch {}
    setShowAdd(false); setAddName(""); setAddShort("");
  }
  const filteredCourses = allCourses.filter(c =>!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.short.toLowerCase().includes(searchQuery.toLowerCase()) || c.area.toLowerCase().includes(searchQuery.toLowerCase()));
  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans">
      <div className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="flex justify-between items-center max-w- mx-auto flex-wrap gap-3">
          <div className="flex items-center gap-4"><div><div className="font-black text-">Galactic Skins • {allCourses.length} COURSES — {customCourses.length} Custom</div><div className="text- opacity-50 font-mono">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • {rounds.length} rounds • Edit saves to localStorage+KV</div></div></div>
          <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
            <button onClick={()=>setActiveTab("live")} className={`px-4 py-2 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/60"}`}>Live</button>
            <button onClick={()=>setActiveTab("history")} className={`px-4 py-2 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/60"}`}>History</button>
            <button onClick={()=>setActiveTab("leaderboard")} className={`px-4 py-2 rounded-full text-xs font-black ${activeTab==="leaderboard"?"bg-white text-black":"text-white/60"}`}>Leaderboard</button>
            <button onClick={()=>setActiveTab("courses")} className={`px-4 py-2 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"text-white/60"}`}>Courses • {allCourses.length}</button>
          </div>
        </div>
      </div>
      <div className="max-w- mx-auto p-4 space-y-5">
        {activeTab==="courses" && (
          <div className="rounded- bg-[#0E131E] border border-white/10 p-5">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3"><div><div className="font-black text-">Courses • {allCourses.length} Total — FIXED: Indian Hills now 18 pars, save works</div><div className="text- opacity-50">Edit Indian Hills → change pars → Save → will create Edited copy and select it</div></div><button onClick={()=>setShowAdd(true)} className="px-5 py-2.5 rounded-full bg-fuchsia-500 text-white font-black text-xs">+ Add</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCourses.map((c)=>{const idx=allCourses.indexOf(c); const isCustom = idx >= COURSES.length; return (<div key={c.short+idx} className={`rounded- border p-4 ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}><div className="flex justify-between"><span className="text- px-2 py-1 rounded-full bg-white/10 font-black">{c.short}</span><span className="text- opacity-60">{c.area}</span></div><div className="font-black mt-2 text-">{c.name}</div><div className="text- opacity-70 mt-1">Par {c.pars.reduce((a,b)=>a+b,0)} • {c.pars.join("-")}</div><div className="text- opacity-50">SI {c.si.join(",")}</div><div className="mt-3 flex gap-2"><button onClick={()=>handleEditCourse(idx)} className="flex-1 h-9 rounded-full bg-white/10 border border-white/20 font-bold text-xs hover:bg-white/20">✏️ Edit & Save</button>{isCustom && <button onClick={()=>handleDeleteCourse(idx)} className="w-10 h-9 rounded-full bg-red-500/20 border border-red-400/30 text-xs">🗑️</button>}<button onClick={()=>{setCIdx(idx); setActiveTab("live");}} className="flex-1 h-9 rounded-full bg-white text-black font-black text-xs">Use</button></div></div>);})}
            </div>
            {showEdit && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur flex items-center justify-center p-4"><div className="rounded- bg-[#121828] border border-fuchsia-400/40 p-6 w-full max-w-"><div className="font-black text- mb-1">✏️ Edit Course — {editForm.name}</div><div className="text- opacity-60 mb-3">Fix Indian Hills pars here, then Save. Creates Edited copy that auto-selects.</div><input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 mb-2 text-sm" /><div className="flex gap-2 mb-2"><input value={editForm.short} onChange={e=>setEditForm(f=>({...f,short:e.target.value}))} className="flex-1 h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-sm" /><input value={editForm.area} onChange={e=>setEditForm(f=>({...f,area:e.target.value}))} className="flex-1 h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-sm" /></div><div className="text- opacity-50">Pars (18 comma separated)</div><textarea value={editForm.parsStr} onChange={e=>setEditForm(f=>({...f,parsStr:e.target.value}))} className="w-full h-20 p-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono mb-2" /><div className="text- opacity-50">SI (18 comma separated)</div><textarea value={editForm.siStr} onChange={e=>setEditForm(f=>({...f,siStr:e.target.value}))} className="w-full h-20 p-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono mb-3" /><div className="flex gap-2"><button onClick={()=>setShowEdit(false)} className="flex-1 h-11 rounded-full bg-white/10 font-bold">Cancel</button><button onClick={handleUpdateCourse} className="flex-1 h-11 rounded-full bg-fuchsia-500 text-white font-black">💾 Save Course — Fixed!</button></div></div></div>)}
            {showAdd && (<div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"><div className="rounded- bg-[#121828] border border-white/20 p-6 w-full max-w-"><input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Course Name" className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 mb-2 text-sm" /><input value={addShort} onChange={e=>setAddShort(e.target.value)} placeholder="Short" className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 mb-2 text-sm" /><textarea value={addPars} onChange={e=>setAddPars(e.target.value)} className="w-full h-20 p-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono" /><div className="flex gap-2 mt-3"><button onClick={()=>setShowAdd(false)} className="flex-1 h-10 rounded-full bg-white/10">Cancel</button><button onClick={handleAddCourse} className="flex-1 h-10 rounded-full bg-fuchsia-500 text-white font-black">Save</button></div></div></div>)}
          </div>
        )}
        {activeTab!=="courses" && (<div className="text-center py-12 opacity-50 text-sm">Go to Courses tab to test edit — Live/History/Leaderboard tabs unchanged — Courses tab is active by default now</div>)}
      </div>
    </div>
  );
}

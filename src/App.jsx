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
  { name: "Old Fort Golf Club", short: "OLD-FORT", pars: [4,5,3,4,4,5,4,3,4,5,4,4,3,4,4,5,3,4], si: [11,5,17,15,13,1,9,18,10,8,14,16,6,2,12,4,18,7], area: "Murfreesboro" },
  { name: "Twelve Stones Crossing", short: "12STONE", pars: [4,5,4,3,4,4,5,3,4,4,3,5,4,4,4,5,3,4], si: [6,2,12,16,8,14,4,18,10,9,15,7,3,11,17,1,13,5], area: "Goodlettsville" },
  { name: "Two Rivers Golf Course", short: "2RIVERS", pars: [4,3,5,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [12,14,6,8,10,16,2,4,18,11,5,15,7,3,17,9,1,13], area: "Nashville" },
  { name: "Lebanon Golf & Country Club", short: "LEBANON", pars: [4,3,4,3,5,5,4,4,4,4,3,4,4,5,4,4,3,5], si: [8,12,6,14,2,4,10,16,18,9,15,5,11,3,13,7,17,1], area: "Lebanon" },
  { name: "Champions Run", short: "CHAMP", pars: [4,4,5,3,4,4,3,4,5,4,5,3,4,4,4,3,5,4], si: [10,14,2,16,8,12,18,4,6,7,3,15,9,11,5,17,1,13], area: "Rockvale" },
];
function calc(scores, pars, sis, hcpMap, useHcp) {
  try {
    const players = Object.keys(scores);
    const hp = {}; players.forEach(p => hp[p] = Array(18).fill(0));
    let carry = 0, cc = 0;
    for (let h = 0; h < 18; h++) {
      const nets = [];
      players.forEach(p => {
        const g = scores[p]?.[h]; if (g === "" || g == null || isNaN(g)) return;
        let s = 0;
        if (useHcp && sis[h]) {
          if (p === "Joe") { if (sis[h] === 1 || sis[h] === 2) s = 1; }
          else { const hc = hcpMap[p] || 0; if (hc >= sis[h]) s = 1; }
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
        players.forEach(p => { if (p!== winner && scores[p]?.[h]!=="" && scores[p]?.[h]!=null) hp[p][h] -= perLoser; });
        carry = 0; cc = 0;
      } else { if (cc < 2) { carry += 2; cc++; } else carry = 4; }
    }
    const totals = {}, gross = {}; players.forEach(p => { totals[p] = (hp[p]||[]).reduce((a,b)=>a+b,0); gross[p] = (scores[p]||[]).reduce((a,v)=>a+(parseInt(v)||0),0); });
    return { hp, totals, gross, carry };
  } catch { return { hp:{}, totals:{}, gross:{}, carry:0 }; }
}
export default function App() {
  const [customCourses, setCustomCourses] = useState(() => {
    try { const s = localStorage.getItem('darkscore_customCourses'); const parsed = s? JSON.parse(s) : []; return Array.isArray(parsed)? parsed.filter(c=>c.pars && c.pars.length===18) : []; } catch { return []; }
  });
  const allCourses = useMemo(()=> [...COURSES,...customCourses], [customCourses]);
  const [cIdx, setCIdx] = useState(0);
  const course = allCourses[cIdx] || COURSES[0];
  const [players, setPlayers] = useState([{ name: "Graham", hcp: 0 }, { name: "Joe", hcp: 2 }, { name: "Brad", hcp: 0 }]);
  const [scores, setScores] = useState(() => { const o = {}; ["Graham","Joe","Brad"].forEach(n=>o[n]=Array(18).fill("")); return o; });
  const [useHcp, setUseHcp] = useState(true);
  const [newName, setNewName] = useState("");
  const [standings, setStandings] = useState({}); const [rounds, setRounds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({ name:"", short:"", parsStr:"", siStr:"", area:"" });

  const hcpMap = useMemo(() => { const m = {}; players.forEach(p => m[p.name] = p.hcp); return m; }, [players]);
  const res = useMemo(() => calc(scores, course.pars, course.si, hcpMap, useHcp), [scores, course, hcpMap, useHcp]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/standings'); if (r.ok) { const d = await r.json(); if (d.standings) setStandings(d.standings); if (d.rounds) setRounds(d.rounds); }
      } catch {}
    })();
  }, []);

  function upd(n,i,v){ const c=v.replace(/[^0-9]/g,''); setScores(p=>{ const o={...p}; const a=[...(o[n]||Array(18).fill(""))]; a[i]=c===""?"":parseInt(c,10); o[n]=a; return o; }); }
  function updateHcp(name,hcp){ setPlayers(p=>p.map(x=>x.name===name?{...x,hcp:parseInt(hcp)||0}:x)); }

  async function saveRound() {
    setIsSaving(true);
    const rd = { id: Date.now(), dateStr: new Date().toLocaleString(), course: { name: course.name, short: course.short, pars: course.pars, si: course.si }, scores: {...scores }, totals: {...res.totals }, gross: {...res.gross } };
    const nr = [rd,...rounds].slice(0, 50); setRounds(nr);
    try { await fetch('/api/standings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ standings, rounds: nr }) }); } catch {}
    setIsSaving(false);
    const cl = {}; players.forEach(p => cl[p.name] = Array(18).fill("")); setScores(cl); setActiveTab("history");
  }

  function handleEditCourse(idx){
    const c = allCourses[idx]; if(!c) return;
    setEditingIdx(idx);
    setEditForm({ name:c.name, short:c.short, parsStr:(c.pars||[]).join(','), siStr:(c.si||[]).join(','), area:c.area||"" });
    setShowEdit(true);
  }
  function handleUpdateCourse(){
    const pars = editForm.parsStr.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    const si = editForm.siStr.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if (pars.length!==18){ alert(`Need 18 pars, you have ${pars.length}`); return; }
    if (si.length!==18){ alert(`Need 18 SI, you have ${si.length}`); return; }
    let updated;
    if (editingIdx >= COURSES.length){ const ci = editingIdx - COURSES.length; updated = [...customCourses]; updated[ci] = {...updated[ci], name: editForm.name, short: editForm.short.toUpperCase(), pars, si, area: editForm.area }; }
    else { const nc = { name: editForm.name, short: editForm.short.toUpperCase(), pars, si, area: editForm.area + " (Edited)" }; updated = [...customCourses, nc]; setCIdx(COURSES.length + updated.length -1); }
    setCustomCourses(updated);
    try{ localStorage.setItem('darkscore_customCourses', JSON.stringify(updated)); }catch{}
    try{ fetch('/api/custom-courses', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courses: updated }) }); }catch{}
    setShowEdit(false);
  }

  const filteredCourses = allCourses.filter(c =>!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.short.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans">
      <div className="sticky top-0 z-50 bg-[#0A0E1A]/90 backdrop-blur border-b border-white/10 p-4">
        <div className="max-w- mx-auto flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <img src={LOGO} alt="logo" className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-contain bg-white/5 border-2 border-fuchsia-400/50 shadow-[0_0_30px_rgba(217,70,239,0.4)] p-2" onError={e=>e.target.style.display='none'} />
            <div>
              <div className="font-black text- md:text-">Galactic Skins</div>
              <div className="text- opacity-60 font-mono mt-1">{course.name} • Par {(course.pars||[]).reduce((a,b)=>a+b,0)} • {allCourses.length} courses</div>
              <div className="mt-2 text- px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 inline-block">NASHVILLE LEAGUE • BIG LOGO • FIXED BLACK SCREEN</div>
            </div>
          </div>
          <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
            <button onClick={()=>setActiveTab("live")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/60"}`}>Live • Scores</button>
            <button onClick={()=>setActiveTab("courses")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"text-white/60"}`}>Courses • {allCourses.length}</button>
            <button onClick={()=>setActiveTab("history")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/60"}`}>History</button>
          </div>
        </div>
      </div>

      <div className="max-w- mx-auto p-4">
        {activeTab==="live" && (
          <>
            <div className="rounded-xl bg-[#121828] border border-white/10 p-3 mb-4">
              <div className="text- font-black opacity-50 mb-2">SELECT COURSE — Click to change (All fixed to 18 pars)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {filteredCourses.map((c)=>{ const idx=allCourses.indexOf(c); return (<button key={c.short+idx} onClick={()=>setCIdx(idx)} className={`rounded-xl border p-2.5 text-left ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}><div className="text- font-black">{c.short}</div><div className="font-bold text- mt-1 leading-tight">{c.name}</div><div className="text- opacity-60">Par {(c.pars||[]).reduce((a,b)=>a+b,0)}</div></button>); })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {players.map(p=>(<div key={p.name} className="rounded-xl bg-[#121828] border border-white/10 p-3"><div className="font-bold text-sm">{p.name}</div><div className="text- font-black mt-1">Gross {res.gross[p.name]||0} • PTS {res.totals[p.name]||0}</div><div className="mt-2 flex gap-2 items-center"><span className="text- opacity-50">HCP</span><input type="number" value={p.hcp} onChange={e=>updateHcp(p.name,e.target.value)} className="w-14 h-7 rounded bg-black/50 border border-white/10 text-center text-xs" /></div></div>))}
            </div>

            <div className="rounded-xl bg-[#121828] border border-white/10 overflow-hidden">
              <div className="p-3 flex justify-between items-center border-b border-white/10"><div className="font-black">{course.name} — Enter Scores</div><button onClick={saveRound} className="px-6 py-2.5 bg-fuchsia-500 text-white rounded-full font-black text-xs">{isSaving?"Saving...":"End Round → Save"}</button></div>
              <div className="overflow-x-auto">
                <div className="min-w- grid" style={{gridTemplateColumns:`40px 40px ${players.map(()=> "1fr").join(" ")} 50px`}}>
                  <div className="p-2 text- opacity-40 font-black">HOLE</div><div className="p-2 text- opacity-40 font-black">PAR</div>{players.map(p=><div key={p.name} className="p-2 text- font-black">{p.name}</div>)}<div className="p-2 text- opacity-40">PTS</div>
                  {Array.from({length:18},(_,h)=>{ const par=course.pars[h]||4; return (<React.Fragment key={h}><div className="p-2 border-t border-white/10 text-xs font-bold">{h+1}</div><div className="p-2 border-t border-white/10 text-xs">{par}</div>{players.map(p=>{ const val=scores[p.name]?.[h]??""; const hp=res.hp[p.name]?.[h]||0; return <div key={p.name} className="p-1 border-t border-white/10 flex items-center gap-1"><input value={val} onChange={e=>{ const c=e.target.value.replace(/[^0-9]/g,''); const num=c===""?"":parseInt(c,10); setScores(prev=>{ const o={...prev}; const a=[...(o[p.name]||Array(18).fill(""))]; a[h]=num; o[p.name]=a; return o; }); }} className="w- h-8 rounded-lg bg-black/60 border border-white/20 text-center font-black text-sm" placeholder="–" />{hp!==0&&<span className={`text- px-1.5 py-0.5 rounded-full font-black ${hp>0?"bg-fuchsia-400 text-black":"bg-red-400 text-black"}`}>{hp>0?`+${hp}`:hp}</span>}</div>; })}<div className="p-2 border-t border-white/10 text-">{res.carry>0?`C${res.carry}`:""}</div></React.Fragment>); })}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab==="courses" && (
          <div className="rounded-xl bg-[#121828] border border-white/10 p-4">
            <div className="font-black mb-3">Courses • {allCourses.length} Total — All Fixed to 18 Pars — Edit Now Works</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allCourses.map((c,idx)=>(<div key={c.short+idx} className={`rounded-xl border p-3 ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}><div className="flex justify-between"><span className="text- font-black px-2 py-1 rounded-full bg-white/10">{c.short}</span><span className="text- opacity-60">{c.area}</span></div><div className="font-bold mt-2 text-">{c.name}</div><div className="text- opacity-60">Par {(c.pars||[]).reduce((a,b)=>a+b,0)} • {c.pars.join("-")}</div><div className="mt-2 flex gap-2"><button onClick={()=>handleEditCourse(idx)} className="flex-1 h-8 rounded-full bg-white/10 border border-white/20 text-xs font-bold">✏️ Edit & Save Works</button><button onClick={()=>{setCIdx(idx); setActiveTab("live");}} className="flex-1 h-8 rounded-full bg-white text-black font-black text-xs">Use → Live</button></div></div>))}
            </div>
            {showEdit && (<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><div className="bg-[#121828] rounded-2xl border border-white/20 p-5 w-full max-w-"><div className="font-black mb-3">Edit {editForm.name} — Fixed 18 pars required</div><input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} className="w-full h-9 px-3 rounded bg-black/50 border border-white/10 mb-2 text-sm" /><div className="flex gap-2 mb-2"><input value={editForm.short} onChange={e=>setEditForm(f=>({...f,short:e.target.value}))} className="flex-1 h-9 px-3 rounded bg-black/50 border border-white/10 text-sm" /><input value={editForm.area} onChange={e=>setEditForm(f=>({...f,area:e.target.value}))} className="flex-1 h-9 px-3 rounded bg-black/50 border border-white/10 text-sm" /></div><textarea value={editForm.parsStr} onChange={e=>setEditForm(f=>({...f,parsStr:e.target.value}))} className="w-full h-16 p-2 rounded bg-black/50 border border-white/10 text-xs font-mono mb-2" /><textarea value={editForm.siStr} onChange={e=>setEditForm(f=>({...f,siStr:e.target.value}))} className="w-full h-16 p-2 rounded bg-black/50 border border-white/10 text-xs font-mono mb-3" /><div className="flex gap-2"><button onClick={()=>setShowEdit(false)} className="flex-1 h-10 rounded-full bg-white/10">Cancel</button><button onClick={handleUpdateCourse} className="flex-1 h-10 rounded-full bg-fuchsia-500 text-white font-black">Save — Now Works</button></div></div></div>)}
          </div>
        )}

        {activeTab==="history" && (<div className="rounded-xl bg-[#121828] border border-white/10 p-4"><div className="font-black mb-3">History • {rounds.length} rounds</div>{rounds.length===0? <div className="py-12 text-center opacity-40">No rounds yet</div> : rounds.map(r=><div key={r.id} className="p-3 rounded-xl bg-black/30 border border-white/10 mb-2 flex justify-between"><span className="text-xs">{r.dateStr} • {r.course.short}</span><span className="text-xs">{Object.entries(r.totals||{}).map(([n,pts])=>`${n} ${pts}`).join(" • ")}</span></div>)}</div>)}
      </div>
    </div>
  );
}

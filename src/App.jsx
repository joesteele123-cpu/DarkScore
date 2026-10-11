import React, { useEffect, useMemo, useState } from "react";
const LOGO = "/logo.jpg";

const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Nashville" },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12], area: "Mt Juliet" },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8], area: "Nashville" },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,4], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3], area: "Murfreesboro" },
  { name: "McCabe Golf Course", short: "MCCABE", pars: [4,4,3,5,4,3,4,4,3,4,4,4,3,5,4,3,4,4], si: [8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9], area: "Nashville" },
  { name: "Harpeth Hills", short: "HARPETH", pars: [4,5,3,4,4,4,3,4,5,4,4,3,4,4,3,5,4,5], si: [9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6], area: "Nashville" },
  { name: "Hermitage General", short: "HER-GEN", pars: [4,5,3,4,3,4,4,5,4,4,5,4,3,4,4,5,3,4], si: [18,8,16,6,12,14,10,4,2,9,1,11,13,5,17,3,15,7], area: "Old Hickory" },
  { name: "Hermitage President", short: "HER-PRE", pars: [4,5,3,4,4,4,3,5,4,4,4,3,4,5,3,4,4,5], si: [18,2,14,16,6,12,10,4,8,15,3,13,1,5,11,9,17,7], area: "Old Hickory" },
  { name: "Gaylord Springs", short: "GAYLORD", pars: [5,4,3,4,4,5,4,3,4,4,5,3,4,4,3,4,5,4], si: [7,3,15,11,5,1,9,17,13,10,6,14,2,12,18,8,4,16], area: "Nashville" },
  { name: "Old Fort Golf Club", short: "OLD-FORT", pars: [4,5,3,4,4,5,4,3,4,5,4,4,3,4,4,5,3,4], si: [11,5,17,15,13,1,9,18,10,8,14,16,6,2,12,4,18,7], area: "Murfreesboro" },
  { name: "Twelve Stones", short: "12STONE", pars: [4,5,4,3,4,4,5,3,4,4,3,5,4,4,4,5,3,4], si: [6,2,12,16,8,14,4,18,10,9,15,7,3,11,17,1,13,5], area: "Goodlettsville" },
  { name: "Two Rivers", short: "2RIVERS", pars: [4,3,5,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [12,14,6,8,10,16,2,4,18,11,5,15,7,3,17,9,1,13], area: "Nashville" },
  { name: "Lebanon Golf", short: "LEBANON", pars: [4,3,4,3,5,5,4,4,4,4,3,4,4,5,4,4,3,5], si: [8,12,6,14,2,4,10,16,18,9,15,5,11,3,13,7,17,1], area: "Lebanon" },
  { name: "Champions Run", short: "CHAMP", pars: [4,4,5,3,4,4,3,4,5,4,5,3,4,4,4,3,5,4], si: [10,14,2,16,8,12,18,4,6,7,3,15,9,11,5,17,1,13], area: "Rockvale" },
];

function getRoundStats(scores, pars) {
  const stats = {};
  Object.keys(scores || {}).forEach(p => {
    let parsC = 0, birdies = 0, doubleBogeys = 0, eagles = 0, bogeys = 0;
    (scores[p] || []).forEach((sc, h) => {
      if (sc === "" || sc == null) return;
      const par = pars[h] || 4;
      const diff = sc - par;
      if (diff === 0) parsC++;
      else if (diff === -1) birdies++;
      else if (diff <= -2) eagles++;
      else if (diff === 1) bogeys++;
      else if (diff >= 2) doubleBogeys++;
    });
    stats[p] = { parsC, birdies, doubleBogeys, eagles, bogeys };
  });
  return stats;
}

function calc(scores, pars, sis, hcpMap, useHcp) {
  try {
    if (!pars || pars.length!== 18) return { hp:{}, totals:{}, gross:{}, carry:0, tieBreak:null };
    const players = Object.keys(scores || {}).filter(p => (scores[p]||[]).some(v=>v!=="" && v!=null));
    const hp = {}; players.forEach(p => hp[p] = Array(18).fill(0));
    let carry = 0, cc = 0, tieBreak = null;
    for (let h = 0; h < 18; h++) {
      const nets = [];
      players.forEach(p => {
        const g = scores[p]?.[h]; if (g === "" || g == null) return;
        let s = 0;
        if (useHcp && sis[h]) {
          if (p === "Joe") { if (sis[h] === 1 || sis[h] === 2) s = 1; }
          else { const hc = hcpMap[p] || 0; if (hc >= sis[h]) s = 1; if (hc >= 18 && sis[h] <= hc - 18) s++; }
        }
        nets.push({ p, net: g - s, gross: g });
      });
      if (!nets.length) continue;
      const min = Math.min(...nets.map(x => x.net));
      const winners = nets.filter(x => x.net === min);
      if (winners.length === 1) {
        const perLoser = Math.min(2 + carry, 6);
        const winner = winners[0].p;
        hp[winner][h] += perLoser * (players.length - 1);
        players.forEach(p => { if (p!== winner && scores[p]?.[h]!== "" && scores[p]?.[h]!= null) hp[p][h] -= perLoser; });
        carry = 0; cc = 0;
      } else {
        if (h === 17 && carry >= 0) {
          // LAST HOLE TIE BREAKER: most pars -> most birdies -> least double bogeys
          const stats = getRoundStats(scores, pars);
          const ranked = [...players].sort((a,b) => {
            const sa = stats[a] || {parsC:0,birdies:0,doubleBogeys:99};
            const sb = stats[b] || {parsC:0,birdies:0,doubleBogeys:99};
            if (sb.parsC!== sa.parsC) return sb.parsC - sa.parsC;
            if (sb.birdies!== sa.birdies) return sb.birdies - sa.birdies;
            if (sa.doubleBogeys!== sb.doubleBogeys) return sa.doubleBogeys - sb.doubleBogeys;
            return 0;
          });
          const winner = ranked[0];
          const perLoser = Math.min(2 + carry, 6);
          hp[winner][h] += perLoser * (players.length - 1);
          players.forEach(p => { if (p!== winner && scores[p]?.[h]!== "" && scores[p]?.[h]!= null) hp[p][h] -= perLoser; });
          tieBreak = { winner, stats, ranked, reason: `Last hole tie • ${winner} wins tie breaker: ${stats[winner].parsC} pars, ${stats[winner].birdies} birdies, ${stats[winner].doubleBogeys} double bogeys` };
          carry = 0; cc = 0;
        } else {
          if (cc < 2) { carry += 2; cc++; } else carry = 4;
        }
      }
    }
    for (let h = 0; h < 18; h++) {
      const bm = [], em = [];
      players.forEach(p => { const g = scores[p]?.[h]; if (g === "" || g == null) return; if (g === pars[h] - 1) bm.push(p); else if (g <= pars[h] - 2) em.push(p); });
      bm.forEach(m => { const o = players.filter(p => p!== m && scores[p]?.[h]!=="" && scores[p]?.[h]!=null); hp[m][h] += 2 * o.length; o.forEach(x => hp[x][h] -= 2); });
      em.forEach(m => { const o = players.filter(p => p!== m && scores[p]?.[h]!=="" && scores[p]?.[h]!=null); hp[m][h] += 5 * o.length; o.forEach(x => hp[x][h] -= 5); });
    }
    const totals = {}, gross = {}; players.forEach(p => { totals[p] = (hp[p]||[]).reduce((a,b)=>a+b,0); gross[p] = (scores[p]||[]).reduce((a,v)=>a+(parseInt(v)||0),0); });
    return { hp, totals, gross, carry, tieBreak };
  } catch { return { hp:{}, totals:{}, gross:{}, carry:0, tieBreak:null }; }
}

export default function App() {
  const [customCourses, setCustomCourses] = useState(() => {
    try { const s = localStorage.getItem("darkscore_customCourses"); const p = s? JSON.parse(s) : []; return Array.isArray(p)? p.filter(c=>c && Array.isArray(c.pars) && c.pars.length===18) : []; } catch { return []; }
  });
  const allCourses = useMemo(() => [...COURSES,...customCourses], [customCourses]);
  const [cIdx, setCIdx] = useState(0);
  const course = allCourses[cIdx] || COURSES[0];
  const [players, setPlayers] = useState([{ name:"Graham", hcp:0 }, { name:"Joe", hcp:2 }, { name:"Brad", hcp:0 }]);
  const [scores, setScores] = useState(() => { const o={}; ["Graham","Joe","Brad"].forEach(n=>o[n]=Array(18).fill("")); return o; });
  const [rounds, setRounds] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [showEdit, setShowEdit] = useState(false); const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({ name:"", short:"", parsStr:"", siStr:"", area:"" });
  const [newName, setNewName] = useState(""); const [isSaving, setIsSaving] = useState(false);
  const hcpMap = useMemo(() => { const m={}; players.forEach(p=>m[p.name]=p.hcp); return m; }, [players]);
  const res = useMemo(() => calc(scores, course.pars, course.si, hcpMap, true), [scores, course, hcpMap]);
  const roundStats = useMemo(() => getRoundStats(scores, course.pars), [scores, course]);

  useEffect(() => {
    (async () => {
      try { const r=await fetch("/api/standings"); if(r.ok){ const d=await r.json(); const good=Array.isArray(d.rounds)? d.rounds.filter(x=>x && x.course && x.course.pars && x.course.pars.length===18):[]; setRounds(good); } } catch {}
      try { const rc=await fetch("/api/custom-courses"); if(rc.ok){ const dc=await rc.json(); if(Array.isArray(dc.courses)){ const good=dc.courses.filter(c=>c && c.pars && c.pars.length===18); setCustomCourses(good); } } } catch {}
    })();
  }, []);

  function upd(name, i, v){ const c=v.replace(/[^0-9]/g,""); setScores(prev=>{ const o={...prev}; const a=[...(o[name]||Array(18).fill(""))]; a[i]=c===""?"":parseInt(c,10); o[name]=a; return o; }); }

  return (
    <div className="min-h-screen bg-[#05080F] text-white font-sans">
      <div className="sticky top-0 z-50 bg-[#0A0E1A]/90 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w- mx-auto flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <img src={LOGO} alt="logo" className="w-20 h-20 md:w-28 md:h-28 rounded- object-contain bg-white/[0.06] border-2 border-fuchsia-400/60 shadow-[0_0_35px_rgba(217,70,239,0.45)] p-2.5" onError={e=>e.target.style.display="none"} />
            <div>
              <div className="font-black text- md:text- tracking-tight">Galactic Skins • BIG LOGO</div>
              <div className="text- opacity-60 font-mono mt-1">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • {allCourses.length} courses • Last hole tie breaker: Most Pars → Birdies → Least Doubles</div>
              {res.tieBreak && <div className="mt-2 text- px-3 py-1.5 rounded-full bg-amber-400 text-black font-black animate-pulse">🏆 TIE BREAKER: {res.tieBreak.reason}</div>}
            </div>
          </div>
          <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
            <button onClick={()=>setActiveTab("live")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/60"}`}>Live</button>
            <button onClick={()=>setActiveTab("courses")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"text-white/60"}`}>Courses {allCourses.length}</button>
            <button onClick={()=>setActiveTab("history")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/60"}`}>History {rounds.length}</button>
          </div>
        </div>
      </div>

      <div className="max-w- mx-auto p-4 space-y-4">
        {activeTab==="live" && (
          <>
            <div className="rounded- bg-[#121828] border border-white/10 p-4">
              <div className="text- font-black opacity-40 mb-2">SELECT COURSE • TIE BREAKER ON 18: Most Pars → Birdies → Least Double Bogeys</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {allCourses.map((c, idx)=>(
                  <button key={c.short+idx} onClick={()=>setCIdx(idx)} className={`rounded-xl border p-2.5 text-left ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}>
                    <div className="text- font-black">{c.short}</div>
                    <div className="text- font-bold leading-tight">{c.name}</div>
                    <div className="text- opacity-60">Par {c.pars.reduce((a,b)=>a+b,0)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {Object.keys(scores).map(pName=>{
                const st = roundStats[pName] || {parsC:0,birdies:0,doubleBogeys:0};
                return (
                  <div key={pName} className="rounded- bg-[#121828] border border-white/10 p-4">
                    <div className="flex justify-between"><span className="font-black">{pName}</span><span className={`text-xs px-2.5 py-1 rounded-full font-black ${res.totals[pName]>0?"bg-fuchsia-400 text-black":"bg-white/10"}`}>{res.totals[pName]>0?`+${res.totals[pName]}`:res.totals[pName]||0} PTS</span></div>
                    <div className="mt-2 text- font-black">Gross {res.gross[pName]||0}</div>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <span className="text- px-2 py-1 rounded-full bg-white/10 border border-white/10">{st.parsC} Pars</span>
                      <span className="text- px-2 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/20 text-emerald-200">{st.birdies} Birdies</span>
                      <span className="text- px-2 py-1 rounded-full bg-red-400/15 border border-red-400/20 text-red-200">{st.doubleBogeys} Doubles</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded- bg-[#121828] border border-white/10 overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-white/10 flex-wrap gap-3">
                <div>
                  <div className="font-black text-">{course.name} • Enter Scores • Tie Breaker on 18 if Tied</div>
                  <div className="text- opacity-60 mt-1">If hole 18 ties, winner = most pars → most birdies → least double bogeys • Carry {res.carry? `${res.carry} points` : "0"}</div>
                </div>
                <button onClick={async()=>{ setIsSaving(true); const rd={id:Date.now(),dateStr:new Date().toLocaleString(),course:{name:course.name,short:course.short,pars:course.pars,si:course.si},scores:{...scores},totals:{...res.totals},gross:{...res.gross}, tieBreak:res.tieBreak||null}; const nr=[rd,...rounds]; setRounds(nr); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:nr})}); }catch{} setIsSaving(false); const cl={}; Object.keys(scores).forEach(k=>cl[k]=Array(18).fill("")); setScores(cl); setActiveTab("history"); }} className="px-6 py-2.5 bg-fuchsia-500 text-white rounded-full font-black text-xs">{isSaving?"Saving...":"End Round → Save"}</button>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w- grid" style={{gridTemplateColumns:"44px 44px repeat(3,1fr) 60px"}}>
                  <div className="p-2.5 text- opacity-40 font-black">HOLE</div>
                  <div className="p-2.5 text- opacity-40 font-black">PAR</div>
                  {Object.keys(scores).map(p=><div key={p} className="p-2.5 text- font-black">{p.toUpperCase()}</div>)}
                  <div className="p-2.5 text- opacity-40 font-black">POT</div>
                  {Array.from({length:18},(_,h)=>{
                    const par=course.pars[h]; const isLast=h===17;
                    return (
                      <React.Fragment key={h}>
                        <div className={`p-2.5 border-t border-white/10 text-xs font-black ${isLast?"bg-amber-400/20 text-amber-200":""}`}>{h+1}{isLast?"★":""}</div>
                        <div className="p-2.5 border-t border-white/10"><span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{par}</span></div>
                        {Object.keys(scores).map(pn=>{
                          const v=scores[pn]?.[h]??""; const hp=res.hp[pn]?.[h]||0;
                          const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isDouble=v!==""&&v>=par+2;
                          return (
                            <div key={pn} className={`p-1.5 border-t border-white/10 flex items-center gap-1.5 ${isLast?"bg-amber-500/5":""} ${isBirdie?"bg-emerald-500/10":isPar?"bg-white/5":isDouble?"bg-red-500/10":""}`}>
                              <input value={v} onChange={e=>upd(pn,h,e.target.value)} className={`w- h-9 rounded-xl bg-black/60 border-2 text-center font-black text- ${isBirdie?"border-emerald-400":isPar?"border-white/30":isDouble?"border-red-400/50":"border-white/15"}`} placeholder="-" />
                              {isPar&&<span className="text- px-1.5 py-0.5 rounded-full bg-white/20 font-bold">PAR</span>}
                              {isBirdie&&<span className="text- px-1.5 py-0.5 rounded-full bg-emerald-400 text-black font-black">BIRDIE</span>}
                              {hp!==0&&<span className={`text- px-1.5 py-0.5 rounded-full font-black ${hp>0?"bg-fuchsia-400 text-black":"bg-red-400 text-black"}`}>{hp>0?`+${hp}`:hp}</span>}
                            </div>
                          );
                        })}
                        <div className="p-2.5 border-t border-white/10 text- font-mono opacity-60">{res.carry>0 &&!isLast? `+${res.carry}` : isLast && res.tieBreak? "TB" : ""}</div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              {res.tieBreak && <div className="p-3 bg-amber-400 text-black font-bold text-xs text-center">🏆 Last Hole Tied — Tie Breaker Applied: {res.tieBreak.reason} — Winner gets pot</div>}
            </div>
          </>
        )}

        {activeTab==="history" && (
          <div className="rounded-xl bg-[#121828] border border-white/10 p-4">
            <div className="font-black mb-3">History • {rounds.length} rounds • Last hole tie breaker tracked</div>
            {rounds.length===0? <div className="py-12 text-center opacity-40">No rounds yet</div> : rounds.map(r=>(
              <div key={r.id} className="p-3 rounded-xl bg-black/30 border border-white/10 mb-2 flex justify-between items-center">
                <div><div className="text-xs font-mono opacity-60">{r.dateStr} • {r.course?.short} {r.tieBreak? `• TB: ${r.tieBreak.winner}`:""}</div><div className="text-xs mt-1">{Object.entries(r.totals||{}).map(([n,pts])=>`${n} ${pts}`).join(" • ")}</div></div>
                <button onClick={()=>{ const upd=rounds.filter(x=>x.id!==r.id); setRounds(upd); fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:upd})}); }} className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-">Delete</button>
              </div>
            ))}
          </div>
        )}

        {activeTab==="courses" && (
          <div className="rounded-xl bg-[#121828] border border-white/10 p-4">
            <div className="font-black mb-3">Courses • {allCourses.length} • Edit Works • Big Logo</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allCourses.map((c, idx)=>(
                <div key={c.short+idx} className={`rounded-xl border p-3 ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}>
                  <div className="flex justify-between"><span className="text- font-black px-2 py-1 rounded-full bg-white/10">{c.short}</span><span className="text- opacity-60">{c.area}</span></div>
                  <div className="font-bold mt-2 text-">{c.name}</div>
                  <div className="text- opacity-60">Par {c.pars.reduce((a,b)=>a+b,0)}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={()=>{ setEditingIdx(idx); setEditForm({name:c.name,short:c.short,parsStr:c.pars.join(","),siStr:c.si.join(","),area:c.area}); setShowEdit(true); }} className="flex-1 h-8 rounded-full bg-white/10 border border-white/20 text-xs font-bold">✏️ Edit</button>
                    <button onClick={()=>setCIdx(idx)} className="flex-1 h-8 rounded-full bg-white text-black font-black text-xs">Use</button>
                  </div>
                </div>
              ))}
            </div>
            {showEdit && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-[#121828] rounded-2xl border border-white/20 p-5 w-full max-w-">
                  <div className="font-black mb-3">Edit {editForm.name}</div>
                  <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} className="w-full h-9 px-3 rounded bg-black/50 border border-white/10 mb-2 text-sm" />
                  <div className="flex gap-2 mb-2"><input value={editForm.short} onChange={e=>setEditForm(f=>({...f,short:e.target.value}))} className="flex-1 h-9 px-3 rounded bg-black/50 border border-white/10 text-sm" /><input value={editForm.area} onChange={e=>setEditForm(f=>({...f,area:e.target.value}))} className="flex-1 h-9 px-3 rounded bg-black/50 border border-white/10 text-sm" /></div>
                  <textarea value={editForm.parsStr} onChange={e=>setEditForm(f=>({...f,parsStr:e.target.value}))} className="w-full h-16 p-2 rounded bg-black/50 border border-white/10 text-xs font-mono mb-2" />
                  <textarea value={editForm.siStr} onChange={e=>setEditForm(f=>({...f,siStr:e.target.value}))} className="w-full h-16 p-2 rounded bg-black/50 border border-white/10 text-xs font-mono mb-3" />
                  <div className="flex gap-2"><button onClick={()=>setShowEdit(false)} className="flex-1 h-10 rounded-full bg-white/10">Cancel</button><button onClick={async()=>{ const pars=editForm.parsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)); const si=editForm.siStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)); if(pars.length!==18){ alert(`Need 18 pars have ${pars.length}`); return; } if(si.length!==18){ alert(`Need 18 SI have ${si.length}`); return; } let upd; if(editingIdx>=COURSES.length){ const ci=editingIdx-COURSES.length; upd=[...customCourses]; upd[ci]={...upd[ci],name:editForm.name,short:editForm.short.toUpperCase(),pars,si,area:editForm.area}; } else { upd=[...customCourses,{name:editForm.name,short:editForm.short.toUpperCase(),pars,si,area:editForm.area+" (Edited)"}]; setCIdx(COURSES.length+upd.length-1); } setCustomCourses(upd); localStorage.setItem("darkscore_customCourses",JSON.stringify(upd)); try{ await fetch("/api/custom-courses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({courses:upd})}); }catch{} setShowEdit(false); }} className="flex-1 h-10 rounded-full bg-fuchsia-500 text-white font-black">Save Fixed</button></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
    if (!pars || pars.length!== 18) return { hp:{}, totals:{}, gross:{}, carry:0 };
    const players = Object.keys(scores || {});
    const hp = {}; players.forEach(p => hp[p] = Array(18).fill(0));
    let carry = 0, cc = 0;
    for (let h = 0; h < 18; h++) {
      const nets = [];
      players.forEach(p => {
        const g = scores[p]?.[h]; if (g === "" || g == null || isNaN(g)) return;
        let s = 0; if (useHcp && sis[h]) { if (p==="Joe" && (sis[h]===1||sis[h]===2)) s=1; else { const hc=hcpMap[p]||0; if(hc>=sis[h]) s=1; } }
        nets.push({ p, net: g-s });
      });
      if (!nets.length) continue;
      const min = Math.min(...nets.map(x=>x.net));
      const winners = nets.filter(x=>x.net===min);
      if (winners.length===1){ const perLoser=Math.min(2+carry,6); const w=winners[0].p; hp[w][h]+=perLoser*(players.length-1); players.forEach(p=>{ if(p!==w && scores[p]?.[h]!=="" && scores[p]?.[h]!=null) hp[p][h]-=perLoser; }); carry=0; cc=0; }
      else { if(cc<2){ carry+=2; cc++; } else carry=4; }
    }
    const totals={}, gross={}; players.forEach(p=>{ totals[p]=(hp[p]||[]).reduce((a,b)=>a+b,0); gross[p]=(scores[p]||[]).reduce((a,v)=>a+(parseInt(v)||0),0); });
    return { hp, totals, gross, carry };
  } catch { return { hp:{}, totals:{}, gross:{}, carry:0 }; }
}
export default function App() {
  const [customCourses, setCustomCourses] = useState(() => {
    try { const s=localStorage.getItem('darkscore_customCourses'); const p=s?JSON.parse(s):[]; return Array.isArray(p)? p.filter(c=>c && Array.isArray(c.pars) && c.pars.length===18 && Array.isArray(c.si) && c.si.length===18) : []; } catch { return []; }
  });
  const allCourses = useMemo(()=> [...COURSES,...customCourses], [customCourses]);
  const [cIdx, setCIdx] = useState(0);
  const course = allCourses[cIdx] || COURSES[0];
  const [players, setPlayers] = useState([{name:"Graham",hcp:0},{name:"Joe",hcp:2},{name:"Brad",hcp:0}]);
  const [scores, setScores] = useState(()=>{ const o={}; ["Graham","Joe","Brad"].forEach(n=>o[n]=Array(18).fill("")); return o; });
  const [rounds, setRounds] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [showEdit, setShowEdit] = useState(false); const [editingIdx, setEditingIdx]=useState(null);
  const [editForm, setEditForm]=useState({name:"",short:"",parsStr:"",siStr:"",area:""});
  const [isSaving,setIsSaving]=useState(false);
  const hcpMap = useMemo(()=>{ const m={}; players.forEach(p=>m[p.name]=p.hcp); return m; },[players]);
  const res = useMemo(()=>calc(scores,course.pars,course.si,hcpMap,true),[scores,course,hcpMap]);

  useEffect(()=>{
    (async()=>{
      try{
        const r=await fetch('/api/standings'); if(r.ok){ const d=await r.json();
          let filteredRounds = Array.isArray(d.rounds)? d.rounds.filter(r=>r && r.course && Array.isArray(r.course.pars) && r.course.pars.length===18) : [];
          setRounds(filteredRounds);
        }
        const rc=await fetch('/api/custom-courses'); if(rc.ok){ const dc=await rc.json(); if(Array.isArray(dc.courses)){ const good=dc.courses.filter(c=>c && Array.isArray(c.pars) && c.pars.length===18); setCustomCourses(good); localStorage.setItem('darkscore_customCourses', JSON.stringify(good)); } }
      }catch{}
    })();
  },[]);

  function handleEditCourse(idx){ const c=allCourses[idx]; setEditingIdx(idx); setEditForm({name:c.name,short:c.short,parsStr:c.pars.join(','),siStr:c.si.join(','),area:c.area}); setShowEdit(true); }
  async function handleUpdateCourse(){
    const pars=editForm.parsStr.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    const si=editForm.siStr.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if(pars.length!==18){ alert(`Need 18 pars, have ${pars.length}`); return; }
    if(si.length!==18){ alert(`Need 18 SI, have ${si.length}`); return; }
    let updated; if(editingIdx>=COURSES.length){ const ci=editingIdx-COURSES.length; updated=[...customCourses]; updated[ci]={...updated[ci],name:editForm.name,short:editForm.short.toUpperCase(),pars,si,area:editForm.area}; } else { updated=[...customCourses,{name:editForm.name,short:editForm.short.toUpperCase(),pars,si,area:editForm.area+" (Edited)"}]; setCIdx(COURSES.length+updated.length-1); }
    setCustomCourses(updated); localStorage.setItem('darkscore_customCourses', JSON.stringify(updated));
    try{ await fetch('/api/custom-courses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({courses:updated})}); }catch{}
    setShowEdit(false);
  }
  async function handleDeletePastRound(id){
    if(!confirm("Delete this past round? This fixes broken records.")) return;
    const updated = rounds.filter(r=>r.id!==id);
    setRounds(updated);
    try{ await fetch('/api/standings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rounds:updated, standings:{}})}); }catch{}
    localStorage.removeItem('darkscore_rounds');
  }

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <div className="sticky top-0 z-50 bg-[#0A0E1A]/90 backdrop-blur border-b border-white/10 p-4">
        <div className="max-w- mx-auto flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <img src={LOGO} alt="" className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-contain bg-white/5 border-2 border-fuchsia-400/50 shadow-[0_0_30px_rgba(217,70,239,0.4)] p-2" onError={e=>e.target.style.display='none'} />
            <div><div className="font-black text-">Galactic Skins • BIG LOGO • FIXED</div><div className="text- opacity-60">Par {(course.pars||[]).reduce((a,b)=>a+b,0)} • {allCourses.length} courses • {rounds.length} rounds • Past record delete safe</div></div>
          </div>
          <div className="flex rounded-full bg-white/5

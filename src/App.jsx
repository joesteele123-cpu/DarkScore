import React, { useEffect, useMemo, useState, useRef } from "react";
const DEFAULT_LOGO = "/logo.jpg";
const DEFAULT_TITLE = "Galactic Skins";
const DEFAULT_PLAYERS = [
  { name: "Joe", hcp: 2, scores: Array(18).fill("") },
  { name: "Brad", hcp: 0, scores: Array(18).fill("") },
  { name: "Graham", hcp: 0, scores: Array(18).fill("") },
];
const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Nashville" },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12], area: "Mt Juliet" },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8], area: "Nashville" },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,4], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3], area: "Murfreesboro" },
  { name: "McCabe Golf Course", short: "MCCABE", pars: [4,4,3,5,4,3,4,4,3,4,4,4,3,5,4,3,4,4], si: [8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9], area: "Nashville" },
  { name: "Harpeth Hills", short: "HARPETH", pars: [4,5,3,4,4,4,3,4,5,4,4,3,4,5,4,4,3,4,4,5], si: [9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6], area: "Nashville" },
  { name: "Hermitage General", short: "HER-GEN", pars: [4,5,3,4,3,4,4,5,4,4,5,4,3,4,4,5,3,4], si: [18,8,16,6,12,14,10,4,2,9,1,11,13,5,17,3,15,7], area: "Old Hickory" },
  { name: "Hermitage President", short: "HER-PRE", pars: [4,5,3,4,4,4,3,5,4,4,4,3,4,5,3,4,4,5], si: [18,2,14,16,6,12,10,4,8,15,3,13,1,5,11,9,17,7], area: "Old Hickory" },
  { name: "Gaylord Springs", short: "GAYLORD", pars: [5,4,3,4,4,5,4,3,4,4,5,3,4,4,3,4,5,4], si: [7,3,15,11,5,1,9,17,13,10,6,14,2,12,18,8,4,16], area: "Nashville" },
  { name: "Old Fort Golf Club", short: "OLD-FORT", pars: [4,5,3,4,4,5,4,3,4,5,4,4,3,4,4,5,3,4], si: [11,5,17,15,13,1,9,18,10,8,14,16,6,2,12,4,18,7], area: "Murfreesboro" },
  { name: "Twelve Stones", short: "12STONE", pars: [4,5,4,3,4,4,5,3,4,4,3,5,4,4,4,5,3,4], si: [6,2,12,16,8,14,4,18,10,9,15,7,3,11,17,1,13,5], area: "Goodlettsville" },
  { name: "Two Rivers", short: "2RIVERS", pars: [4,3,5,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [12,14,6,8,10,16,2,4,18,11,5,15,7,3,17,9,1,13], area: "Nashville" },
  { name: "Lebanon Golf", short: "LEBANON", pars: [4,3,4,3,5,5,4,4,4,4,3,4,4,5,4,4,3,5], si: [8,12,6,14,2,4,10,16,18,9,15,5,11,3,13,7,17,1], area: "Lebanon" },
  { name: "Champions Run", short: "CHAMP", pars: [4,4,5,3,4,4,3,4,5,4,5,3,4,4,4,3,5,4], si: [10,14,2,16,8,12,18,4,6,7,3,15,9,11,5,17,1,13], area: "Rockvale" },
];
const DEFAULT_SETTINGS = { baseHolePoints: 2, maxPerLoser: 6, birdiePoints: 2, eaglePoints: 5, carryIncrement: 2, maxCarries: 2, carryCap: 4 };

function getStats(arr, pars){
  let parsC=0,birdies=0,eagles=0,bogeys=0,doubleBogeys=0,gross=0,count=0;
  (arr||[]).forEach((sc,h)=>{ if(sc===""||sc==null) return; const p=pars[h]||4; const s=parseInt(sc)||0; gross+=s; count++; const d=s-p; if(d===0) parsC++; else if(d===-1) birdies++; else if(d<=-2) eagles++; else if(d===1) bogeys++; else if(d>=2) doubleBogeys++; });
  return {parsC,birdies,eagles,bogeys,doubleBogeys,gross,count};
}

function calc(players, pars, sis, settings){
  const S=settings||DEFAULT_SETTINGS;
  try{
    if(!pars||pars.length!==18||!sis||sis.length!==18) return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null};
    const hp={}; players.forEach(p=>hp[p.name]=Array(18).fill(0));
    let carry=0, cc=0, tieBreak=null;
    const hcpMap={}; players.forEach(p=>hcpMap[p.name]=Number(p.hcp)||0);
    for(let h=0;h<18;h++){
      const nets=[]; players.forEach(p=>{
        const g=p.scores?.[h]; if(g===""||g==null) return;
        let s=0; const si=sis[h];
        if(si && (hcpMap[p.name]||0) >= si) s=1;
        nets.push({p:p.name, net:g-s});
      });
      if(!nets.length) continue;
      const min=Math.min(...nets.map(x=>x.net)); const winners=nets.filter(x=>x.net===min);
      if(winners.length===1){
        const perLoser=Math.min(S.baseHolePoints+carry, S.maxPerLoser); const w=winners[0].p;
        hp[w][h]+=perLoser*(players.length-1); players.forEach(pl=>{ if(pl.name!==w && pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; });
        carry=0; cc=0;
      } else {
        if(h===17){
          const stats={}; players.forEach(p=>stats[p.name]=getStats(p.scores,pars));
          let rem=[...players].filter(p=>p.scores.some(v=>v!==""&&v!=null)); if(!rem.length) rem=[...players];
          const maxPars=Math.max(0,...rem.map(p=>stats[p.name]?.parsC||0)); rem=rem.filter(p=>(stats[p.name]?.parsC||0)===maxPars);
          let reason=`most pars ${maxPars}`;
          if(rem.length>1){ const maxBird=Math.max(0,...rem.map(p=>stats[p.name]?.birdies||0)); rem=rem.filter(p=>(stats[p.name]?.birdies||0)===maxBird); reason=`${maxPars} pars tie → most birdies ${maxBird}`; if(rem.length>1){ const minDbl=Math.min(99,...rem.map(p=>stats[p.name]?.doubleBogeys??99)); rem=rem.filter(p=>(stats[p.name]?.doubleBogeys??99)===minDbl); reason=`${maxPars} pars tie → ${maxBird} birdies tie → least doubles ${minDbl}`; } }
          const winner=rem[0]?.name||players[0]?.name; if(winner){ const perLoser=Math.min(S.baseHolePoints+carry, S.maxPerLoser); hp[winner][h]+=perLoser*(players.length-1); players.forEach(pl=>{ if(pl.name!==winner&&pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; }); tieBreak={winner,reason,stats}; }
          carry=0; cc=0;
        } else { if(cc<S.maxCarries){ carry+=S.carryIncrement; cc++; } else carry=S.carryCap; }
      }
    }
    for(let h=0;h<18;h++){
      const par=pars[h]||4;
      const birdiers=players.filter(p=>{ const g=p.scores?.[h]; return g!==""&&g!=null&&g===par-1; }).map(p=>p.name);
      const eaglers=players.filter(p=>{ const g=p.scores?.[h]; return g!==""&&g!=null&&g<=par-2; }).map(p=>p.name);
      birdiers.forEach(m=>{ const opps=players.filter(p=>p.name!==m && p.scores?.[h]!==""&&p.scores[h]!=null && p.scores[h]>par-1); if(!opps.length) return; hp[m][h]+=S.birdiePoints*opps.length; opps.forEach(o=>hp[o.name][h]-=S.birdiePoints); });
      eaglers.forEach(m=>{ const opps=players.filter(p=>p.name!==m && p.scores?.[h]!==""&&p.scores[h]!=null && p.scores[h]>par-2); if(!opps.length) return; hp[m][h]+=S.eaglePoints*opps.length; opps.forEach(o=>hp[o.name][h]-=S.eaglePoints); });
    }
    const totals={},gross={},running={};
    players.forEach(p=>{ const gArr=(p.scores||[]).map(v=>parseInt(v)||0); gross[p.name]=gArr.reduce((a,b)=>a+b,0); totals[p.name]=(hp[p.name]||[]).reduce((a,b)=>a+b,0); let run=0; running[p.name]=(hp[p.name]||[]).map(v=>{ run+=Number(v)||0; return run; }); });
    return {hp,totals,gross,running,carry,tieBreak};
  }catch(e){ return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null}; }
}

export default function App(){
  const [logoSrc,setLogoSrc]=useState(()=>{ try{ return localStorage.getItem("darkscore_logo")||DEFAULT_LOGO; }catch{ return DEFAULT_LOGO; } });
  const [appTitle,setAppTitle]=useState(()=>{ try{ return localStorage.getItem("darkscore_title")||DEFAULT_TITLE; }catch{ return DEFAULT_TITLE; } });
  const fileInputRef=useRef(null);
  const [customCourses,setCustomCourses]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_customCourses"); const p=s?JSON.parse(s):[]; return Array.isArray(p)?p.filter(c=>c&&c.pars&&c.pars.length===18):[]; }catch{ return []; } });
  const [settings,setSettings]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_settings"); return s?{...DEFAULT_SETTINGS,...JSON.parse(s)}:DEFAULT_SETTINGS; }catch{ return DEFAULT_SETTINGS; } });
  const allCourses=useMemo(()=>[...COURSES,...customCourses],[customCourses]);
  const [cIdx,setCIdx]=useState(0); const course=allCourses[cIdx]||COURSES[0];
  const [players,setPlayers]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_players_v2"); if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>=2) return p.map(pl=>({name:pl.name, hcp:pl.hcp||0, scores: Array.isArray(pl.scores)&&pl.scores.length===18?pl.scores:Array(18).fill("")})); } }catch{} return DEFAULT_PLAYERS; });
  const [rounds,setRounds]=useState([]); const [activeTab,setActiveTab]=useState("live");
  const [activeHole,setActiveHole]=useState(0);
  const [showEdit,setShowEdit]=useState(false); const [editingIdx,setEditingIdx]=useState(null);
  const [editForm,setEditForm]=useState({name:"",short:"",parsStr:"",siStr:"",area:""});
  const [newName,setNewName]=useState(""); const [newHcp,setNewHcp]=useState(2);
  const [sortKey,setSortKey]=useState("points");

  const res=useMemo(()=>calc(players,course.pars,course.si,settings),[players,course.pars,course.si,settings]);

  useEffect(()=>{ localStorage.setItem("darkscore_settings",JSON.stringify(settings)); },[settings]);
  useEffect(()=>{ localStorage.setItem("darkscore_players_v2",JSON.stringify(players.map(p=>({name:p.name,hcp:p.hcp,scores:p.scores})))); },[players]);
  useEffect(()=>{ localStorage.setItem("darkscore_title",appTitle); },[appTitle]);
  useEffect(()=>{(async()=>{
    try{ const r=await fetch("/api/standings"); if(r.ok){ const d=await r.json(); const arr=Array.isArray(d)?d:(Array.isArray(d.rounds)?d.rounds:[]); setRounds(arr); } }catch{}
  })();},[]);

  function handleLogoClick(){ fileInputRef.current?.click(); }
  function handleLogoUpload(e){
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader(); reader.onload=(ev)=>{ const dataUrl=ev.target.result; setLogoSrc(dataUrl); try{ localStorage.setItem("darkscore_logo",dataUrl); }catch{} }; reader.readAsDataURL(file); e.target.value="";
  }

  function upd(name,h,raw){
    let num; if(typeof raw==="number"){ num=raw; } else { const clean=String(raw).replace(/[^0-9]/g,""); num=clean===""?"":parseInt(clean,10); }
    if(num!=="" && (num<1 || num>12)) return;
    setPlayers(prev=>prev.map(p=>{ if(p.name!==name) return p; const ns=[...p.scores]; ns[h]=num; return {...p,scores:ns}; }));
  }
  function addPlayer(){ const n=newName.trim(); if(!n||players.length>=4||players.find(p=>p.name===n)) return; setPlayers(prev=>[...prev,{name:n,hcp:parseInt(newHcp)||0,scores:Array(18).fill("")}]); setNewName(""); setNewHcp(2); }
  function removePlayer(name){ if(players.length<=2) return; setPlayers(prev=>prev.filter(p=>p.name!==name)); }
  function updateHcp(name,delta){ setPlayers(prev=>prev.map(p=>{ if(p.name!==name) return p; let nh=(parseInt(p.hcp)||0)+delta; nh=Math.max(0,Math.min(36,nh)); return {...p,hcp:nh}; })); }
  function updatePlayerName(oldName,newVal){ if(!newVal.trim()) return; if(players.find(p=>p.name===newVal.trim()&&p.name!==oldName)) return; setPlayers(prev=>prev.map(p=>p.name===oldName?{...p,name:newVal.trim()}:p)); }
  function resetPlayers(){ if(!confirm("Reset to defaults: Joe (2), Brad (0), Graham (0)? Scores will be cleared.")) return; setPlayers(DEFAULT_PLAYERS.map(p=>({...p,scores:Array(18).fill("")}))); }
  function openEditCourse(idx){ const c=allCourses[idx]; setEditingIdx(idx); setEditForm({name:c.name,short:c.short,parsStr:c.pars.join(","),siStr:c.si.join(","),area:c.area}); setShowEdit(true); }
  function openNewCourse(){ setEditingIdx(null); setEditForm({name:"New Course",short:"NEW",parsStr:"4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4",siStr:"2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11",area:"Nashville"}); setShowEdit(true); }
  function saveCourse(){
    const pars=editForm.parsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    const si=editForm.siStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if(pars.length!==18||si.length!==18){ alert(`Need 18 each`); return; }
    let upd; if(editingIdx!==null && editingIdx>=COURSES.length){ const ci=editingIdx-COURSES.length; upd=[...customCourses]; upd[ci]={...upd[ci],name:editForm.name,short:editForm.short.toUpperCase(),pars,si,area:editForm.area}; }
    else if(editingIdx!==null){ upd=[...customCourses,{name:editForm.name+" (Edited)",short:editForm.short.toUpperCase(),pars,si,area:editForm.area}]; setCIdx(COURSES.length+upd.length-1); }
    else { upd=[...customCourses,{name:editForm.name,short:editForm.short.toUpperCase(),pars,si,area:editForm.area}]; setCIdx(COURSES.length+upd.length-1); }
    setCustomCourses(upd); localStorage.setItem("darkscore_customCourses",JSON.stringify(upd)); setShowEdit(false);
  }
  function deleteCourse(idx){ if(idx<COURSES.length){ alert("Can't delete built-in"); return; } if(!confirm("Delete?")) return; const ci=idx-COURSES.length; const upd=customCourses.filter((_,i)=>i!==ci); setCustomCourses(upd); localStorage.setItem("darkscore_customCourses",JSON.stringify(upd)); setCIdx(0); }
  function updateSetting(key,delta){ setSettings(prev=>{ let v=prev[key]+delta; if(key==="baseHolePoints") v=Math.max(1,Math.min(10,v)); if(key==="maxPerLoser") v=Math.max(prev.baseHolePoints,Math.min(20,v)); if(key==="birdiePoints") v=Math.max(0,Math.min(10,v)); if(key==="eaglePoints") v=Math.max(0,Math.min(20,v)); if(key==="carryIncrement") v=Math.max(1,Math.min(5,v)); if(key==="maxCarries") v=Math.max(1,Math.min(5,v)); if(key==="carryCap") v=Math.max(0,Math.min(10,v)); return {...prev,[key]:v}; }); }

  const leaderboard = useMemo(()=>{
    const map={};
    rounds.forEach(r=>{
      const pars=r.course?.pars||COURSES.find(c=>c.short===r.course?.short)?.pars||Array(18).fill(4);
      const scoresObj=r.scores||{};
      Object.keys(scoresObj).forEach(name=>{
        const arr=scoresObj[name]||[]; const st=getStats(arr,pars);
        const pts=r.totals?.[name]||0;
        if(!map[name]) map[name]={name, rounds:0, points:0, pars:0, birdies:0, eagles:0, bogeys:0, doubles:0, gross:0, holes:0};
        map[name].rounds+=1;
        map[name].points+=pts;
        map[name].pars+=st.parsC;
        map[name].birdies+=st.birdies;
        map[name].eagles+=st.eagles;
        map[name].bogeys+=st.bogeys;
        map[name].doubles+=st.doubleBogeys;
        map[name].gross+=st.gross;
        map[name].holes+=st.count;
      });
    });
    // Add current live round if has scores
    const hasLive = players.some(p=>p.scores.some(s=>s!==""&&s!=null));
    if(hasLive){
      players.forEach(p=>{
        const st=getStats(p.scores,course.pars);
        const pts=res.totals?.[p.name]||0;
        if(!map[p.name]) map[p.name]={name:p.name, rounds:0, points:0, pars:0, birdies:0, eagles:0, bogeys:0, doubles:0, gross:0, holes:0};
        // mark as live not counted as full round for avg? We'll show live separately
      });
    }
    const list=Object.values(map);
    // sort
    const sorted=[...list].sort((a,b)=>{
      if(sortKey==="points") return b.points-a.points;
      if(sortKey==="pars") return b.pars-a.pars;
      if(sortKey==="birdies") return b.birdies-a.birdies;
      if(sortKey==="eagles") return b.eagles-a.eagles;
      if(sortKey==="bogeys") return a.bogeys-b.bogeys; // fewer bogeys better
      if(sortKey==="doubles") return a.doubles-b.doubles;
      if(sortKey==="gross") return a.gross-b.gross;
      if(sortKey==="avg") return (b.points/(b.rounds||1)) - (a.points/(a.rounds||1));
      return b.points-a.points;
    });
    return sorted;
  },[rounds,players,res.totals,course.pars,sortKey]);

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <div className="sticky top-0 z-50 bg-[#0A0E1A]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w- mx-auto p-3 md:p-4 flex items-center gap-3 md:gap-6">
          <div className="relative group cursor-pointer shrink-0" onClick={handleLogoClick}>
            <img src={logoSrc} alt="" className="w-16 h-16 md:w-40 md:h-40 rounded- md:rounded- object-cover bg-transparent border-2 border-fuchsia-400/50 shadow-[0_0_30px_rgba(217,70,239,0.4)]" onError={e=>e.target.src=DEFAULT_LOGO} />
            <div className="absolute inset-0 rounded- md:rounded- bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text- font-black text-white">📸</div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text- md:text- text-white tracking-tight">{appTitle}</div>
            <div className="mt-2 flex items-center gap-2">
              <select value={cIdx} onChange={e=>setCIdx(parseInt(e.target.value))} className="w-full max-w- h-9 md:h-10 rounded-full bg-black border border-white/30 px-3 md:px-4 text- md:text-sm font-bold text-white">
                {allCourses.map((c,idx)=><option key={c.short+idx} value={idx} className="text-black">{c.short} - {c.name} Par {c.pars.reduce((a,b)=>a+b,0)}</option>)}
              </select>
            </div>
            <div className="hidden md:flex gap-2 mt-2 text-">
              {players.map(p=>{ const pts=res.totals?.[p.name]||0; const g=res.gross?.[p.name]||0; const st=getStats(p.scores,course.pars); return <span key={p.name} className={`px-3 py-1 rounded-full border font-bold ${pts>0?"bg-fuchsia-500 text-black border-fuchsia-400":"bg-white/10 border-white/20 text-white"}`}>{p.name}: {g}/{pts>0?`+${pts}`:pts} H{p.hcp} • {st.parsC}P {st.birdies}B {st.eagles}E</span>; })}
            </div>
          </div>
          <div className="hidden xl:flex rounded-full bg-white/[0.08] border border-white/20 p-1">
            <button onClick={()=>setActiveTab("live")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/70"}`}>Live</button>
            <button onClick={()=>setActiveTab("leaderboard")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="leaderboard"?"bg-white text-black":"text-white/70"}`}>Leaderboard</button>
            <button onClick={()=>setActiveTab("players")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="players"?"bg-white text-black":"text-white/70"}`}>Players</button>
            <button onClick={()=>setActiveTab("courses")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"text-white/70"}`}>Courses</button>
            <button onClick={()=>setActiveTab("setup")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="setup"?"bg-white text-black":"text-white/70"}`}>Setup</button>
            <button onClick={()=>setActiveTab("history")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/70"}`}>History {rounds.length}</button>
          </div>
        </div>
        <div className="xl:hidden flex gap-1 px-3 pb-3 overflow-x-auto">
          <button onClick={()=>setActiveTab("live")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"bg-white/10 text-white"}`}>Live</button>
          <button onClick={()=>setActiveTab("leaderboard")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="leaderboard"?"bg-white text-black":"bg-white/10 text-white"}`}>🏆 Board</button>
          <button onClick={()=>setActiveTab("players")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="players"?"bg-white text-black":"bg-white/10 text-white"}`}>Players</button>
          <button onClick={()=>setActiveTab("courses")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"bg-white/10 text-white"}`}>Courses</button>
          <button onClick={()=>setActiveTab("setup")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="setup"?"bg-white text-black":"bg-white/10 text-white"}`}>Setup</button>
          <button onClick={()=>setActiveTab("history")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"bg-white/10 text-white"}`}>History</button>
        </div>
      </div>

      <div className="max-w- mx-auto p-3 md:p-4 space-y-4">
        {activeTab==="live" && (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {Array.from({length:18},(_,h)=>{
                const par=course.pars[h]||4; const hasScore=players.some(p=>p.scores[h]!==""&&p.scores[h]!=null);
                return (<button key={h} onClick={()=>setActiveHole(h)} className={`shrink-0 w-12 md:w-14 h-14 md:h-12 rounded-xl border-2 flex flex-col md:flex-row items-center justify-center ${activeHole===h?"bg-white text-black border-white scale-105 shadow-lg":hasScore?"bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-200":"bg-black border-white/20 text-white"}`}><span className="text- font-black">H{h+1}</span><span className="text- opacity-70 md:ml-1">P{par}</span></button>);
              })}
            </div>

            <div className="md:hidden">
              {(()=>{
                const h=activeHole; const par=course.pars[h]||4; const isLast=h===17;
                return (
                  <div className="rounded- bg-[#121828] border border-white/20 overflow-hidden">
                    <div className="p-4 flex justify-between items-center bg-black/40"><div><div className="font-black text- text-white">Hole {h+1} • Par {par} • SI {course.si[h]} {isLast?"★":""}</div><div className="text- text-white/60">Base {settings.baseHolePoints}+Carry {res.carry} • B+{settings.birdiePoints} E+{settings.eaglePoints}</div></div><div className="flex gap-2"><button onClick={()=>setActiveHole(Math.max(0,h-1))} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">‹</button><button onClick={()=>setActiveHole(Math.min(17,h+1))} className="w-10 h-10 rounded-full bg-white text-black font-black">›</button></div></div>
                    <div className="p-3 space-y-3">
                      {players.map(p=>{
                        const v=p.scores?.[h]??""; const hp=res.hp?.[p.name]?.[h]||0; const run=res.running?.[p.name]?.[h]??0; const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isEagle=v!==""&&v<=par-2; const getsStroke=p.hcp>=course.si[h];
                        return (
                          <div key={p.name} className={`rounded- border-2 p-3 flex items-center justify-between ${isEagle?"bg-amber-500/15 border-amber-400/50":isBirdie?"bg-emerald-500/15 border-emerald-400/50":isPar?"bg-white/[0.05] border-white/20":"bg-black border-white/20"}`}>
                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black">{p.name[0]}</div><div><div className="font-bold text- text-white">{p.name} <span className="text- text-white/50">H{p.hcp}{getsStroke?" *":""}</span></div><span className={`text- px-2 py-1 rounded-full font-mono font-bold ${hp>0?"bg-fuchsia-400 text-black":hp<0?"bg-red-400 text-black":"bg-white/10 text-white/70"}`}>{hp!==0?`${hp>0?`+${hp}`:hp}`:"0"} • {run>0?`+${run}`:run}</span></div></div>
                            <div className="flex items-center gap-1.5"><button onClick={()=>{ const curr=parseInt(players.find(pl=>pl.name===p.name).scores[h])||par; upd(p.name,h,Math.max(1,curr-1)); }} className="w-12 h-12 rounded-full bg-white/10 border border-white/30 text-white text- font-black">-</button><div className="w-14 h-12 rounded-xl bg-black border-2 border-white/30 flex items-center justify-center font-black text- text-white">{v===""?"-":v}</div><button onClick={()=>{ const curr=parseInt(players.find(pl=>pl.name===p.name).scores[h])||par; upd(p.name,h,Math.min(12,curr+1)); }} className="w-12 h-12 rounded-full bg-white text-black text- font-black">+</button></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="hidden md:block rounded- bg-[#121828] border border-white/20 overflow-hidden">
              <div className="p-4 bg-black/40 flex justify-between items-center"><div className="font-black text- text-white">{course.name} • Par {course.pars.reduce((a,b)=>a+b,0)} • Fair: stroke if HCP ≥ SI • Base {settings.baseHolePoints} Max {settings.maxPerLoser} • B+{settings.birdiePoints} E+{settings.eaglePoints}</div><div className="text- text-white/60">Order: {players.map(p=>`${p.name}(H${p.hcp})`).join(" → ")}</div></div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{minWidth: `${260 + players.length*230}px`}}>
                  <thead><tr className="bg-black/60 text- font-black tracking-widest text-white/60"><th className="p-3 text-left w- text-white">HOLE</th><th className="p-3 text-left w- text-white">PAR</th><th className="p-3 text-left w- text-white">SI</th>{players.map(p=><th key={p.name} className="p-3 text-left min-w- text-white">{p.name} H{p.hcp} • G:{res.gross?.[p.name]||0} P:{res.totals?.[p.name]||0}</th>)}<th className="p-3 text-left w- text-white">POT</th></tr></thead>
                  <tbody>
                    {Array.from({length:18},(_,h)=>{
                      const par=course.pars[h]||4; const isLast=h===17; const isActive=h===activeHole;
                      return (
                        <tr key={h} className={`border-t border-white/10 hover:bg-white/[0.05] ${isLast?"bg-amber-400/10":""} ${isActive?"bg-white/[0.08]":""}`}>
                          <td className="p-3 text-xs font-black text-white">{h+1}{isLast?"★":""}</td>
                          <td className="p-3"><span className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-xs font-bold text-white">{par}</span></td>
                          <td className="p-3 text- text-white/70">{course.si[h]}</td>
                          {players.map(p=>{
                            const v=p.scores?.[h]??""; const hp=res.hp?.[p.name]?.[h]||0; const run=res.running?.[p.name]?.[h]??0;
                            const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isEagle=v!==""&&v<=par-2; const getsStroke=p.hcp>=course.si[h];
                            return (
                              <td key={`${p.name}-${h}`} className={`p-2 ${isEagle?"bg-amber-500/20":isBirdie?"bg-emerald-500/20":isPar?"bg-white/[0.05]":""}`}>
                                <div className="flex items-center gap-2">
                                  <input value={v} onChange={e=>upd(p.name,h,e.target.value)} className={`w- h-10 rounded-xl bg-black border-2 text-center font-black text- text-white ${isEagle?"border-amber-400":isBirdie?"border-emerald-400":isPar?"border-white/40":"border-white/20"}`} placeholder="-" />
                                  <div className="flex flex-col gap-1">
                                    {getsStroke&&<span className="text- px-1.5 py-0.5 rounded-full bg-blue-400 text-black font-black">+1 HCP</span>}
                                    {isPar&&<span className="text- px-2 py-1 rounded-full bg-white/20 text-white font-bold">PAR</span>}
                                    {isBirdie&&<span className="text- px-2 py-1 rounded-full bg-emerald-400 text-black font-black">BIRDIE +{settings.birdiePoints}</span>}
                                    {isEagle&&<span className="text- px-2 py-1 rounded-full bg-amber-400 text-black font-black">EAGLE +{settings.eaglePoints}</span>}
                                    <span className={`text- px-2 py-1 rounded-full font-mono font-bold ${hp>0?"bg-fuchsia-400 text-black":hp<0?"bg-red-400 text-black":"bg-white/15 text-white/80"}`}>{hp!==0?`${hp>0?`+${hp}`:hp} (${run>0?`+${run}`:run})`:`(${run})`}</span>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 text- font-mono text-white/60">{isLast&&res.tieBreak?"TB":res.carry>0&&!isLast?`+${res.carry}`:""}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-black/60 border-t-2 border-fuchsia-400/30 font-black"><td className="p-4 text- text-white">TOTAL</td><td className="p-4 text- text-white">Par {course.pars.reduce((a,b)=>a+b,0)}</td><td className="p-4"></td>{players.map(p=><td key={p.name} className="p-4 text-white"><div className="text-">{res.gross?.[p.name]||0} gross</div><div className="text- mt-1 text-white/80">{res.totals?.[p.name]>0?`+${res.totals[p.name]}`:res.totals?.[p.name]||0} pts</div></td>)}<td className="p-4 text- text-white">FINAL</td></tr>
                  </tbody>
                </table>
              </div>
              {res.tieBreak && <div className="p-3 bg-amber-400 text-black font-bold text-xs text-center">🏆 Tie on 18 → {res.tieBreak.reason} → Winner: {res.tieBreak.winner}</div>}
            </div>

            <div className="flex gap-2"><button onClick={async()=>{ const playersObj={}; players.forEach(p=>playersObj[p.name]=p.scores); const rd={id:Date.now(),dateStr:new Date().toLocaleString(),course:{name:course.name,short:course.short,pars:course.pars,si:course.si},scores:playersObj,players:players.map(p=>({name:p.name,hcp:p.hcp})),totals:{...res.totals},gross:{...res.gross},tieBreak:res.tieBreak||null,settings:{...settings},title:appTitle}; const nr=[rd,...rounds]; setRounds(nr); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:nr})}); }catch{} setPlayers(prev=>prev.map(p=>({...p,scores:Array(18).fill("")}))); setActiveHole(0); setActiveTab("leaderboard"); }} className="flex-1 md:flex-none px-7 py-4 bg-fuchsia-500 text-white rounded-full font-black text-">End Round → Save & View Board</button><button onClick={()=>{ setPlayers(prev=>prev.map(p=>({...p,scores:Array(18).fill("")}))); setActiveHole(0); }} className="px-6 py-4 bg-white/10 border border-white/20 rounded-full font-black text- text-white">Clear</button></div>
          </>
        )}

        {activeTab==="leaderboard" && (
          <div className="space-y-4">
            <div className="rounded- bg-[#121828] border border-white/20 p-4 md:p-6">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div><div className="font-black text- text-white">🏆 Leaderboard • {appTitle}</div><div className="text- text-white/60 mt-1">{rounds.length} rounds • Tap column to sort • Fair HCP applied</div></div>
                <div className="flex gap-1.5 overflow-x-auto">
                  {[
                    {k:"points", l:"Points"},
                    {k:"avg", l:"Avg"},
                    {k:"birdies", l:"Birdies"},
                    {k:"eagles", l:"Eagles"},
                    {k:"pars", l:"Pars"},
                    {k:"bogeys", l:"Bogeys"},
                    {k:"doubles", l:"DBL+"},
                    {k:"gross", l:"Gross"},
                  ].map(btn=><button key={btn.k} onClick={()=>setSortKey(btn.k)} className={`shrink-0 px-3 py-2 rounded-full text- font-black border ${sortKey===btn.k?"bg-white text-black border-white":"bg-black border-white/20 text-white/70"}`}>{btn.l}</button>)}
                </div>
              </div>

              {/* CURRENT ROUND LIVE */}
              <div className="mt-5">
                <div className="font-black text- tracking-widest text-white/60 mb-2">LIVE ROUND • {course.short} Par {course.pars.reduce((a,b)=>a+b,0)}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {players.map(p=>{
                    const st=getStats(p.scores,course.pars); const pts=res.totals?.[p.name]||0; const g=res.gross?.[p.name]||0;
                    return (
                      <div key={p.name} className={`rounded- border p-3 ${pts>0?"bg-fuchsia-500/20 border-fuchsia-400/40":"bg-black border-white/20"}`}>
                        <div className="flex justify-between items-center"><span className="font-black text- text-white">{p.name} <span className="text- text-white/50">H{p.hcp}</span></span><span className={`px-3 py-1 rounded-full font-black text- ${pts>0?"bg-fuchsia-400 text-black":"bg-white/10 text-white"}`}>{pts>0?`+${pts}`:pts} PTS</span></div>
                        <div className="mt-2 flex gap-1.5 flex-wrap text-"><span className="px-2 py-1 rounded-full bg-white/10 text-white">Gross {g}</span><span className="px-2 py-1 rounded-full bg-white/10 text-white">{st.parsC} P</span><span className="px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-200">{st.birdies} B</span><span className="px-2 py-1 rounded-full bg-amber-400/20 text-amber-200">{st.eagles} E</span><span className="px-2 py-1 rounded-full bg-orange-400/15 text-white">{st.bogeys} BG</span><span className="px-2 py-1 rounded-full bg-red-500/15 text-white">{st.doubleBogeys} DBL</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ALL-TIME */}
              <div className="mt-6">
                <div className="font-black text- tracking-widest text-white/60 mb-3">ALL-TIME • {rounds.length} rounds • Sorted by {sortKey}</div>
                {leaderboard.length===0? <div className="py-12 text-center text-white/40">No rounds yet — play a round to see leaderboard</div> :
                  <div className="space-y-3">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto rounded- border border-white/10">
                      <table className="w-full border-collapse text-">
                        <thead><tr className="bg-black/60 text- tracking-widest text-white/50"><th className="p-3 text-left text-white">RANK</th><th className="p-3 text-left text-white">PLAYER</th><th className="p-3 text-center text-white">ROUNDS</th><th className="p-3 text-center text-white">POINTS</th><th className="p-3 text-center text-white">AVG</th><th className="p-3 text-center text-white">PARS</th><th className="p-3 text-center text-white">BIRDIES</th><th className="p-3 text-center text-white">EAGLES</th><th className="p-3 text-center text-white">BOGEYS</th><th className="p-3 text-center text-white">DBL+</th><th className="p-3 text-center text-white">GROSS</th></tr></thead>
                        <tbody>
                          {leaderboard.map((pl,i)=><tr key={pl.name} className={`border-t border-white/10 ${i===0?"bg-amber-400/10":""} hover:bg-white/[0.04]`}>
                            <td className="p-3 font-black text-white">{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</td>
                            <td className="p-3 font-bold text-white">{pl.name}</td>
                            <td className="p-3 text-center text-white">{pl.rounds}</td>
                            <td className="p-3 text-center font-black text-white">{pl.points>0?`+${pl.points}`:pl.points}</td>
                            <td className="p-3 text-center text-white/70">{(pl.points/(pl.rounds||1)).toFixed(1)}</td>
                            <td className="p-3 text-center text-white">{pl.pars}</td>
                            <td className="p-3 text-center text-emerald-300 font-bold">{pl.birdies}</td>
                            <td className="p-3 text-center text-amber-300 font-bold">{pl.eagles}</td>
                            <td className="p-3 text-center text-white/60">{pl.bogeys}</td>
                            <td className="p-3 text-center text-white/60">{pl.doubles}</td>
                            <td className="p-3 text-center text-white/80">{pl.gross}</td>
                          </tr>)}
                        </tbody>
                      </table>
                    </div>

                    {/* Phone cards */}
                    <div className="md:hidden grid gap-3">
                      {leaderboard.map((pl,i)=><div key={pl.name} className={`rounded- border p-4 ${i===0?"bg-amber-400/10 border-amber-400/30":i===1?"bg-white/5 border-white/20":"bg-black border-white/20"}`}>
                        <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className="text-">{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}</span><span className="font-black text- text-white">{pl.name}</span><span className="text- px-2 py-0.5 rounded-full bg-white/10 text-white/60">{pl.rounds} rnds</span></div><span className="px-3 py-1 rounded-full bg-fuchsia-500 text-black font-black text-">{pl.points>0?`+${pl.points}`:pl.points} PTS</span></div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-">
                          <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center"><div className="text- text-white/50">AVG</div><div className="font-black text-white">{(pl.points/(pl.rounds||1)).toFixed(1)}</div></div>
                          <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center"><div className="text- text-white/50">PARS</div><div className="font-black text-white">{pl.pars}</div></div>
                          <div className="rounded-xl bg-emerald-400/15 border border-emerald-400/20 p-2 text-center"><div className="text- text-emerald-200/70">BIRDIES</div><div className="font-black text-emerald-200">{pl.birdies}</div></div>
                          <div className="rounded-xl bg-amber-400/15 border border-amber-400/20 p-2 text-center"><div className="text- text-amber-200/70">EAGLES</div><div className="font-black text-amber-200">{pl.eagles}</div></div>
                          <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center"><div className="text- text-white/50">BOGEYS</div><div className="font-black text-white">{pl.bogeys}</div></div>
                          <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center"><div className="text- text-white/50">DBL+</div><div className="font-black text-white">{pl.doubles}</div></div>
                        </div>
                        <div className="mt-2 text- text-white/50 text-center">Gross {pl.gross} • {pl.holes} holes</div>
                      </div>)}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        )}

        {activeTab==="players" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4 md:p-6 space-y-5">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div><div className="font-black text- text-white">Players • Defaults: Joe, Brad, Graham • Fully Editable</div><div className="text- text-white/60 mt-1">Tap name to edit • -/+ HCP • Fair: stroke if HCP ≥ SI • Saves automatically</div></div>
              <button onClick={resetPlayers} className="px-5 h-10 rounded-full bg-white/10 border border-white/20 font-bold text-xs text-white">↺ Reset to Joe, Brad, Graham</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p,idx)=>{
                const g=res.gross?.[p.name]||0; const pts=res.totals?.[p.name]||0; const st=getStats(p.scores,course.pars);
                return (
                  <div key={p.name} className="rounded- bg-black border border-white/20 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black">{idx+1}</div><input value={p.name} onChange={e=>updatePlayerName(p.name,e.target.value)} className="bg-transparent border-b border-white/20 focus:border-fuchsia-400 outline-none font-bold text- w- pb-1 text-white" /></div>
                      <button onClick={()=>removePlayer(p.name)} className="w-9 h-9 rounded-full bg-red-500/20 border border-red-400/30 text-white">✕</button>
                    </div>
                    <div className="mt-4">
                      <div className="text- text-white/60 tracking-widest font-black mb-2">HANDICAP</div>
                      <div className="flex items-center gap-3">
                        <button onClick={()=>updateHcp(p.name,-1)} className="w-12 h-12 rounded-full bg-white/10 border border-white/20 font-black text- text-white">-</button>
                        <div className="flex-1 h-12 rounded-xl bg-black border border-white/20 flex items-center justify-center font-black text- text-white">{p.hcp}</div>
                        <button onClick={()=>updateHcp(p.name,1)} className="w-12 h-12 rounded-full bg-white text-black font-black text-">+</button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center"><div className="text- text-white/50">GROSS</div><div className="text- font-black text-white">{g}</div></div>
                      <div className={`rounded-xl border p-2 text-center ${pts>0?"bg-fuchsia-500 text-black border-fuchsia-400":"bg-white/5 border-white/10"}`}><div className={`text- ${pts>0?"text-black/70":"text-white/50"}`}>PTS</div><div className={`text- font-black ${pts>0?"text-black":"text-white"}`}>{pts>0?`+${pts}`:pts}</div></div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-2 text-center"><div className="text- text-white/50">BIRDIES</div><div className="text- font-black text-emerald-300">{st.birdies}</div></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={()=>{ if(idx===0) return; const np=[...players]; [np[idx-1],np[idx]]=[np[idx],np[idx-1]]; setPlayers(np); }} className="flex-1 h-9 rounded-full bg-white/10 border border-white/10 text- font-bold text-white" disabled={idx===0}>↑ Up</button>
                      <button onClick={()=>{ if(idx===players.length-1) return; const np=[...players]; [np[idx],np[idx+1]]=[np[idx+1],np[idx]]; setPlayers(np); }} className="flex-1 h-9 rounded-full bg-white/10 border border-white/10 text- font-bold text-white" disabled={idx===players.length-1}>↓ Down</button>
                    </div>
                  </div>
                );
              })}
              {players.length<4 && (
                <div className="rounded- border-2 border-dashed border-fuchsia-400/30 bg-fuchsia-500/[0.07] p-4 flex flex-col justify-center">
                  <div className="font-black text- mb-3 text-white">Add New Player</div>
                  <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="w-full h-12 rounded-xl bg-black border border-white/20 px-4 text- text-white placeholder:text-white/40 mb-3" />
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text- text-white/60">HCP:</span>
                    <button onClick={()=>setNewHcp(Math.max(0,newHcp-1))} className="w-11 h-11 rounded-full bg-white/10 border border-white/20 font-black text- text-white">-</button>
                    <div className="w-14 h-11 rounded-xl bg-black border border-white/20 flex items-center justify-center font-black text- text-white">{newHcp}</div>
                    <button onClick={()=>setNewHcp(Math.min(36,newHcp+1))} className="w-11 h-11 rounded-full bg-white text-black font-black text-">+</button>
                  </div>
                  <button onClick={addPlayer} className="w-full h-12 rounded-full bg-white text-black font-black">+ Add Player</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab==="setup" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div><div className="font-black text- text-white">Setup • Title, Points & Carry</div><div className="text- text-white/60 mt-1">Edit title, base win, max cap, birdie/eagle bonuses, carry logic • Saves auto</div></div>
              <button onClick={()=>{setSettings(DEFAULT_SETTINGS); setAppTitle(DEFAULT_TITLE);}} className="px-5 h-10 rounded-full bg-white/10 border border-white/20 font-bold text-xs text-white">Reset All</button>
            </div>
            <div className="rounded- bg-fuchsia-500/10 border border-fuchsia-400/20 p-4">
              <div className="font-black text- tracking-widest text-white/60 mb-3">APP TITLE • Editable</div>
              <div className="flex gap-2">
                <input value={appTitle} onChange={e=>setAppTitle(e.target.value)} placeholder="Galactic Skins" className="flex-1 h-12 rounded-xl bg-black border border-white/30 px-4 text- font-black text-white placeholder:text-white/40" />
                <button onClick={()=>setAppTitle(DEFAULT_TITLE)} className="px-5 h-12 rounded-full bg-white/10 border border-white/20 font-bold text-xs text-white">Reset</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded- bg-black border border-white/20 p-4">
                <div className="font-black text- tracking-widest text-white/60 mb-3">HOLE WIN</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><div><div className="font-bold text- text-white">Base Hole Win</div><div className="text- text-white/60">Per loser before carry</div></div><div className="flex items-center gap-2"><button onClick={()=>updateSetting("baseHolePoints",-1)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">-</button><div className="w-14 h-10 rounded-xl bg-black border border-white/30 flex items-center justify-center font-black text- text-white">{settings.baseHolePoints}</div><button onClick={()=>updateSetting("baseHolePoints",1)} className="w-10 h-10 rounded-full bg-white text-black font-black">+</button></div></div>
                  <div className="flex justify-between items-center"><div><div className="font-bold text- text-white">Max Per Loser</div><div className="text- text-white/60">Cap with carry</div></div><div className="flex items-center gap-2"><button onClick={()=>updateSetting("maxPerLoser",-1)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">-</button><div className="w-14 h-10 rounded-xl bg-black border border-white/30 flex items-center justify-center font-black text- text-white">{settings.maxPerLoser}</div><button onClick={()=>updateSetting("maxPerLoser",1)} className="w-10 h-10 rounded-full bg-white text-black font-black">+</button></div></div>
                </div>
              </div>
              <div className="rounded- bg-black border border-white/20 p-4">
                <div className="font-black text- tracking-widest text-white/60 mb-3">BIRDIE / EAGLE</div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><div><div className="font-bold text- text-white">Birdie +</div></div><div className="flex items-center gap-2"><button onClick={()=>updateSetting("birdiePoints",-1)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">-</button><div className="w-14 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center font-black text- text-emerald-200">+{settings.birdiePoints}</div><button onClick={()=>updateSetting("birdiePoints",1)} className="w-10 h-10 rounded-full bg-white text-black font-black">+</button></div></div>
                  <div className="flex justify-between items-center"><div><div className="font-bold text- text-white">Eagle +</div></div><div className="flex items-center gap-2"><button onClick={()=>updateSetting("eaglePoints",-1)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">-</button><div className="w-14 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center font-black text- text-amber-200">+{settings.eaglePoints}</div><button onClick={()=>updateSetting("eaglePoints",1)} className="w-10 h-10 rounded-full bg-white text-black font-black">+</button></div></div>
                </div>
              </div>
              <div className="rounded- bg-black border border-white/20 p-4 md:col-span-2">
                <div className="font-black text- tracking-widest text-white/60 mb-3">CARRY OVER</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center md:flex-col md:items-start gap-2"><div><div className="font-bold text- text-white">Carry Increment</div></div><div className="flex items-center gap-2"><button onClick={()=>updateSetting("carryIncrement",-1)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">-</button><div className="w-14 h-10 rounded-xl bg-black border border-white/30 flex items-center justify-center font-black text- text-white">+{settings.carryIncrement}</div><button onClick={()=>updateSetting("carryIncrement",1)} className="w-10 h-10 rounded-full bg-white text-black font-black">+</button></div></div>
                  <div className="flex justify-between items-center md:flex-col md:items-start gap-2"><div><div className="font-bold text- text-white"># Pushes Before Cap</div></div><div className="flex items-center gap-2"><button onClick={()=>updateSetting("maxCarries",-1)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">-</button><div className="w-14 h-10 rounded-xl bg-black border border-white/30 flex items-center justify-center font-black text- text-white">{settings.maxCarries}</div><button onClick={()=>updateSetting("maxCarries",1)} className="w-10 h-10 rounded-full bg-white text-black font-black">+</button></div></div>
                  <div className="flex justify-between items-center md:flex-col md:items-start gap-2"><div><div className="font-bold text- text-white">Carry Cap</div></div><div className="flex items-center gap-2"><button onClick={()=>updateSetting("carryCap",-1)} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">-</button><div className="w-14 h-10 rounded-xl bg-black border border-white/30 flex items-center justify-center font-black text- text-white">{settings.carryCap}</div><button onClick={()=>updateSetting("carryCap",1)} className="w-10 h-10 rounded-full bg-white text-black font-black">+</button></div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab==="courses" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2"><div className="font-black text- text-white">Courses • {allCourses.length}</div><button onClick={openNewCourse} className="px-5 h-10 rounded-full bg-fuchsia-500 text-white font-black text-xs">+ Add</button></div>
            <select value={cIdx} onChange={e=>setCIdx(parseInt(e.target.value))} className="w-full h-12 rounded-xl bg-black border border-white/30 px-4 text- font-bold text-white">
              {allCourses.map((c,idx)=><option key={c.short+idx} value={idx} className="text-black">{c.name} - {c.short} Par {c.pars.reduce((a,b)=>a+b,0)}</option>)}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allCourses.map((c,idx)=>{
                const isCustom=idx>=COURSES.length;
                return (
                  <div key={c.short+idx} className={`rounded-xl border p-4 ${idx===cIdx?"bg-white text-black shadow-lg":"bg-black border-white/20 text-white"}`}>
                    <div className="font-bold text-">{c.name} {isCustom&&<span className="text- px-2 py-0.5 rounded-full bg-fuchsia-500 text-white font-black">CUSTOM</span>}</div><div className="text- opacity-70 mt-1">Par {c.pars.reduce((a,b)=>a+b,0)} • {c.area}</div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button onClick={()=>{ setCIdx(idx); setActiveTab("live"); }} className="h-9 rounded-full bg-fuchsia-500 text-white font-black text-">Use</button>
                      <button onClick={()=>openEditCourse(idx)} className="h-9 rounded-full bg-white/10 border border-white/30 font-bold text- text-white">✏️ Edit</button>
                      <button onClick={()=>deleteCourse(idx)} className={`h-9 rounded-full font-bold text- ${isCustom?"bg-red-500/20 border border-red-400/30 text-red-200":"bg-white/5 border border-white/10 text-white/30"}`}>🗑️ Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {showEdit && (
              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#121828] rounded- border border-white/30 p-5 w-full max-w- max-h- overflow-y-auto">
                  <div className="font-black text- mb-4 text-white">{editingIdx===null?"Add New Course":`Edit ${editForm.name}`}</div>
                  <div className="space-y-3">
                    <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} placeholder="Course Name" className="w-full h-11 px-4 rounded-xl bg-black border border-white/30 text- text-white" />
                    <div className="grid grid-cols-2 gap-2"><input value={editForm.short} onChange={e=>setEditForm(f=>({...f,short:e.target.value.toUpperCase()}))} placeholder="SHORT" className="h-11 px-4 rounded-xl bg-black border border-white/30 text- text-white" /><input value={editForm.area} onChange={e=>setEditForm(f=>({...f,area:e.target.value}))} placeholder="Area" className="h-11 px-4 rounded-xl bg-black border border-white/30 text- text-white" /></div>
                    <div><div className="text- font-bold text-white/60 mb-1">PARS (18)</div><textarea value={editForm.parsStr} onChange={e=>setEditForm(f=>({...f,parsStr:e.target.value}))} className="w-full h-20 p-3 rounded-xl bg-black border border-white/30 text- font-mono text-white" /></div>
                    <div><div className="text- font-bold text-white/60 mb-1">SI (18)</div><textarea value={editForm.siStr} onChange={e=>setEditForm(f=>({...f,siStr:e.target.value}))} className="w-full h-20 p-3 rounded-xl bg-black border border-white/30 text- font-mono text-white" /></div>
                  </div>
                  <div className="flex gap-2 mt-5"><button onClick={()=>setShowEdit(false)} className="flex-1 h-11 rounded-full bg-white/10 border border-white/20 font-bold text-white">Cancel</button><button onClick={saveCourse} className="flex-1 h-11 rounded-full bg-fuchsia-500 text-white font-black">Save</button></div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==="history" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4">
            <div className="font-black text- mb-4 text-white">History • {rounds.length} rounds</div>
            {rounds.length===0? <div className="py-16 text-center text-white/40">No rounds yet</div> :
              rounds.map(r=>{
                const coursePars=r.course?.pars||COURSES.find(c=>c.short===r.course?.short)?.pars||Array(18).fill(4);
                const dateStr=r.dateStr||new Date(r.id).toLocaleString(); const short=r.course?.short||r.course?.name; const totals=r.totals||{}; const gross=r.gross||{}; const scoresObj=r.scores||{}; const orderNames=r.players?.map(p=>p.name)||Object.keys(scoresObj);
                return (
                  <div key={r.id} className="p-3 rounded- bg-black border border-white/20 mb-3">
                    <div className="flex justify-between"><div className="text- font-mono text-white/80">{dateStr} • {short} {r.title?`• ${r.title}`:""} {r.tieBreak?`• TB:${r.tieBreak.winner}`:""}</div><button onClick={async()=>{ const u=rounds.filter(x=>x.id!==r.id); setRounds(u); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:u})}); }catch{} }} className="px-3 py-1 rounded-full bg-red-500/20 text- text-white">Delete</button></div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      {orderNames.map(name=>{
                        const arr=scoresObj[name]||[]; const st=getStats(arr, coursePars); const pts=totals[name]??0; const g=gross[name]?? (arr||[]).reduce((a,v)=>a+(parseInt(v)||0),0);
                        return (<div key={name} className="rounded-xl bg-black border border-white/10 p-2.5"><div className="flex justify-between"><span className="font-bold text- text-white">{name}</span><span className="text- font-black text-white">{g}/{pts>0?`+${pts}`:pts}</span></div><div className="mt-2 flex gap-1 text-"><span className="px-2 py-1 rounded-full bg-white/10 text-white">{st.parsC}P</span><span className="px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-200">{st.birdies}B</span><span className="px-2 py-1 rounded-full bg-amber-400/20 text-amber-200">{st.eagles}E</span><span className="px-2 py-1 rounded-full bg-orange-400/15 text-white">{st.bogeys}BG</span><span className="px-2 py-1 rounded-full bg-red-500/15 text-white">{st.doubleBogeys}DBL</span></div></div>);
                      })}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}
      </div>
    </div>
  );
}

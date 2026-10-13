import React, { useEffect, useMemo, useState, useRef } from "react";
const DEFAULT_LOGO = "/logo.jpg";

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

function getStats(arr, pars){
  let parsC=0,birdies=0,eagles=0,bogeys=0,doubleBogeys=0;
  (arr||[]).forEach((sc,h)=>{ if(sc===""||sc==null) return; const d=sc-(pars[h]||4); if(d===0) parsC++; else if(d===-1) birdies++; else if(d<=-2) eagles++; else if(d===1) bogeys++; else if(d>=2) doubleBogeys++; });
  return {parsC,birdies,eagles,bogeys,doubleBogeys};
}

function calc(players, pars, sis){
  try{
    if(!pars||pars.length!==18||!sis||sis.length!==18) return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null};
    const hp={}; players.forEach(p=>hp[p.name]=Array(18).fill(0));
    let carry=0, cc=0, tieBreak=null;
    const hcpMap={}; players.forEach(p=>hcpMap[p.name]=Number(p.hcp)||0);
    for(let h=0;h<18;h++){
      const nets=[]; players.forEach(p=>{
        const g=p.scores?.[h]; if(g===""||g==null) return;
        let s=0; const si=sis[h]; if(si){ if(p.name==="Joe"){ if(si===1||si===2) s=1; } else if((hcpMap[p.name]||0)>=si) s=1; }
        nets.push({p:p.name, net:g-s});
      });
      if(!nets.length) continue;
      const min=Math.min(...nets.map(x=>x.net)); const winners=nets.filter(x=>x.net===min);
      if(winners.length===1){
        const perLoser=Math.min(2+carry,6); const w=winners[0].p;
        hp[w][h]+=perLoser*(players.length-1); players.forEach(pl=>{ if(pl.name!==w && pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; });
        carry=0; cc=0;
      } else {
        if(h===17){
          const stats={}; players.forEach(p=>stats[p.name]=getStats(p.scores,pars));
          let rem=[...players].filter(p=>p.scores.some(v=>v!==""&&v!=null)); if(!rem.length) rem=[...players];
          const maxPars=Math.max(0,...rem.map(p=>stats[p.name]?.parsC||0)); rem=rem.filter(p=>(stats[p.name]?.parsC||0)===maxPars);
          let reason=`most pars ${maxPars}`;
          if(rem.length>1){ const maxBird=Math.max(0,...rem.map(p=>stats[p.name]?.birdies||0)); rem=rem.filter(p=>(stats[p.name]?.birdies||0)===maxBird); reason=`${maxPars} pars tie → most birdies ${maxBird}`; if(rem.length>1){ const minDbl=Math.min(99,...rem.map(p=>stats[p.name]?.doubleBogeys??99)); rem=rem.filter(p=>(stats[p.name]?.doubleBogeys??99)===minDbl); reason=`${maxPars} pars tie → ${maxBird} birdies tie → least doubles ${minDbl}`; } }
          const winner=rem[0]?.name||players[0]?.name; if(winner){ const perLoser=Math.min(2+carry,6); hp[winner][h]+=perLoser*(players.length-1); players.forEach(pl=>{ if(pl.name!==winner&&pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; }); tieBreak={winner,reason,stats}; }
          carry=0; cc=0;
        } else { if(cc<2){ carry+=2; cc++; } else carry=4; }
      }
    }
    for(let h=0;h<18;h++){
      const par=pars[h]||4;
      const birdiers=players.filter(p=>{ const g=p.scores?.[h]; return g!==""&&g!=null&&g===par-1; }).map(p=>p.name);
      const eaglers=players.filter(p=>{ const g=p.scores?.[h]; return g!==""&&g!=null&&g<=par-2; }).map(p=>p.name);
      birdiers.forEach(m=>{ const opps=players.filter(p=>p.name!==m && p.scores?.[h]!==""&&p.scores[h]!=null && p.scores[h]>par-1); if(!opps.length) return; hp[m][h]+=2*opps.length; opps.forEach(o=>hp[o.name][h]-=2); });
      eaglers.forEach(m=>{ const opps=players.filter(p=>p.name!==m && p.scores?.[h]!==""&&p.scores[h]!=null && p.scores[h]>par-2); if(!opps.length) return; hp[m][h]+=5*opps.length; opps.forEach(o=>hp[o.name][h]-=5); });
    }
    const totals={},gross={},running={};
    players.forEach(p=>{ const gArr=(p.scores||[]).map(v=>parseInt(v)||0); gross[p.name]=gArr.reduce((a,b)=>a+b,0); totals[p.name]=(hp[p.name]||[]).reduce((a,b)=>a+b,0); let run=0; running[p.name]=(hp[p.name]||[]).map(v=>{ run+=Number(v)||0; return run; }); });
    return {hp,totals,gross,running,carry,tieBreak};
  }catch(e){ return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null}; }
}

export default function App(){
  const [logoSrc,setLogoSrc]=useState(()=>{ try{ return localStorage.getItem("darkscore_logo")||DEFAULT_LOGO; }catch{ return DEFAULT_LOGO; } });
  const fileInputRef=useRef(null);
  const [customCourses,setCustomCourses]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_customCourses"); const p=s?JSON.parse(s):[]; return Array.isArray(p)?p.filter(c=>c&&c.pars&&c.pars.length===18):[]; }catch{ return []; } });
  const allCourses=useMemo(()=>[...COURSES,...customCourses],[customCourses]);
  const [cIdx,setCIdx]=useState(0); const course=allCourses[cIdx]||COURSES[0];
  const [players,setPlayers]=useState(()=>[
    {name:"Joe",hcp:2,scores:Array(18).fill("")},
    {name:"Brad",hcp:0,scores:Array(18).fill("")},
    {name:"Graham",hcp:0,scores:Array(18).fill("")},
  ]);
  const [rounds,setRounds]=useState([]); const [activeTab,setActiveTab]=useState("live");
  const [activeHole,setActiveHole]=useState(0);
  const [showEdit,setShowEdit]=useState(false); const [editingIdx,setEditingIdx]=useState(null);
  const [editForm,setEditForm]=useState({name:"",short:"",parsStr:"",siStr:"",area:""});
  const [newName,setNewName]=useState(""); const [newHcp,setNewHcp]=useState(10);

  const res=useMemo(()=>calc(players,course.pars,course.si),[players,course.pars,course.si]);
  const statsMap=useMemo(()=>{ const m={}; players.forEach(p=>m[p.name]=getStats(p.scores,course.pars)); return m; },[players,course.pars]);

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
  function addPlayer(){ const n=newName.trim(); if(!n||players.length>=4||players.find(p=>p.name===n)) return; setPlayers(prev=>[...prev,{name:n,hcp:parseInt(newHcp)||0,scores:Array(18).fill("")}]); setNewName(""); }
  function removePlayer(name){ if(players.length<=2) return; setPlayers(prev=>prev.filter(p=>p.name!==name)); }
  function updateHcp(name,hcp){ setPlayers(prev=>prev.map(p=>p.name===name?{...p,hcp:parseInt(hcp)||0}:p)); }

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      {/* HEADER - PHONE FRIENDLY */}
      <div className="sticky top-0 z-50 bg-[#0A0E1A]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w- mx-auto p-3 md:p-4 flex items-center gap-3 md:gap-6">
          <div className="relative group cursor-pointer shrink-0" onClick={handleLogoClick}>
            <img src={logoSrc} alt="" className="w-16 h-16 md:w-40 md:h-40 rounded- md:rounded- object-cover bg-transparent border-2 border-fuchsia-400/50 shadow-[0_0_30px_rgba(217,70,239,0.4)]" onError={e=>e.target.src=DEFAULT_LOGO} />
            <div className="absolute inset-0 rounded- md:rounded- bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text- font-black">📸</div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text- md:text- leading-tight truncate">Galactic Skins</div>
            <div className="hidden md:block text- opacity-60 font-mono mt-1">{course.name} • Par {course.pars.reduce((a,b)=>a+b,0)} • Joe→Brad→Graham</div>
            <div className="md:hidden flex gap-2 mt-1.5 overflow-x-auto">
              {players.map(p=>{
                const pts=res.totals?.[p.name]||0; const g=res.gross?.[p.name]||0;
                return <div key={p.name} className={`shrink-0 px-3 py-1 rounded-full text- font-bold border ${pts>0?"bg-fuchsia-500 text-black border-fuchsia-400":"bg-white/10 border-white/10"}`}><span className="opacity-70">{p.name[0]}:</span> {g} / {pts>0?`+${pts}`:pts}</div>
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <select value={cIdx} onChange={e=>setCIdx(parseInt(e.target.value))} className="w-full max-w- h-9 md:h-10 rounded-full bg-black/60 border border-white/20 px-3 md:px-4 text- md:text-sm font-bold focus:border-fuchsia-400/50 focus:outline-none">
                {allCourses.map((c,idx)=><option key={c.short+idx} value={idx}>{c.short} - {c.name} (Par {c.pars.reduce((a,b)=>a+b,0)})</option>)}
              </select>
            </div>
          </div>
          <div className="hidden md:flex rounded-full bg-white/[0.06] border border-white/10 p-1">
            <button onClick={()=>setActiveTab("live")} className={`px-6 py-2.5 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/60"}`}>Live</button>
            <button onClick={()=>setActiveTab("courses")} className={`px-6 py-2.5 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"text-white/60"}`}>Courses {allCourses.length}</button>
            <button onClick={()=>setActiveTab("history")} className={`px-6 py-2.5 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/60"}`}>History {rounds.length}</button>
          </div>
        </div>
        {/* PHONE TABS */}
        <div className="md:hidden flex gap-1 px-3 pb-3">
          <button onClick={()=>setActiveTab("live")} className={`flex-1 h-9 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"bg-white/10 text-white/70"}`}>Live</button>
          <button onClick={()=>setActiveTab("courses")} className={`flex-1 h-9 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"bg-white/10 text-white/70"}`}>Courses</button>
          <button onClick={()=>setActiveTab("history")} className={`flex-1 h-9 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"bg-white/10 text-white/70"}`}>History {rounds.length}</button>
        </div>
      </div>

      <div className="max-w- mx-auto p-3 md:p-4 space-y-4">
        {activeTab==="live" && (
          <>
            {/* PHONE: BIG HOLE SELECTOR */}
            <div className="md:hidden">
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {Array.from({length:18},(_,h)=>{
                  const par=course.pars[h]||4; const hasScore=players.some(p=>p.scores[h]!==""&&p.scores[h]!=null);
                  return (
                    <button key={h} onClick={()=>setActiveHole(h)} className={`shrink-0 w-12 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${activeHole===h?"bg-white text-black border-white scale-105 shadow-lg":hasScore?"bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-200":"bg-black/40 border-white/10"}`}>
                      <span className="text- opacity-60">H{h+1}</span>
                      <span className="text- font-black">P{par}</span>
                      <span className="text- mt-0.5">{hasScore?"✓":"-"}</span>
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE HOLE - PHONE EASY SCORING */}
              {(()=>{
                const h=activeHole; const par=course.pars[h]||4; const isLast=h===17;
                return (
                  <div className="mt-3 rounded- bg-[#121828] border border-white/10 overflow-hidden">
                    <div className="p-4 flex justify-between items-center bg-black/30">
                      <div><div className="font-black text-">Hole {h+1} • Par {par} {isLast?"★ FINAL":""}</div><div className="text- opacity-60 mt-1">SI {course.si[h]} • Pot: {res.carry>0?`+${res.carry} carry`:"2pts"} {isLast&&res.tieBreak?`• TB: ${res.tieBreak.winner}`:""}</div></div>
                      <div className="flex gap-2">
                        <button onClick={()=>setActiveHole(Math.max(0,h-1))} className="w-9 h-9 rounded-full bg-white/10 border border-white/10">‹</button>
                        <button onClick={()=>setActiveHole(Math.min(17,h+1))} className="w-9 h-9 rounded-full bg-white text-black font-black">›</button>
                      </div>
                    </div>
                    <div className="p-3 space-y-3">
                      {players.map(p=>{
                        const v=p.scores?.[h]??""; const hp=res.hp?.[p.name]?.[h]||0; const run=res.running?.[p.name]?.[h]??0;
                        const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isEagle=v!==""&&v<=par-2; const isBogey=v!==""&&v===par+1;
                        return (
                          <div key={p.name} className={`rounded- border-2 p-3 flex items-center justify-between ${isEagle?"bg-amber-500/15 border-amber-400/50":isBirdie?"bg-emerald-500/15 border-emerald-400/50":isPar?"bg-white/[0.05] border-white/20":isBogey?"bg-orange-500/10 border-orange-400/20":"bg-black/30 border-white/10"}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black">{p.name[0]}</div>
                              <div>
                                <div className="font-bold text- flex items-center gap-2">{p.name} <span className="text- opacity-50">H{p.hcp}</span>{p.name==="Joe"&&<span className="text- px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-black">SI 1&2</span>}</div>
                                <div className="flex gap-1 mt-1">
                                  {isPar&&<span className="text- px-2 py-1 rounded-full bg-white/20 font-bold">PAR</span>}
                                  {isBirdie&&<span className="text- px-2 py-1 rounded-full bg-emerald-400 text-black font-black">BIRDIE +2</span>}
                                  {isEagle&&<span className="text- px-2 py-1 rounded-full bg-amber-400 text-black font-black">EAGLE +5</span>}
                                  <span className={`text- px-2 py-1 rounded-full font-mono font-bold ${hp>0?"bg-fuchsia-400 text-black":hp<0?"bg-red-400 text-black":"bg-white/10 opacity-60"}`}>{hp!==0?`${hp>0?`+${hp}`:hp}`:"0"} • {run>0?`+${run}`:run}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={()=>{ const curr=parseInt(players.find(pl=>pl.name===p.name).scores[h])||par; upd(p.name,h,Math.max(1,curr-1)); }} className="w-11 h-11 rounded-full bg-white/10 border border-white/20 text- font-black active:bg-white/20">-</button>
                              <div className="w-16 h-11 rounded-xl bg-black border-2 border-white/20 flex items-center justify-center font-black text-">{v===""?"-":v}</div>
                              <button onClick={()=>{ const curr=parseInt(players.find(pl=>pl.name===p.name).scores[h])||par; upd(p.name,h,Math.min(12,curr+1)); }} className="w-11 h-11 rounded-full bg-white text-black text- font-black active:bg-white/80">+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 bg-black/20 flex gap-2">
                      {[3,4,5,6,7].map(n=><button key={n} onClick={()=>{ players.forEach(p=>{ if(p.scores[h]===""||p.scores[h]==null) upd(p.name,h,n); }); }} className={`flex-1 h-10 rounded-full font-black text-sm border ${n===par?"bg-white text-black border-white":"bg-white/10 border-white/10"}`}>{n}</button>)}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* DESKTOP TABLE (hidden on phone) */}
            <div className="hidden md:block rounded- bg-[#121828] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto"><table className="w-full border-collapse" style={{minWidth: `${240 + players.length*220}px`}}><thead><tr className="bg-black/30 text- opacity-60 font-black tracking-widest"><th className="p-3 text-left w-">HOLE</th><th className="p-3 text-left w-">PAR</th>{players.map(p=><th key={`hdr-${p.name}`} className="p-3 text-left min-w-">{p.name} H{p.hcp} G:{res.gross?.[p.name]||0} P:{res.totals?.[p.name]||0}</th>)}<th className="p-3 text-left w-">POT</th></tr></thead><tbody>{Array.from({length:18},(_,h)=>{ const par=course.pars[h]||4; const isLast=h===17; return (<tr key={`row-${h}`} className={`border-t border-white/10 hover:bg-white/[0.02] ${isLast?"bg-amber-400/10":""} ${activeHole===h?"bg-white/[0.05]":""}`}><td className={`p-3 text-xs font-black ${isLast?"text-amber-200":""}`}>{h+1}{isLast?"★":""}</td><td className="p-3"><span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{par}</span></td>{players.map(p=>{ const v=p.scores?.[h]??""; const hp=res.hp?.[p.name]?.[h]||0; const run=res.running?.[p.name]?.[h]??0; const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isEagle=v!==""&&v<=par-2; return (<td key={`${p.name}-${h}`} className={`p-2 ${isEagle?"bg-amber-500/15":isBirdie?"bg-emerald-500/15":isPar?"bg-white/[0.03]":""}`}><div className="flex items-center gap-2"><input value={v} onChange={e=>upd(p.name,h,e.target.value)} className={`w- h-10 rounded-xl bg-black/60 border-2 text-center font-black text- ${isEagle?"border-amber-400":isBirdie?"border-emerald-400":isPar?"border-white/30":"border-white/15"}`} placeholder="-" /><div className="flex flex-col gap-1">{isPar&&<span className="text- px-2 py-1 rounded-full bg-white/15 font-bold">PAR</span>}{isBirdie&&<span className="text- px-2 py-1 rounded-full bg-emerald-400 text-black font-black">BIRDIE +2</span>}{isEagle&&<span className="text- px-2 py-1 rounded-full bg-amber-400 text-black font-black">EAGLE +5</span>}<span className={`text- px-2 py-1 rounded-full font-mono font-bold ${hp>0?"bg-fuchsia-400 text-black":hp<0?"bg-red-400 text-black":"bg-white/10 opacity-60"}`}>{hp!==0?`${hp>0?`+${hp}`:hp} (${run>0?`+${run}`:run})`:`(${run})`}</span></div></div></td>); })}<td className="p-3 text- font-mono opacity-60">{isLast&&res.tieBreak?"TB":res.carry>0&&!isLast?`+${res.carry}`:""}</td></tr>); })}<tr className="bg-black/50 border-t-2 border-fuchsia-400/30 font-black"><td className="p-4 text-">TOTAL</td><td className="p-4 text-">Par {course.pars.reduce((a,b)=>a+b,0)}</td>{players.map(p=><td key={`tot-${p.name}`} className="p-4"><div className="text- leading-none">{res.gross?.[p.name]||0} gross</div><div className="text- mt-1">{res.totals?.[p.name]>0?`+${res.totals[p.name]}`:res.totals?.[p.name]||0} pts</div></td>)}<td className="p-4 text-">FINAL</td></tr></tbody></table></div>
            </div>

            <div className="hidden md:grid grid-cols-3 gap-4">
              {players.map(p=>{
                const st=statsMap[p.name]||{parsC:0,birdies:0,eagles:0,bogeys:0,doubleBogeys:0}; const g=res.gross?.[p.name]||0; const pts=res.totals?.[p.name]||0;
                return (<div key={p.name} className="rounded- bg-[#121828] border border-white/10 p-5"><div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black text-xs">{p.name[0]}</div><span className="font-bold">{p.name}</span></div><button onClick={()=>removePlayer(p.name)} className="w-8 h-8 rounded-full bg-white/10 text-xs">✕</button></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded- bg-black/40 border border-white/10 p-3 text-center"><div className="text- opacity-50">GROSS</div><div className="text- font-black">{g}</div></div><div className={`rounded- border p-3 text-center ${pts>0?"bg-fuchsia-500 text-black":"bg-black/40 border-white/10"}`}><div className="text- opacity-70">RUNNING PTS</div><div className="text- font-black">{pts>0?`+${pts}`:pts}</div></div></div></div>);
              })}
            </div>

            <div className="flex gap-2">
              <button onClick={async()=>{ const playersObj={}; players.forEach(p=>playersObj[p.name]=p.scores); const rd={id:Date.now(),dateStr:new Date().toLocaleString(),course:{name:course.name,short:course.short,pars:course.pars,si:course.si},scores:playersObj,players:players.map(p=>({name:p.name,hcp:p.hcp})),totals:{...res.totals},gross:{...res.gross},tieBreak:res.tieBreak||null}; const nr=[rd,...rounds]; setRounds(nr); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:nr})}); }catch{} setPlayers(prev=>prev.map(p=>({...p,scores:Array(18).fill("")}))); setActiveHole(0); setActiveTab("history"); }} className="flex-1 md:flex-none px-7 py-4 md:py-3 bg-fuchsia-500 text-white rounded-full font-black text- md:text-xs shadow-[0_0_20px_rgba(217,70,239,0.4)]">End Round → Save to History</button>
              <button onClick={()=>{ setPlayers(prev=>prev.map(p=>({...p,scores:Array(18).fill("")}))); setActiveHole(0); }} className="px-6 py-4 md:py-3 bg-white/10 border border-white/10 rounded-full font-black text- md:text-xs">Clear</button>
            </div>
          </>
        )}

        {activeTab==="history" && (
          <div className="rounded- bg-[#121828] border border-white/10 p-4 md:p-5">
            <div className="font-black text- md:text- mb-4">History • {rounds.length} rounds</div>
            {rounds.length===0? <div className="py-16 text-center opacity-40">No rounds yet</div> :
              rounds.map(r=>{
                const coursePars=r.course?.pars||COURSES.find(c=>c.short===r.course?.short)?.pars||Array(18).fill(4);
                const dateStr=r.dateStr||new Date(r.id).toLocaleString(); const short=r.course?.short||r.course?.name||"Unknown";
                const totals=r.totals||{}; const gross=r.gross||{}; const scoresObj=r.scores||{}; const orderNames=r.players?.map(p=>p.name)||Object.keys(scoresObj);
                return (
                  <div key={r.id} className="p-3 md:p-4 rounded- bg-black/30 border border-white/10 mb-3">
                    <div className="flex justify-between items-start gap-2"><div className="text- font-mono opacity-80">{dateStr} • <span className="font-black text-white">{short}</span></div><button onClick={async()=>{ const u=rounds.filter(x=>x.id!==r.id); setRounds(u); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:u})}); }catch{} }} className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-">Delete</button></div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      {orderNames.map(name=>{
                        const arr=scoresObj[name]||[]; const st=getStats(arr, coursePars); const pts=totals[name]??0; const g=gross[name]?? (arr||[]).reduce((a,v)=>a+(parseInt(v)||0),0);
                        return (
                          <div key={name} className="rounded-xl bg-black/30 border border-white/10 p-2.5">
                            <div className="flex justify-between items-center"><span className="font-bold text-">{name}</span><span className="text- font-black">{g} / {pts>0?`+${pts}`:pts}</span></div>
                            <div className="mt-2 flex gap-1 text-"><span className="px-2 py-1 rounded-full bg-white/10">{st.parsC}P</span><span className="px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-200">{st.birdies}B</span><span className="px-2 py-1 rounded-full bg-amber-400/20 text-amber-200">{st.eagles}E</span><span className="px-2 py-1 rounded-full bg-orange-400/15">{st.bogeys}BG</span><span className="px-2 py-1 rounded-full bg-red-500/15">{st.doubleBogeys}DBL</span></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {activeTab==="courses" && (
          <div className="rounded- bg-[#121828] border border-white/10 p-4 md:p-5">
            <div className="font-black text- mb-4">Courses • Dropdown • Phone Friendly</div>
            <select value={cIdx} onChange={e=>setCIdx(parseInt(e.target.value))} className="w-full h-12 rounded-xl bg-black/60 border border-white/20 px-4 text- font-bold mb-4">
              {allCourses.map((c,idx)=><option key={c.short+idx} value={idx}>{c.name} - {c.short} - Par {c.pars.reduce((a,b)=>a+b,0)}</option>)}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allCourses.map((c,idx)=><div key={c.short+idx} className={`rounded-xl border p-4 ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}><div className="font-bold text-">{c.name}</div><div className="text- opacity-60">Par {c.pars.reduce((a,b)=>a+b,0)} • SI {c.si.slice(0,6).join(",")}...</div><button onClick={()=>{ setCIdx(idx); setActiveTab("live"); setActiveHole(0); }} className="mt-3 w-full h-10 rounded-full bg-fuchsia-500 text-white font-black text-xs">Use This Course</button></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

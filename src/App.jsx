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

function getStats(arr, pars){
  let parsC=0,birdies=0,eagles=0,doubleBogeys=0;
  (arr||[]).forEach((sc,h)=>{ if(sc===""||sc==null) return; const d=sc-(pars[h]||4); if(d===0) parsC++; else if(d===-1) birdies++; else if(d<=-2) eagles++; else if(d>=2) doubleBogeys++; });
  return {parsC,birdies,eagles,doubleBogeys};
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
      const min=Math.min(...nets.map(x=>x.net));
      const winners=nets.filter(x=>x.net===min);
      if(winners.length===1){
        const perLoser=Math.min(2+carry,6); const w=winners[0].p;
        hp[w][h]+=perLoser*(players.length-1);
        players.forEach(pl=>{ if(pl.name!==w && pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; });
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
  }catch(e){ return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null,error:String(e)}; }
}

export default function App(){
  const [customCourses,setCustomCourses]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_customCourses"); const p=s?JSON.parse(s):[]; return Array.isArray(p)?p.filter(c=>c&&c.pars&&c.pars.length===18):[]; }catch{ return []; } });
  const allCourses=useMemo(()=>[...COURSES,...customCourses],[customCourses]);
  const [cIdx,setCIdx]=useState(1); const course=allCourses[cIdx]||COURSES[1];
  const [players,setPlayers]=useState(()=>[
    {name:"Joe",hcp:0,scores:Array(18).fill("")},
    {name:"Brad",hcp:2,scores:Array(18).fill("")},
    {name:"Graham",hcp:0,scores:Array(18).fill("")},
  ]);
  const [rounds,setRounds]=useState([]); const [activeTab,setActiveTab]=useState("live");
  const [showEdit,setShowEdit]=useState(false); const [editingIdx,setEditingIdx]=useState(null);
  const [editForm,setEditForm]=useState({name:"",short:"",parsStr:"",siStr:"",area:""});
  const [newName,setNewName]=useState(""); const [newHcp,setNewHcp]=useState(10);

  const res=useMemo(()=>calc(players,course.pars,course.si),[players,course.pars,course.si]);
  const statsMap=useMemo(()=>{ const m={}; players.forEach(p=>m[p.name]=getStats(p.scores,course.pars)); return m; },[players,course.pars]);

  useEffect(()=>{(async()=>{ try{ const r=await fetch("/api/standings"); if(r.ok){ const d=await r.json(); if(Array.isArray(d.rounds)) setRounds(d.rounds.filter(x=>x&&x.course&&x.course.pars&&x.course.pars.length===18)); } }catch{} })();},[]);

  function upd(name,h,raw){ const clean=raw.replace(/[^0-9]/g,""); const num=clean===""?"":parseInt(clean,10); setPlayers(prev=>prev.map(p=>{ if(p.name!==name) return p; const ns=[...p.scores]; ns[h]=num; return {...p,scores:ns}; })); }
  function addPlayer(){ const n=newName.trim(); if(!n||players.length>=4||players.find(p=>p.name===n)) return; setPlayers(prev=>[...prev,{name:n,hcp:parseInt(newHcp)||0,scores:Array(18).fill("")}]); setNewName(""); }
  function removePlayer(name){ if(players.length<=2) return; setPlayers(prev=>prev.filter(p=>p.name!==name)); }
  function updateHcp(name,hcp){ setPlayers(prev=>prev.map(p=>p.name===name?{...p,hcp:parseInt(hcp)||0}:p)); }

  return (
    <div className="min-h-screen bg-[#05080F] text-white selection:bg-fuchsia-500/30">
      <div className="sticky top-0 z-50 bg-[#0A0E1A]/90 backdrop-blur-xl border-b border-white/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="max-w- mx-auto flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <img src={LOGO} alt="" className="w-20 h-20 md:w-28 md:h-28 rounded- object-contain bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-2 border-fuchsia-400/60 p-2.5 shadow-[0_0_35px_rgba(217,70,239,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]" onError={e=>e.target.style.display="none"} />
            <div>
              <div className="font-black text- tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Galactic Skins • PRETTIER + FIXED</div>
              <div className="text- opacity-60 font-mono mt-1">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • Isolated inputs • Gross + Running PTS • Hole 8 fixed • Tie 18: pars→birdies→least doubles</div>
              {res.tieBreak && <div className="mt-2 text- px-3.5 py-1.5 rounded-full bg-amber-400 text-black font-black shadow-lg animate-pulse">🏆 TIE BREAKER: {res.tieBreak.winner} - {res.tieBreak.reason}</div>}
            </div>
          </div>
          <div className="flex rounded-full bg-white/[0.06] border border-white/10 p-1 backdrop-blur">
            <button onClick={()=>setActiveTab("live")} className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${activeTab==="live"?"bg-white text-black shadow-lg":"text-white/60 hover:text-white"}`}>Live</button>
            <button onClick={()=>setActiveTab("courses")} className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${activeTab==="courses"?"bg-white text-black shadow-lg":"text-white/60 hover:text-white"}`}>Courses {allCourses.length}</button>
            <button onClick={()=>setActiveTab("history")} className={`px-6 py-2.5 rounded-full text-xs font-black transition-all ${activeTab==="history"?"bg-white text-black shadow-lg":"text-white/60 hover:text-white"}`}>History {rounds.length}</button>
          </div>
        </div>
      </div>

      <div className="max-w- mx-auto p-4 space-y-4">
        {activeTab==="live" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {players.map(p=>{
                const st=statsMap[p.name]||{parsC:0,birdies:0,eagles:0}; const g=res.gross?.[p.name]||0; const pts=res.totals?.[p.name]||0;
                return (
                  <div key={p.name} className="rounded- bg-gradient-to-br from-[#1A2238] to-[#121828] border border-white/10 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-black flex items-center justify-center font-black text-xs shadow-lg">{p.name[0]}</div><span className="font-bold tracking-tight">{p.name}</span>{p.name==="Joe"&&<span className="text- px-2 py-1 rounded-full bg-amber-400 text-black font-black">SI 1&2</span>}</div>
                      <button onClick={()=>removePlayer(p.name)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 border border-white/10 text-xs transition-colors">✕</button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded- bg-black/40 border border-white/10 p-3 text-center backdrop-blur"><div className="text- opacity-50 tracking-widest">GROSS SCORE</div><div className="text- font-black leading-none mt-1 tracking-tight">{g}</div><div className="text- opacity-40 mt-1">Live total</div></div>
                      <div className={`rounded- border p-3 text-center backdrop-blur transition-all ${pts>0?"bg-gradient-to-br from-fuchsia-500 to-violet-600 text-black border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.4)]":"bg-black/40 border-white/10"}`}><div className="text- opacity-70 tracking-widest">RUNNING PTS</div><div className="text- font-black leading-none mt-1 tracking-tight">{pts>0?`+${pts}`:pts}</div><div className="text- opacity-60 mt-1">Skins + Birdie + Eagle</div></div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text- opacity-40 tracking-widest">HCP</span>
                      <input type="number" value={p.hcp} onChange={e=>updateHcp(p.name,e.target.value)} className="w-16 h-9 rounded-xl bg-black/50 border border-white/10 text-center font-bold text-sm focus:border-fuchsia-400/50 focus:outline-none transition-colors" />
                      <div className="ml-auto flex gap-1.5">
                        <span className="text- px-2.5 py-1.5 rounded-full bg-white/10 border border-white/10 font-bold tracking-widest">{st.parsC} PAR</span>
                        <span className="text- px-2.5 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-200 font-black tracking-widest">{st.birdies} BIRDIE</span>
                        <span className="text- px-2.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200 font-black tracking-widest">{st.eagles} EAGLE</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {players.length<4 && (<div className="rounded- border border-dashed border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/[0.08] to-violet-500/[0.03] p-5 flex flex-col justify-center backdrop-blur"><div className="text- font-black opacity-60 tracking-widest mb-3">ADD PLAYER + EDIT HCP</div><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="w-full h-10 rounded-xl bg-black/50 border border-white/10 px-4 text-sm focus:border-fuchsia-400/50 focus:outline-none transition-colors mb-3" /><div className="flex gap-2"><input type="number" value={newHcp} onChange={e=>setNewHcp(e.target.value)} className="w-20 h-10 rounded-xl bg-black/50 border border-white/10 text-center text-sm" /><button onClick={addPlayer} className="flex-1 h-10 rounded-xl bg-white text-black font-black text-xs tracking-widest hover:bg-white/90 transition-colors">+ Add Player</button></div></div>)}
            </div>

            <div className="rounded- bg-[#121828]/80 border border-white/10 p-3 grid grid-cols-2 md:grid-cols-7 gap-2 backdrop-blur">
              {allCourses.map((c,idx)=><button key={c.short+idx} onClick={()=>setCIdx(idx)} className={`rounded-xl border p-3 text-left transition-all ${idx===cIdx?"bg-white text-black shadow-lg scale-[1.02]":"bg-black/30 border-white/10 hover:bg-white/5 hover:border-white/20"}`}><div className="text- font-black tracking-widest">{c.short}</div><div className="text- font-bold mt-1 leading-tight">{c.name}</div><div className="text- opacity-60 mt-1">Par {c.pars.reduce((a,b)=>a+b,0)}</div></button>)}
            </div>

            <div className="rounded- bg-gradient-to-br from-[#121828] to-[#0E1525] border border-white/10 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
              <div className="p-5 flex justify-between items-center border-b border-white/10 flex-wrap gap-4 bg-black/20">
                <div><div className="font-black text- tracking-tight">{course.name} • Prettier + All Fixes • Hole 8 Corrected</div><div className="text- opacity-60 mt-1 font-mono">Birdie +2 only vs non-birdie/eagle • Eagle +5 only vs non-eagle • Skin = 2pts + carry max 6 • 18 tie: pars→birdies→least doubles</div></div>
                <button onClick={async()=>{ const playersObj={}; players.forEach(p=>playersObj[p.name]=p.scores); const rd={id:Date.now(),dateStr:new Date().toLocaleString(),course:{name:course.name,short:course.short,pars:course.pars,si:course.si},scores:playersObj,players:players.map(p=>({name:p.name,hcp:p.hcp})),totals:{...res.totals},gross:{...res.gross},tieBreak:res.tieBreak||null}; const nr=[rd,...rounds]; setRounds(nr); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:nr})}); }catch{} setPlayers(prev=>prev.map(p=>({...p,scores:Array(18).fill("")}))); setActiveTab("history"); }} className="px-7 py-3 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white rounded-full font-black text-xs tracking-widest shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] transition-all">End Round → Save</button>
              </div>
              <div className="overflow-x-auto"><div className="min-w-">
                <div className="grid bg-black/30 backdrop-blur" style={{gridTemplateColumns:`50px 50px repeat(${players.length},1fr) 80px`}}><div className="p-3 text- opacity-40 font-black tracking-widest">HOLE</div><div className="p-3 text- opacity-40 font-black tracking-widest">PAR</div>{players.map(p=><div key={`hdr-${p.name}`} className="p-3 text- font-black tracking-widest">{p.name.toUpperCase()} H{p.hcp} • G:{res.gross?.[p.name]||0} • P:{res.totals?.[p.name]||0}</div>)}<div className="p-3 text- opacity-40 tracking-widest">POT</div></div>
                {Array.from({length:18},(_,h)=>{
                  const par=course.pars[h]||4; const isLast=h===17;
                  return (
                    <div key={`row-${h}`} className={`grid hover:bg-white/[0.02] transition-colors ${h===7?"bg-emerald-500/5":""}`} style={{gridTemplateColumns:`50px 50px repeat(${players.length},1fr) 80px`}}>
                      <div className={`p-3 border-t border-white/10 text-xs font-black flex items-center ${isLast?"bg-amber-400/20 text-amber-200":""} ${h===7?"text-emerald-300":""}`}>{h+1}{isLast?"★":""}{h===7?" (FIXED)":""}</div>
                      <div className="p-3 border-t border-white/10 flex items-center"><span className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold shadow-inner">{par}</span></div>
                      {players.map(p=>{
                        const v=p.scores?.[h]??""; const hp=res.hp?.[p.name]?.[h]||0; const run=res.running?.[p.name]?.[h]??0;
                        const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isEagle=v!==""&&v<=par-2;
                        return (
                          <div key={`${p.name}-${h}`} className={`p-2 border-t border-white/10 flex items-center gap-2 ${isEagle?"bg-amber-500/15":isBirdie?"bg-emerald-500/15":isPar?"bg-white/[0.03]":""}`}>
                            <input value={v} onChange={e=>upd(p.name,h,e.target.value)} className={`w- h-10 rounded-xl bg-black/60 border-2 text-center font-black text- shadow-inner focus:outline-none transition-all ${isEagle?"border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]":isBirdie?"border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]":isPar?"border-white/30":"border-white/15 focus:border-white/30"}`} placeholder="-" />
                            <div className="flex flex-col gap-1">
                              {isPar&&<span className="text- px-2 py-1 rounded-full bg-white/15 border border-white/10 font-bold tracking-widest">PAR</span>}
                              {isBirdie&&<span className="text- px-2 py-1 rounded-full bg-emerald-400 text-black font-black tracking-widest shadow-sm">BIRDIE +2</span>}
                              {isEagle&&<span className="text- px-2 py-1 rounded-full bg-amber-400 text-black font-black tracking-widest shadow-sm">EAGLE +5</span>}
                              <span className={`text- px-2 py-1 rounded-full font-mono font-bold ${hp>0?"bg-fuchsia-400 text-black shadow-[0_0_10px_rgba(217,70,239,0.4)]":hp<0?"bg-red-400 text-black":"bg-white/10 opacity-60"}`}>{hp!==0?`${hp>0?`+${hp}`:hp} (${run>0?`+${run}`:run})`:`(${run})`}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="p-3 border-t border-white/10 text- font-mono opacity-60 flex items-center">{isLast&&res.tieBreak?"TB":res.carry>0&&!isLast?`+${res.carry}`:""}</div>
                    </div>
                  );
                })}
                <div className="grid bg-gradient-to-r from-black/60 to-black/40 border-t-2 border-fuchsia-400/30 font-black backdrop-blur" style={{gridTemplateColumns:`50px 50px repeat(${players.length},1fr) 80px`}}><div className="p-4 text- tracking-widest">TOTAL</div><div className="p-4 text- tracking-widest">Par {course.pars.reduce((a,b)=>a+b,0)}</div>{players.map(p=><div key={`tot-${p.name}`} className="p-4 flex flex-col"><span className="text- leading-none tracking-tight">{res.gross?.[p.name]||0} gross</span><span className={`text- mt-1 tracking-tight ${res.totals?.[p.name]>0?"text-fuchsia-300":""}`}>{res.totals?.[p.name]>0?`+${res.totals[p.name]}`:res.totals?.[p.name]||0} pts</span></div>)}<div className="p-4 text- tracking-widest">FINAL</div></div>
              </div></div>
              {res.tieBreak && <div className="p-4 bg-amber-400 text-black font-bold text-xs text-center tracking-wide">🏆 Last Hole Tie → {res.tieBreak.reason} → {res.tieBreak.winner} wins pot</div>}
              <div className="p-4 bg-black/30 border-t border-white/10 flex gap-2 flex-wrap text- font-mono">
                <span className="px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-200 font-bold">BIRDIE +2 only vs non-birdie/eagle players</span>
                <span className="px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 font-bold">EAGLE +5 only vs non-eagle</span>
                <span className="px-3 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/30">SKIN 2pts + carry max 6</span>
                <span className="px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30">18 TIE: Most Pars → Birdies → Least Doubles</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

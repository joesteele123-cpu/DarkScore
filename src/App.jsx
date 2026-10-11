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

function getStatsForPlayer(scoresArr, pars) {
  let parsC=0,birdies=0,eagles=0,doubleBogeys=0,bogeys=0;
  scoresArr.forEach((sc,h)=>{
    if(sc===""||sc==null) return;
    const diff=sc-(pars[h]||4);
    if(diff===0) parsC++; else if(diff===-1) birdies++; else if(diff<=-2) eagles++; else if(diff===1) bogeys++; else if(diff>=2) doubleBogeys++;
  });
  return {parsC,birdies,eagles,bogeys,doubleBogeys};
}

function calcFromPlayers(players, pars, sis) {
  try {
    const hp={}; players.forEach(p=>hp[p.name]=Array(18).fill(0));
    let carry=0, cc=0, tieBreak=null;
    const hcpMap={}; players.forEach(p=>hcpMap[p.name]=p.hcp);
    for(let h=0;h<18;h++){
      const nets=[];
      players.forEach(p=>{
        const g=p.scores[h]; if(g===""||g==null) return;
        let s=0; if(sis[h]){ if(p.name==="Joe"){ if(sis[h]===1||sis[h]===2) s=1; } else { const hc=hcpMap[p.name]||0; if(hc>=sis[h]) s=1; } }
        nets.push({p:p.name, net:g-s});
      });
      if(!nets.length) continue;
      const min=Math.min(...nets.map(x=>x.net));
      const winners=nets.filter(x=>x.net===min);
      if(winners.length===1){
        const perLoser=Math.min(2+carry,6); const w=winners[0].p;
        hp[w][h]+=perLoser*(players.length-1);
        players.forEach(pl=>{ if(pl.name!==w && pl.scores[h]!=="" && pl.scores[h]!=null) hp[pl.name][h]-=perLoser; });
        carry=0; cc=0;
      } else {
        if(h===17){
          const stats={}; players.forEach(p=>stats[p.name]=getStatsForPlayer(p.scores,pars));
          let remaining=[...players];
          const maxPars=Math.max(...remaining.map(p=>stats[p.name]?.parsC||0));
          remaining=remaining.filter(p=>(stats[p.name]?.parsC||0)===maxPars);
          let reason=`most pars ${maxPars}`;
          if(remaining.length>1){
            const maxBird=Math.max(...remaining.map(p=>stats[p.name]?.birdies||0));
            remaining=remaining.filter(p=>(stats[p.name]?.birdies||0)===maxBird);
            reason=`${maxPars} pars tie → most birdies ${maxBird}`;
            if(remaining.length>1){
              const minDbl=Math.min(...remaining.map(p=>stats[p.name]?.doubleBogeys??99));
              remaining=remaining.filter(p=>(stats[p.name]?.doubleBogeys??99)===minDbl);
              reason=`${maxPars} pars tie → ${maxBird} birdies tie → least doubles ${minDbl}`;
            }
          }
          const winner=remaining[0].name; const perLoser=Math.min(2+carry,6);
          hp[winner][h]+=perLoser*(players.length-1);
          players.forEach(pl=>{ if(pl.name!==winner && pl.scores[h]!=="" && pl.scores[h]!=null) hp[pl.name][h]-=perLoser; });
          tieBreak={winner,reason,stats}; carry=0; cc=0;
        } else {
          if(cc<2){ carry+=2; cc++; } else carry=4;
        }
      }
    }
    for(let h=0;h<18;h++){
      const bm=[],em=[]; players.forEach(p=>{ const g=p.scores[h]; if(g===""||g==null) return; if(g===pars[h]-1) bm.push(p.name); else if(g<=pars[h]-2) em.push(p.name); });
      bm.forEach(m=>{ const o=players.filter(p=>p.name!==m && p.scores[h]!=="" && p.scores[h]!=null); hp[m][h]+=2*o.length; o.forEach(x=>hp[x][h]-=2); });
      em.forEach(m=>{ const o=players.filter(p=>p.name!==m && p.scores[h]!=="" && p.scores[h]!=null); hp[m][h]+=5*o.length; o.forEach(x=>hp[x][h]-=5); });
    }
    const totals={},gross={}; players.forEach(p=>{ totals[p.name]=(hp[p.name]||[]).reduce((a,b)=>a+b,0); gross[p.name]=p.scores.reduce((a,v)=>a+(parseInt(v)||0),0); });
    return {hp,totals,gross,carry,tieBreak};
  } catch { return {hp:{},totals:{},gross:{},carry:0,tieBreak:null}; }
}

export default function App() {
  const [customCourses,setCustomCourses]=useState(()=>{
    try{ const s=localStorage.getItem("darkscore_customCourses"); const p=s?JSON.parse(s):[]; return Array.isArray(p)?p.filter(c=>c&&c.pars&&c.pars.length===18):[]; }catch{ return []; }
  });
  const allCourses=useMemo(()=>[...COURSES,...customCourses],[customCourses]);
  const [cIdx,setCIdx]=useState(0); const course=allCourses[cIdx]||COURSES[0];
  const [players,setPlayers]=useState(()=>[
    {name:"Graham",hcp:0,scores:Array.from({length:18},()=> "")},
    {name:"Joe",hcp:2,scores:Array.from({length:18},()=> "")},
    {name:"Brad",hcp:0,scores:Array.from({length:18},()=> "")},
  ]);
  const [rounds,setRounds]=useState([]); const [activeTab,setActiveTab]=useState("live");
  const [showEdit,setShowEdit]=useState(false); const [editingIdx,setEditingIdx]=useState(null);
  const [editForm,setEditForm]=useState({name:"",short:"",parsStr:"",siStr:"",area:""});
  const [newName,setNewName]=useState(""); const [newHcp,setNewHcp]=useState(10); const [isSaving,setIsSaving]=useState(false);
  const res=useMemo(()=>calcFromPlayers(players,course.pars,course.si),[players,course]);
  const statsMap=useMemo(()=>{ const m={}; players.forEach(p=>m[p.name]=getStatsForPlayer(p.scores,course.pars)); return m; },[players,course]);

  useEffect(()=>{(async()=>{ try{ const r=await fetch("/api/standings"); if(r.ok){ const d=await r.json(); const good=Array.isArray(d.rounds)?d.rounds.filter(x=>x&&x.course&&x.course.pars&&x.course.pars.length===18):[]; setRounds(good); } }catch{} })();},[]);

  // BUGFIXED: each player has own scores array, update creates NEW array only for that player
  function updScore(playerName, holeIdx, rawVal){
    const clean=rawVal.replace(/[^0-9]/g,"");
    const num=clean===""?"":parseInt(clean,10);
    setPlayers(prev=> prev.map(p=>{
      if(p.name!==playerName) return p;
      const newScores=[...p.scores]; // NEW array, isolated
      newScores[holeIdx]=num;
      return {...p, scores:newScores};
    }));
  }

  function addPlayer(){ const name=newName.trim(); if(!name||players.length>=4||players.find(p=>p.name===name)) return; setPlayers(prev=>[...prev,{name,hcp:parseInt(newHcp)||0,scores:Array.from({length:18},()=> "")}]); setNewName(""); }
  function removePlayer(name){ if(players.length<=2) return; setPlayers(prev=>prev.filter(p=>p.name!==name)); }
  function updateHcp(name,hcp){ setPlayers(prev=>prev.map(p=>p.name===name?{...p,hcp:parseInt(hcp)||0}:p)); }

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <div className="sticky top-0 z-50 bg-[#0A0E1A]/90 backdrop-blur border-b border-white/10 p-4">
        <div className="max-w- mx-auto flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <img src={LOGO} alt="" className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-contain bg-white/[0.06] border-2 border-fuchsia-400/60 p-2.5 shadow-[0_0_35px_rgba(217,70,239,0.45)]" onError={e=>e.target.style.display="none"} />
            <div>
              <div className="font-black text-">Galactic Skins • BUGFIXED SCORES</div>
              <div className="text- opacity-60">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • Scores isolated per player • Birdie +2 Eagle +5 • Tie 18: pars→birdies→least doubles</div>
              {res.tieBreak && <div className="mt-2 text- px-3 py-1.5 rounded-full bg-amber-400 text-black font-black">🏆 TIE BREAKER: {res.tieBreak.winner} wins - {res.tieBreak.reason}</div>}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {players.map(p=>{
                const st=statsMap[p.name]||{parsC:0,birdies:0,eagles:0,doubleBogeys:0};
                return (
                  <div key={p.name} className="rounded- bg-[#121828] border border-white/10 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black text-xs">{p.name[0]}</div><span className="font-bold">{p.name}</span>{p.name==="Joe"&&<span className="text- px-1.5 py-1 rounded-full bg-amber-400 text-black font-black">SI 1&2</span>}</div>
                      <button onClick={()=>removePlayer(p.name)} className="w-7 h-7 rounded-full bg-white/10 text-xs">✕</button>
                    </div>
                    <div className="mt-3 flex justify-between items-baseline">
                      <div><div className="text- font-black leading-none">{res.gross[p.name]||0}</div><div className="text- opacity-50 mt-1">GROSS</div></div>
                      <div className={`text- font-black px-3 py-1.5 rounded-full ${res.totals[p.name]>0?"bg-fuchsia-400 text-black":"bg-white/10"}`}>{res.totals[p.name]>0?`+${res.totals[p.name]}`:res.totals[p.name]||0} PTS</div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text- opacity-40">HCP</span>
                      <input type="number" value={p.hcp} onChange={e=>updateHcp(p.name,e.target.value)} className="w-16 h-8 rounded-lg bg-black/50 border border-white/10 text-center font-bold text-sm" />
                      <div className="ml-auto flex gap-1">
                        <span className="text- px-2 py-1 rounded-full bg-white/10">{st.parsC} PAR</span>
                        <span className="text- px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-200 font-black">{st.birdies} BIRDIE</span>
                        <span className="text- px-2 py-1 rounded-full bg-amber-400/20 text-amber-200 font-black">{st.eagles} EAGLE</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {players.length<4 && (
                <div className="rounded- border border-dashed border-fuchsia-400/30 bg-fuchsia-500/[0.07] p-4 flex flex-col justify-center">
                  <div className="text- font-black opacity-60 mb-2">ADD PLAYER + EDIT HCP</div>
                  <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="w-full h-9 rounded-lg bg-black/50 border border-white/10 px-3 text-sm mb-2" />
                  <div className="flex gap-2">
                    <input type="number" value={newHcp} onChange={e=>setNewHcp(e.target.value)} className="w-16 h-9 rounded-lg bg-black/50 border border-white/10 text-center text-sm" />
                    <button onClick={addPlayer} className="flex-1 h-9 rounded-lg bg-white text-black font-black text-xs">+ Add Player</button>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-[#121828] border border-white/10 p-3 grid grid-cols-2 md:grid-cols-7 gap-2">
              {allCourses.map((c,idx)=><button key={c.short+idx} onClick={()=>setCIdx(idx)} className={`rounded-xl border p-2.5 text-left ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}><div className="text- font-black">{c.short}</div><div className="text- font-bold">{c.name}</div></button>)}
            </div>

            <div className="rounded- bg-[#121828] border border-white/10 overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-white/10 flex-wrap gap-3">
                <div><div className="font-black">{course.name} • Scores Isolated - Fixed</div><div className="text- opacity-60 mt-1">Each player's score now stays independent • Birdie +2 vs each • Eagle +5 vs each</div></div>
                <button onClick={async()=>{ setIsSaving(true); const playersObj={}; players.forEach(p=>playersObj[p.name]=p.scores); const rd={id:Date.now(),dateStr:new Date().toLocaleString(),course:{name:course.name,short:course.short,pars:course.pars,si:course.si},scores:playersObj,players:players.map(p=>({name:p.name,hcp:p.hcp})),totals:{...res.totals},gross:{...res.gross},tieBreak:res.tieBreak||null}; const nr=[rd,...rounds]; setRounds(nr); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:nr})}); }catch{} setIsSaving(false); setPlayers(prev=>prev.map(p=>({...p,scores:Array.from({length:18},()=> "")}))); setActiveTab("history"); }} className="px-6 py-2.5 bg-fuchsia-500 text-white rounded-full font-black text-xs">{isSaving?"Saving...":"End Round → Save"}</button>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-">
                  <div className="grid" style={{gridTemplateColumns:`44px 44px repeat(${players.length},1fr) 70px`}}>
                    <div className="p-2.5 text- opacity-40 font-black">HOLE</div><div className="p-2.5 text- opacity-40 font-black">PAR</div>{players.map(p=><div key={`hdr-${p.name}`} className="p-2.5 text- font-black">{p.name.toUpperCase()} H{p.hcp}</div>)}<div className="p-2.5 text- opacity-40">POT</div>
                  </div>
                  {Array.from({length:18},(_,h)=>{
                    const par=course.pars[h]; const isLast=h===17;
                    return (
                      <div key={`row-${h}`} className="grid" style={{gridTemplateColumns:`44px 44px repeat(${players.length},1fr) 70px`}}>
                        <div className={`p-2.5 border-t border-white/10 text-xs font-black flex items-center ${isLast?"bg-amber-400/20 text-amber-200":""}`}>{h+1}{isLast?"★":""}</div>
                        <div className="p-2.5 border-t border-white/10 flex items-center"><span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{par}</span></div>
                        {players.map(p=>{
                          const v=p.scores[h]??""; const hp=res.hp[p.name]?.[h]||0;
                          const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isEagle=v!==""&&v<=par-2; const isDouble=v!==""&&v>=par+2;
                          return (
                            <div key={`${p.name}-cell-${h}`} className={`p-1.5 border-t border-white/10 flex items-center gap-1.5 ${isLast?"bg-amber-500/5":""} ${isEagle?"bg-amber-500/20":isBirdie?"bg-emerald-500/20":isPar?"bg-white/5":isDouble?"bg-red-500/10":""}`}>
                              <input value={v} onChange={e=>updScore(p.name,h,e.target.value)} className={`w- h-9 rounded-xl bg-black/60 border-2 text-center font-black text- ${isEagle?"border-amber-400":isBirdie?"border-emerald-400":isPar?"border-white/30":isDouble?"border-red-400/50":"border-white/15"}`} placeholder="-" />
                              {isPar&&<span className="text- px-1.5 py-0.5 rounded-full bg-white/20 font-bold">PAR</span>}
                              {isBirdie&&<span className="text- px-1.5 py-0.5 rounded-full bg-emerald-400 text-black font-black">BIRDIE +2</span>}
                              {isEagle&&<span className="text- px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-black">EAGLE +5</span>}
                              {hp!==0&&<span className={`text- px-1.5 py-0.5 rounded-full font-black ${hp>0?"bg-fuchsia-400 text-black":"bg-red-400 text-black"}`}>{hp>0?`+${hp}`:hp}</span>}
                            </div>
                          );
                        })}
                        <div className="p-2.5 border-t border-white/10 text- font-mono opacity-60 flex items-center">{isLast&&res.tieBreak?"TB":res.carry>0&&!isLast?`+${res.carry}`:""}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {res.tieBreak && <div className="p-3 bg-amber-400 text-black font-bold text-xs text-center">🏆 Last Hole Tie → {res.tieBreak.reason} → {res.tieBreak.winner} wins pot</div>}
            </div>
          </>
        )}

        {activeTab==="courses" && (
          <div className="rounded-xl bg-[#121828] border border-white/10 p-4">
            <div className="font-black mb-3">Courses • {allCourses.length} • Edit Works • Big Logo</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allCourses.map((c,idx)=><div key={c.short+idx} className={`rounded-xl border p-3 ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}><div className="flex justify-between"><span className="text- font-black px-2 py-1 rounded-full bg-white/10">{c.short}</span><span className="text- opacity-60">{c.area}</span></div><div className="font-bold mt-2 text-">{c.name}</div><div className="text- opacity-60">Par {c.pars.reduce((a,b)=>a+b,0)}</div><div className="mt-2 flex gap-2"><button onClick={()=>{ setEditingIdx(idx); setEditForm({name:c.name,short:c.short,parsStr:c.pars.join(","),siStr:c.si.join(","),area:c.area}); setShowEdit(true); }} className="flex-1 h-8 rounded-full bg-white/10 border border-white/20 text-xs font-bold">✏️ Edit</button><button onClick={()=>setCIdx(idx)} className="flex-1 h-8 rounded-full bg-white text-black font-black text-xs">Use</button></div></div>)}
            </div>
            {showEdit && (<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><div className="bg-[#121828] rounded-2xl border border-white/20 p-5 w-full max-w-"><div className="font-black mb-3">Edit {editForm.name}</div><input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} className="w-full h-9 px-3 rounded bg-black/50 border border-white/10 mb-2 text-sm" /><div className="flex gap-2 mb-2"><input value={editForm.short} onChange={e=>setEditForm(f=>({...f,short:e.target.value}))} className="flex-1 h-9 px-3 rounded bg-black/50 border border-white/10 text-sm" /><input value={editForm.area} onChange={e=>setEditForm(f=>({...f,area:e.target.value}))} className="flex-1 h-9 px-3 rounded bg-black/50 border border-white/10 text-sm" /></div><textarea value={editForm.parsStr} onChange={e=>setEditForm(f=>({...f,parsStr:e.target.value}))} className="w-full h-16 p-2 rounded bg-black/50 border border-white/10 text-xs font-mono mb-2" /><textarea value={editForm.siStr} onChange={e=>setEditForm(f=>({...f,siStr:e.target.value}))} className="w-full h-16 p-2 rounded bg-black/50 border border-white/10 text-xs font-mono mb-3" /><div className="flex gap-2"><button onClick={()=>setShowEdit(false)} className="flex-1 h-10 rounded-full bg-white/10">Cancel</button><button onClick={async()=>{ const pars=editForm.parsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)); const si=editForm.siStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)); if(pars.length!==18){ alert(`Need 18 pars have ${pars.length}`); return; } if(si.length!==18){ alert(`Need 18 SI have ${si.length}`); return; } let upd; if(editingIdx>=COURSES.length){ const ci=editingIdx-COURSES.length; upd=[...customCourses]; upd[ci]={...upd[ci],name:editForm.name,short:editForm.short.toUpperCase(),pars,si,area:editForm.area}; } else { upd=[...customCourses,{name:editForm.name,short:editForm.short.toUpperCase(),pars,si,area:editForm.area+" (Edited)"}]; setCIdx(COURSES.length+upd.length-1); } setCustomCourses(upd); localStorage.setItem("darkscore_customCourses",JSON.stringify(upd)); try{ await fetch("/api/custom-courses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({courses:upd})}); }catch{} setShowEdit(false); }} className="flex-1 h-10 rounded-full bg-fuchsia-500 text-white font-black">Save</button></div></div></div>)}
          </div>
        )}

        {activeTab==="history" && (
          <div className="rounded-xl bg-[#121828] border border-white/10 p-4">
            <div className="font-black mb-3">History • {rounds.length} rounds</div>
            {rounds.length===0? <div className="py-12 text-center opacity-40">No rounds yet</div> : rounds.map(r=>(<div key={r.id} className="p-3 rounded-xl bg-black/30 border border-white/10 mb-2 flex justify-between items-center"><div><div className="text-xs font-mono opacity-60">{r.dateStr} • {r.course?.short} {r.tieBreak?`• TB: ${r.tieBreak.winner} (${r.tieBreak.reason})`:""}</div><div className="text-xs mt-1">{Object.entries(r.totals||{}).map(([n,pts])=>`${n} ${pts>0?`+${pts}`:pts}`).join(" • ")}</div></div><button onClick={()=>{ const u=rounds.filter(x=>x.id!==r.id); setRounds(u); fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:u})}); }} className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-">Delete</button></div>))}
          </div>
        )}
      </div>
    </div>
  );
}

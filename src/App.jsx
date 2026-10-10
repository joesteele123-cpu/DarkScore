
import React, { useMemo, useState, useEffect } from "react";
const COURSES=[
 {name:"Nashboro Golf",short:"NASH",pars:[4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4],si:[2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11]},
 {name:"Pine Creek",short:"PINE",pars:[4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4],si:[17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12]},
];
function calcPoints(scores, pars, sis, hcpMap){
  const players=Object.keys(scores);
  const holePoints={}; players.forEach(p=>holePoints[p]=Array(18).fill(0));
  let carry=0, carryCount=0;
  for(let h=0;h<18;h++){
    const nets=[];
    players.forEach(p=>{
      const g=scores[p][h];
      if(g===""||g==null) return;
      let s=0; const hc=hcpMap[p]||0;
      if(hc>=sis[h]) s=1;
      if(hc>=18 && sis[h]<=hc-18) s++;
      nets.push({p, net:g-s, gross:g});
    });
    if(nets.length===0) continue;
    const min=Math.min(...nets.map(x=>x.net));
    const winners=nets.filter(x=>x.net===min);
    if(winners.length===1){
      let base=2+carry;
      if(base>6) base=6; // MAX 6 pts for 2+ carryovers
      holePoints[winners[0].p][h]=base;
      carry=0; carryCount=0;
    }else{
      if(carryCount<2){ carry+=2; carryCount++; }
      else { carry=4; } // stay at max carry (so next win = 6)
    }
  }
  // Bonuses can exceed 6
  players.forEach(p=>{
    for(let h=0;h<18;h++){
      const g=scores[p][h];
      if(g===""||g==null) continue;
      const par=pars[h];
      if(g===par-1) holePoints[p][h]+=2; // birdie +2
      else if(g<=par-2) holePoints[p][h]+=5; // eagle+ +5
    }
  });
  const totals={}; players.forEach(p=>totals[p]=holePoints[p].reduce((a,b)=>a+b,0));
  return {holePoints, totals, carry, carryCount};
}

export default function App(){
  const [courseIdx,setCourseIdx]=useState(0);
  const course=COURSES[courseIdx];
  const [players,setPlayers]=useState([{name:"Joe",hcp:12},{name:"Brad",hcp:8},{name:"Graham",hcp:15}]);
  const [scores,setScores]=useState(()=>{const init={}; [{name:"Joe",hcp:12},{name:"Brad",hcp:8},{name:"Graham",hcp:15}].forEach(p=>init[p.name]=Array(18).fill("")); return init;});
  const [standings,setStandings]=useState({});
  const hcpMap=useMemo(()=>{const m={}; players.forEach(p=>m[p.name]=p.hcp); return m;},[players]);
  const result=useMemo(()=>calcPoints(scores,course.pars,course.si,hcpMap),[scores,course,hcpMap]);
  const leaderboard=useMemo(()=>players.map(p=>({name:p.name,hcp:p.hcp,pts:result.totals[p.name]||0})).sort((a,b)=>b.pts-a.pts),[players,result]);

  useEffect(()=>{(async()=>{try{const r=await fetch('/api/standings');const d=await r.json(); if(d&&Object.keys(d).length>0) setStandings(d);}catch{}})();},[]);

  function updateScore(name,idx,val){
    const clean=val.replace(/[^0-9]/g,'');
    setScores(prev=>{const c={...prev}; const a=[...(c[name]||Array(18).fill(""))]; a[idx]=clean===""?"":parseInt(clean,10); c[name]=a; return c;});
  }
  async function saveRound(){
    const ns={...standings}; players.forEach(p=>{const cur=ns[p.name]||{rounds:0,points:0}; ns[p.name]={rounds:cur.rounds+1,points:cur.points+(result.totals[p.name]||0)};}); setStandings(ns);
    try{await fetch('/api/standings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({standings:ns})});}catch{}
    const cl={}; players.forEach(p=>cl[p.name]=Array(18).fill("")); setScores(cl);
  }

  return (
    <div className="min-h-screen bg-[#080C12] text-white">
      <div className="sticky top-0 bg-[#080C12]/90 backdrop-blur border-b border-white/10 p-4 flex justify-between">
        <div className="font-black">DarkScore Tour • {course.short} • Win 2, max 6 + bonuses • carry {result.carry} ({result.carryCount})</div>
        <div className="text-xs font-mono opacity-60">Birdie +2 • Eagle +5 can exceed 6</div>
      </div>
      <div className="max-w-[1400px] mx-auto p-4">
        <div className="flex gap-2 mb-4">{COURSES.map((c,i)=><button key={c.short} onClick={()=>setCourseIdx(i)} className={i===courseIdx?"px-4 py-1 bg-white text-black rounded-full font-bold":"px-4 py-1 bg-white/10 rounded-full"}>{c.short}</button>)}</div>
        <div className="rounded-xl bg-[#141B24] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px] grid" style={{gridTemplateColumns:"180px repeat(18, 56px) 80px"}}>
              <div className="p-3 text-xs opacity-50">PLAYER</div>
              {Array.from({length:18},(_,i)=><div key={i} className="p-2 text-center text-xs">H{i+1} P{course.pars[i]}</div>)}
              <div className="p-3 text-center font-bold">PTS</div>
              {players.map(p=>(
                <React.Fragment key={p.name}>
                  <div className="p-3 font-bold border-t border-white/10">{p.name} {result.totals[p.name]||0}</div>
                  {Array.from({length:18},(_,h)=>{
                    const hp=result.holePoints[p.name]?.[h]||0;
                    const baseWin = hp>=2 && hp<=6 ? hp : 0;
                    return (
                      <div key={h} className="p-1 border-t border-white/10 border-l border-white/5 relative">
                        <input value={scores[p.name]?.[h]??""} onChange={e=>updateScore(p.name,h,e.target.value)} className="w-full h-9 rounded bg-black/40 border border-white/10 text-center" placeholder="-" />
                        {hp>0 && <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 text-black text-[11px] font-black rounded-full flex items-center justify-center">{hp}</div>}
                      </div>
                    );
                  })}
                  <div className="p-3 text-center font-black border-t border-white/10">{result.totals[p.name]||0}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="p-4 flex justify-between bg-black/20 text-[11px] font-mono">
            <span>Win 2 • 1 tie carry = 4 • 2+ ties = max 6 + birdie/eagle bonuses</span>
            <button onClick={saveRound} className="px-5 py-2 bg-white text-black rounded-full font-bold">End Round Save</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {leaderboard.map((r,i)=><div key={r.name} className="p-4 rounded-xl bg-[#141B24] border border-white/10"><div>#{i+1} {r.name}</div><div className="text-2xl font-black">{r.pts} pts</div></div>)}
        </div>
      </div>
    </div>
  );
}

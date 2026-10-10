
import React, { useEffect, useMemo, useState } from "react";
const COURSES = [
  { name: "Nashboro Golf", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11] },
  { name: "Pine Creek", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12] },
  { name: "Ted Rhodes", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8] },
];
const STANDINGS_KEY = "darkscore-standings-v2";
function calcPoints(roundScores, pars, sis, handicaps){
  const players = Object.keys(roundScores);
  const holePoints = {};
  players.forEach(p=> holePoints[p]=Array(18).fill(0));
  let carry = 0;
  let carryCount = 0;
  for(let h=0; h<18; h++){
    const nets = [];
    players.forEach(p=>{
      const g = roundScores[p][h];
      if(g===""||g==null) return;
      let s = 0;
      if((handicaps[p]||0) >= sis[h]) s=1;
      if((handicaps[p]||0) >= 18 && sis[h] <= (handicaps[p]||0)-18) s++;
      nets.push({p, net: g - s});
    });
    if(nets.length===0) continue;
    const min = Math.min(...nets.map(n=>n.net));
    const winners = nets.filter(n=>n.net===min);
    if(winners.length===1){
      const pts = 2 + carry;
      holePoints[winners[0].p][h] = pts > 6 ? 6 : pts;
      carry = 0;
      carryCount = 0;
    }else{
      if(carryCount < 2){
        carry += 2;
        carryCount++;
      }
    }
  }
  players.forEach(p=>{
    for(let h=0;h<18;h++){
      const g = roundScores[p][h];
      if(g===""||g==null) continue;
      if(g === pars[h]-1) holePoints[p][h] += 2;
    }
  });
  const totals = {};
  players.forEach(p=> totals[p]=holePoints[p].reduce((a,b)=>a+b,0));
  return {holePoints, totals, carry, carryCount};
}
export default function App(){
  const [courseIdx,setCourseIdx]=useState(0);
  const course=COURSES[courseIdx];
  const [players,setPlayers]=useState([{name:"Joe",hcp:12},{name:"Brad",hcp:8},{name:"Graham",hcp:15}]);
  const [scores,setScores]=useState(()=>{
    const init={};
    [{name:"Joe",hcp:12},{name:"Brad",hcp:8},{name:"Graham",hcp:15}].forEach(p=> init[p.name]=Array(18).fill(""));
    return init;
  });
  const [standings,setStandings]=useState({});
  const handicaps=useMemo(()=>{const m={}; players.forEach(p=> m[p.name]=p.hcp); return m;},[players]);
  const result=useMemo(()=> calcPoints(scores, course.pars, course.si, handicaps), [scores, course, handicaps]);
  function updateScore(name, idx, val){
    const clean = val.replace(/[^0-9]/g,'');
    setScores(prev=>{
      const copy={...prev};
      const arr=[...(copy[name]||Array(18).fill(""))];
      arr[idx]= clean==="" ? "" : parseInt(clean,10);
      copy[name]=arr;
      return copy;
    });
  }
  async function saveRound(){
    const ns={...standings};
    players.forEach(p=>{
      const cur=ns[p.name]||{rounds:0,points:0};
      ns[p.name]={rounds:cur.rounds+1, points:cur.points+(result.totals[p.name]||0)};
    });
    setStandings(ns);
    try{ await fetch('/api/standings',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({standings:ns})}); }catch{}
    const cleared={}; players.forEach(p=> cleared[p.name]=Array(18).fill("")); setScores(cleared);
  }
  return (
    <div className="min-h-screen bg-[#080C12] text-slate-200">
      <div className="p-4 bg-[#141B24] border-b border-white/10 flex justify-between">
        <div className="font-bold">DarkScore Tour - 2pts win, max 2 carryovers = max 6, birdie +2</div>
        <div className="font-mono text-sm">carry {result.carry} ({result.carryCount} ties)</div>
      </div>
      <div className="p-6">
        <div className="flex gap-2 mb-4">
          {COURSES.map((c,i)=><button key={c.short} onClick={()=>setCourseIdx(i)} className={i===courseIdx?"px-3 py-1 bg-white text-black rounded-full":"px-3 py-1 bg-white/10 rounded-full"}>{c.short}</button>)}
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[900px] grid" style={{gridTemplateColumns:"180px repeat(18, 56px) 80px"}}>
            <div className="p-2 text-xs text-slate-500">PLAYER</div>
            {Array.from({length:18},(_,i)=><div key={i} className="p-2 text-center text-xs">#{i+1} P{course.pars[i]}</div>)}
            <div className="p-2 text-center text-xs">PTS</div>
            {players.map(p=>(
              <React.Fragment key={p.name}>
                <div className="p-3 font-bold">{p.name} {result.totals[p.name]||0}</div>
                {Array.from({length:18},(_,h)=>{
                  const hp=result.holePoints[p.name]?.[h]||0;
                  return (
                    <div key={h} className="p-1 relative">
                      <input value={scores[p.name]?.[h] ?? ""} onChange={e=>updateScore(p.name,h,e.target.value)} className="w-full h-[38px] rounded bg-black/30 border border-white/10 text-center font-mono" placeholder="-" />
                      {hp>0 && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">{hp}</div>}
                    </div>
                  );
                })}
                <div className="p-3 text-center font-bold">{result.totals[p.name]||0}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <button onClick={saveRound} className="mt-6 px-6 py-3 bg-white text-black rounded-full font-bold">End Round - Save to Shared</button>
      </div>
    </div>
  );
}

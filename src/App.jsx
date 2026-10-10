
import React, { useEffect, useMemo, useState } from "react";

const COURSES = [
  { name: "Nashboro Golf", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11] },
  { name: "Pine Creek — Mt Juliet", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12] },
  { name: "Ted Rhodes — Nashville", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8] },
  { name: "Indian Hills — Murfreesboro", short: "IND", pars: [4,4,3,5,4,4,3,4,5,4,3,4,5,4,3,4,4,5], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3] },
];

const STANDINGS_KEY = "darkscore-standings-v2";
const PLAYERS_KEY = "darkscore-players-v2";

function calcPoints(roundScores, pars, sis, handicaps){
  // roundScores: {player: [18 scores]}
  // returns per hole points and totals
  const players = Object.keys(roundScores);
  const holePoints = {}; // player -> array 18
  players.forEach(p=> holePoints[p]=Array(18).fill(0));
  let carry = 0;
  for(let h=0; h<18; h++){
    const nets = players.map(p=>{
      const gross = roundScores[p][h];
      if(gross==null || gross==="") return null;
      const si = sis[h];
      const hc = handicaps[p]||0;
      const strokes = hc >= si ? 1 + (hc - si >= 18 ? 1 : 0) : 0;
      // simple: if hc>=18 extra stroke if si <= hc-18
      let extra = 0;
      if(hc>=18 && si <= hc-18) extra = 1;
      const net = gross - (hc>=si?1:0) - extra;
      return {p, gross, net, si};
    }).filter(Boolean);
    if(nets.length===0) continue;
    const minNet = Math.min(...nets.map(n=>n.net));
    const winners = nets.filter(n=>n.net===minNet);
    if(winners.length===1){
      const pts = 2 + carry;
      holePoints[winners[0].p][h]=pts;
      carry=0;
    }else{
      carry = Math.min(carry+1,4); // max carry 4
      // no points, carry over
    }
  }
  // bonus
  players.forEach(p=>{
    for(let h=0;h<18;h++){
      const gross = roundScores[p][h];
      if(gross==null || gross==="") continue;
      const par = pars[h];
      if(gross === par-1) holePoints[p][h]+=2; // birdie
      if(gross <= par-2) holePoints[p][h]+=5; // eagle or better
    }
  });
  const totals = {};
  players.forEach(p=> totals[p]=holePoints[p].reduce((a,b)=>a+b,0));
  return {holePoints, totals, carry};
}

export default function App(){
  const [courseIdx,setCourseIdx]=useState(0);
  const course = COURSES[courseIdx];
  const [players,setPlayers]=useState(()=>{
    try{ const s=localStorage.getItem(PLAYERS_KEY); return s?JSON.parse(s):[{name:"Joe",hcp:12},{name:"Brad",hcp:8},{name:"Graham",hcp:15}]; }catch{ return [{name:"Joe",hcp:12},{name:"Brad",hcp:8},{name:"Graham",hcp:15}]; }
  });
  const [scores,setScores]=useState(()=>{ // {playerName: Array(18)}
    const init={};
    players.forEach(p=> init[p.name]=Array(18).fill(""));
    return init;
  });
  const [standings,setStandings]=useState(()=>{ try{ const s=localStorage.getItem(STANDINGS_KEY); return s?JSON.parse(s):{} }catch{ return {} } });
  const [kvStatus,setKvStatus]=useState("loading");
  const [showAdd,setShowAdd]=useState(false);
  const [newName,setNewName]=useState("");
  const [newHcp,setNewHcp]=useState(12);

  const handicaps = useMemo(()=>{ const m={}; players.forEach(p=>m[p.name]=p.hcp); return m; },[players]);

  const {holePoints, totals, carry} = useMemo(()=> calcPoints(scores, course.pars, course.si, handicaps), [scores, course, handicaps]);

  const leaderboard = useMemo(()=>{
    return players.map(p=>({name:p.name, hcp:p.hcp, points: totals[p.name]||0, totalGross: (scores[p.name]||[]).reduce((a,v)=>a+(parseInt(v)||0),0) })).sort((a,b)=>b.points-a.points);
  },[players, totals, scores]);

  // Load standings from KV + poll every 5s
  useEffect(()=>{
    let interval;
    async function load(){
      try{
        const res = await fetch('/api/standings');
        const data = await res.json();
        if(!res.ok) throw new Error(data.error||'KV not connected');
        if(data.error) throw new Error(data.error);
        if(data && typeof data==='object' && Object.keys(data).length>0){
          setStandings(data);
          localStorage.setItem(STANDINGS_KEY, JSON.stringify(data));
          setKvStatus("ok");
        } else if(Object.keys(data).length===0){
          setKvStatus("ok");
        }
      }catch(e){
        const msg=e.message||'offline';
        setKvStatus(msg.includes('KV')||msg.includes('Redis')||msg.includes('UPSTASH')||msg.includes('Missing') ? 'error':'offline');
      }
    }
    load();
    interval=setInterval(load,5000);
    return ()=> clearInterval(interval);
  },[]);

  useEffect(()=>{ localStorage.setItem(PLAYERS_KEY, JSON.stringify(players)); },[players]);
  useEffect(()=>{ localStorage.setItem(STANDINGS_KEY, JSON.stringify(standings)); },[standings]);

  async function saveRound(){
    // calc totals for season
    const newStandings = {...standings};
    players.forEach(p=>{
      const cur = newStandings[p.name] || {rounds:0, points:0, gross:0};
      newStandings[p.name]={rounds: cur.rounds+1, points: cur.points + (totals[p.name]||0), gross: cur.gross + leaderboard.find(l=>l.name===p.name)?.totalGross||0};
    });
    setStandings(newStandings);
    try{
      await fetch('/api/standings',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({standings:newStandings})});
      setKvStatus("ok");
    }catch{ setKvStatus("offline"); }
    // clear scores
    const cleared={};
    players.forEach(p=> cleared[p.name]=Array(18).fill(""));
    setScores(cleared);
  }

  return (
    <div className="min-h-screen bg-[#080C12] text-slate-200 selection:bg-emerald-500/30">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#080C12]/80 border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-black">D</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-extrabold tracking-tight">DarkScore</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.08] tracking-widest font-semibold">TOUR EDITION</span>
              </div>
              <div className="text-[11px] text-slate-500 mono -mt-1">{course.short} • {course.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${kvStatus==='ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${kvStatus==='ok' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
              {kvStatus==='ok' ? 'Shared • Live' : kvStatus==='loading' ? 'Connecting...' : 'Local only — add Redis'}
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 mono">carry: {carry}</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Main */}
        <div className="space-y-5">
          {/* Course switcher + add player */}
          <div className="glass rounded-[16px] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {COURSES.map((c,i)=>(
                <button key={c.short} onClick={()=>setCourseIdx(i)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${i===courseIdx ? 'bg-white text-black border-white' : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-slate-400'}`}>{c.short} • {c.name.split('—')[0]}</button>
              ))}
            </div>
            <button onClick={()=>setShowAdd(v=>!v)} className="px-3 py-1.5 rounded-full bg-emerald-500 text-black text-[12px] font-bold hover:bg-emerald-400">+ Player</button>
          </div>

          {showAdd && (
            <div className="glass rounded-[16px] p-4 flex gap-2">
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Name" className="flex-1 bg-black/40 border border-white/10 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-emerald-500/50" />
              <input type="number" value={newHcp} onChange={e=>setNewHcp(parseInt(e.target.value)||0)} className="w-20 bg-black/40 border border-white/10 rounded-[10px] px-3 py-2 text-sm mono" />
              <button onClick={()=>{ if(!newName) return; const p={name:newName, hcp:newHcp}; setPlayers([...players,p]); setScores({...scores,[p.name]:Array(18).fill("")}); setNewName(""); setShowAdd(false); }} className="px-4 bg-white text-black rounded-[10px] text-sm font-bold">Add</button>
            </div>
          )}

          {/* Scorecard */}
          <div className="glass rounded-[20px] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="font-bold">Scorecard</div>
              <div className="text-[11px] text-slate-500 mono">HCP • SI • Gross → Net + Bonus</div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid" style={{gridTemplateColumns: `180px repeat(18, 56px) 80px`}}>
                  {/* Header row */}
                  <div className="sticky left-0 z-20 bg-[#141B24] border-b border-white/[0.06] p-3 text-[11px] font-semibold text-slate-500">PLAYER / HOLE</div>
                  {Array.from({length:18},(_,i)=>(
                    <div key={i} className="border-b border-white/[0.06] border-l border-white/[0.04] p-2 text-center">
                      <div className="text-[11px] font-bold mono">{i+1}</div>
                      <div className="text-[10px] text-slate-500">P{course.pars[i]} SI{course.si[i]}</div>
                    </div>
                  ))}
                  <div className="border-b border-white/[0.06] border-l border-white/[0.06] p-3 text-center text-[11px] font-bold">PTS</div>

                  {/* Player rows */}
                  {players.map(p=>{
                    const pts = totals[p.name]||0;
                    return (
                      <React.Fragment key={p.name}>
                        <div className="sticky left-0 z-10 bg-[#141B24]/95 backdrop-blur border-b border-white/[0.06] p-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold flex items-center gap-2">{p.name} <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 border border-white/10 mono">{p.hcp}</span></div>
                            <div className="text-[10px] text-slate-500 mono">{(scores[p.name]||[]).filter(Boolean).length}/18</div>
                          </div>
                          <div className={`text-[13px] font-bold mono px-2 py-1 rounded ${pts>0?'bg-emerald-500/15 text-emerald-400':'bg-white/5 text-slate-500'}`}>{pts}</div>
                        </div>
                        {Array.from({length:18},(_,h)=>{
                          const hp = holePoints[p.name]?.[h]||0;
                          const val = scores[p.name]?.[h] ?? "";
                          const par = course.pars[h];
                          const diff = val!=="" ? parseInt(val)-par : null;
                          return (
                            <div key={h} className="border-b border-white/[0.06] border-l border-white/[0.04] p-1 relative">
                              <input value={val} onChange={e=>{
                                const v=e.target.value.replace(/[^0-9]/g,'');
                                setScores(s=>{ const copy={...s}; const arr=[...copy[p.name]]; arr[h]=v===""?"":parseInt(v); copy[p.name]=arr; return copy; });
                              }} className={`w-full h-[38px] rounded-[10px] bg-black/30 border text-center mono text-[14px] font-semibold outline-none focus:border-emerald-500/60 transition ${diff!==null ? (diff<0?'border-emerald-500/40 text-emerald-300':'diff>0?'border-red-500/30 text-red-300':'border-white/20'):'border-white/10'}`} placeholder="-" />
                              {hp>0 && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center">{hp}</div>}
                            </div>
                          );
                        })}
                        <div className="border-b border-white/[0.06] border-l border-white/[0.06] p-2 flex items-center justify-center">
                          <div className="mono text-[14px] font-bold">{pts}</div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between bg-black/20">
              <div className="text-[11px] text-slate-500">Standard: 2 pts lowest net + carry (max 4) • Bonus: Birdie +2 • Eagle+ +5 • HCP stroke if HCP ≥ SI</div>
              <button onClick={saveRound} className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-[13px] hover:bg-slate-200 transition">End round → Save to shared standings</button>
            </div>
          </div>

          {/* Live leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {leaderboard.map((row,idx)=>(
              <div key={row.name} className={`glass rounded-[16px] p-4 relative overflow-hidden ${idx===0?'glow-emerald border-emerald-500/20':''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mono text-[12px] font-bold ${idx===0?'bg-[#D4AF37] text-black':idx===1?'bg-slate-400 text-black':idx===2?'bg-[#CD7F32] text-black':'bg-white/10 text-slate-400'}`}>{String(idx+1).padStart(2,'0')}</div>
                    <div>
                      <div className="font-bold text-[14px]">{row.name}</div>
                      <div className="text-[11px] text-slate-500 mono">HCP {row.hcp} • Gross {row.totalGross||'-'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[22px] font-extrabold mono leading-none">{row.points}</div>
                    <div className="text-[10px] text-slate-500 tracking-widest">PTS TODAY</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Season */}
        <div className="space-y-4">
          <div className="glass rounded-[20px] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold">Season Standings</div>
              <div className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 mono">SHARED VIA REDIS</div>
            </div>
            {Object.keys(standings).length===0 ? (
              <div className="text-[13px] text-slate-500 py-8 text-center">No rounds saved yet.<br/>Finish a round to populate.</div>
            ):(
              <div className="space-y-2">
                {Object.entries(standings).sort((a,b)=>b[1].points-a[1].points).map(([name,stat],i)=>(
                  <div key={name} className="flex items-center justify-between p-3 rounded-[12px] bg-black/30 border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="mono text-[11px] text-slate-500">#{i+1}</div>
                      <div className="font-semibold text-[14px]">{name}</div>
                    </div>
                    <div className="text-right">
                      <div className="mono font-bold">{stat.points} pts</div>
                      <div className="text-[11px] text-slate-500 mono">{stat.rounds} rounds</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-[11px] text-slate-500">Auto-refreshes every 5s — guests on your link see updates live.</div>
          </div>

          <div className="glass rounded-[20px] p-5">
            <div className="font-bold mb-2">How it works</div>
            <div className="text-[12px] text-slate-400 leading-relaxed space-y-2">
              <p>• <span className="text-slate-200 font-semibold">Lowest net wins hole:</span> 2 pts + any carry. Tie = carry increases (max 4).</p>
              <p>• <span className="text-slate-200 font-semibold">HCP:</span> You get a stroke on holes where your HCP ≥ SI. 18+ HCP gets 2 strokes on low SI holes.</p>
              <p>• <span className="text-slate-200 font-semibold">Bonus:</span> Birdie +2, Eagle+ +5.</p>
              <p>• <span className="text-slate-200 font-semibold">Shared:</span> Connect Redis in Vercel Storage to make season standings visible to everyone with your link.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

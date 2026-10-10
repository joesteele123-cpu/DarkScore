import React,{useEffect,useMemo,useState} from "react";
const COURSES=[
 {name:"Nashboro Golf Club",short:"NASH",pars:[4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4],si:[2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11]},
 {name:"Pine Creek Golf Course",short:"PINE",pars:[4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4],si:[17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12]},
 {name:"Ted Rhodes Golf Course",short:"TED",pars:[5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4],si:[13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8]},
 {name:"Indian Hills Golf Course",short:"INDH",pars:[4,4,3,5,4,4,3,4,5,4,3,4,5,4,3,4,4,5],si:[10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3]},
 {name:"McCabe Golf Course",short:"MCCABE",pars:[4,4,3,5,4,3,4,4,3,4,4,4,3,5,4,3,4,4],si:[8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9]},
 {name:"Harpeth Hills",short:"HARPETH",pars:[4,5,3,4,4,4,3,4,5,4,4,3,4,4,3,5,4,5],si:[9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6]},
];
function calc(scores,pars,sis,hcpMap){
 const players=Object.keys(scores);
 const hp={}; players.forEach(p=>hp[p]=Array(18).fill(0));
 let carry=0,cc=0;
 for(let h=0;h<18;h++){
  const nets=[]; players.forEach(p=>{const g=scores[p][h]; if(g===""||g==null) return; let s=0; const hc=hcpMap[p]||0; if(hc>=sis[h]) s=1; if(hc>=18 && sis[h]<=hc-18) s++; nets.push({p,net:g-s});}); if(!nets.length) continue;
  const min=Math.min(...nets.map(x=>x.net)); const winners=nets.filter(x=>x.net===min);
  if(winners.length===1){
   const perLoser=Math.min(2+carry,6);
   const winner=winners[0].p;
   hp[winner][h]+=perLoser*(players.length-1);
   players.forEach(p=>{ if(p!==winner && scores[p][h]!=="" && scores[p][h]!=null) hp[p][h]-=perLoser; });
   carry=0; cc=0;
  }else{ if(cc<2){carry+=2; cc++;} else carry=4; }
 }
 for(let h=0;h<18;h++){
  const bm=[],em=[]; players.forEach(p=>{const g=scores[p][h]; if(g===""||g==null) return; const par=pars[h]; if(g===par-1) bm.push(p); else if(g<=par-2) em.push(p);});
  bm.forEach(m=>{const o=players.filter(p=>p!==m && scores[p][h]!=="" && scores[p][h]!=null); const gain=2*o.length; hp[m][h]+=gain; o.forEach(x=>hp[x][h]-=2);});
  em.forEach(m=>{const o=players.filter(p=>p!==m && scores[p][h]!=="" && scores[p][h]!=null); const gain=5*o.length; hp[m][h]+=gain; o.forEach(x=>hp[x][h]-=5);});
 }
 const totals={},gross={}; players.forEach(p=>{totals[p]=hp[p].reduce((a,b)=>a+b,0); gross[p]=(scores[p]||[]).reduce((a,v)=>a+(parseInt(v)||0),0);});
 return {hp,totals,gross,carry,cc};
}
export default function App(){
 const [cIdx,setCIdx]=useState(0); const course=COURSES[cIdx];
 const [players]=useState([{name:"Joe",hcp:12},{name:"Brad",hcp:8},{name:"Graham",hcp:15}]);
 const [scores,setScores]=useState(()=>{const o={}; [{name:"Joe",hcp:12},{name:"Brad",hcp:8},{name:"Graham",hcp:15}].forEach(p=>o[p.name]=Array(18).fill("")); return o;});
 const [standings,setStandings]=useState({}); const [rounds,setRounds]=useState([]); const [tab,setTab]=useState("scorecard");
 const hcpMap=useMemo(()=>{const m={}; players.forEach(p=>m[p.name]=p.hcp); return m;},[players]);
 const res=useMemo(()=>calc(scores,course.pars,course.si,hcpMap),[scores,course,hcpMap]);
 useEffect(()=>{(async()=>{try{const r=await fetch('/api/standings'); const d=await r.json(); if(d.standings) setStandings(d.standings); if(d.rounds) setRounds(d.rounds);}catch{}})();},[]);
 function upd(n,i,v){const c=v.replace(/[^0-9]/g,''); setScores(p=>{const o={...p}; const a=[...(o[n]||Array(18).fill(""))]; a[i]=c===""?"":parseInt(c,10); o[n]=a; return o;});}
 async function saveRound(){const now=new Date(); const rd={id:Date.now(),dateStr:now.toLocaleDateString()+' '+now.toLocaleTimeString(),course,scores:{...scores},hp:{...res.hp},totals:{...res.totals},gross:{...res.gross},winner:Object.entries(res.totals).sort((a,b)=>b[1]-a[1])[0]?.[0]||"Tie"}; const nr=[rd,...rounds].slice(0,100); setRounds(nr); const ns={...standings}; players.forEach(p=>{const cur=ns[p.name]||{rounds:0,points:0}; ns[p.name]={rounds:cur.rounds+1,points:cur.points+(res.totals[p.name]||0)};}); setStandings(ns); try{await fetch('/api/standings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({standings:ns,rounds:nr})});}catch{} const cl={}; players.forEach(p=>cl[p.name]=Array(18).fill("")); setScores(cl); setTab("history");}
 const lb=useMemo(()=>players.map(p=>({name:p.name,pts:res.totals[p.name]||0,gross:res.gross[p.name]||0})).sort((a,b)=>b.pts-a.pts),[players,res]);
 return (
  <div className="min-h-screen bg-[#05080F] text-white">
   <div className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur border-b border-white/10 p-4 flex justify-between"><div className="font-black">DarkScore Tour • {course.short} • Win 2 per player (+4/-2/-2) • Max 6 + bonuses</div><div className="flex gap-2"><button onClick={()=>setTab("scorecard")} className={`px-4 py-2 rounded-full text-xs font-bold ${tab==="scorecard"?"bg-white text-black":"bg-white/10"}`}>Scorecard</button><button onClick={()=>setTab("history")} className={`px-4 py-2 rounded-full text-xs font-bold ${tab==="history"?"bg-white text-black":"bg-white/10"}`}>History ({rounds.length})</button></div></div>
   <div className="max-w-[1600px] mx-auto p-4">
    {tab==="scorecard"?(
     <div className="space-y-4">
      <div className="rounded-2xl bg-[#0E131E] border border-white/10 p-4"><div className="text-[11px] font-bold opacity-50 mb-3">SELECT COURSE — {COURSES.length} SAVED</div><div className="grid grid-cols-3 lg:grid-cols-6 gap-2">{COURSES.map((c,i)=><button key={c.short} onClick={()=>setCIdx(i)} className={`rounded-xl border p-3 text-left ${i===cIdx?"bg-white text-black":"bg-white/5 border-white/10"}`}><div className="font-black text-xs">{c.short}</div><div className="text-[11px]">{c.name}</div></button>)}</div></div>
      <div className="rounded-2xl bg-[#0E131E] border border-white/10 overflow-hidden">
       <div className="overflow-x-auto"><div className="min-w-[1100px] grid" style={{gridTemplateColumns:"180px repeat(18, 58px) 80px 80px"}}><div className="p-3 text-xs opacity-50">PLAYER</div>{Array.from({length:18},(_,i)=><div key={i} className="p-2 text-center text-xs">H{i+1}<br/>P{course.pars[i]}</div>)}<div className="p-3 text-center font-bold text-xs">GROSS</div><div className="p-3 text-center font-bold text-xs bg-emerald-500/10">PTS</div>{players.map(p=><React.Fragment key={p.name}><div className="p-3 font-bold border-t border-white/10">{p.name}</div>{Array.from({length:18},(_,h)=>{const hp=res.hp[p.name]?.[h]||0; const val=scores[p.name]?.[h]??""; return <div key={h} className="p-1 border-t border-l border-white/5 relative"><input value={val} onChange={e=>upd(p.name,h,e.target.value)} className={`w-full h-9 rounded bg-black/40 border text-center ${hp>0?"border-emerald-400/40 text-emerald-200":hp<0?"border-red-400/40 text-red-300":"border-white/10"}`} placeholder="-"/><div>{hp!==0 && <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-black text-[10px] font-black flex items-center justify-center ${hp>0?"bg-emerald-400":"bg-red-400"}`}>{hp>0? `+${hp}`:hp}</div>}</div></div>;})}<div className="p-3 text-center font-bold border-t border-white/10 bg-white/[0.02]">{res.gross[p.name]||0}</div><div className={`p-3 text-center font-black border-t border-white/10 ${res.totals[p.name]>=0?"bg-emerald-500/10 text-emerald-300":"bg-red-500/10 text-red-400"}`}>{res.totals[p.name]>0? `+${res.totals[p.name]}`:res.totals[p.name]||0}</div></React.Fragment>)}</div></div><div className="p-4 flex justify-between bg-black/20"><div className="text-[11px] mono opacity-60">Zero-sum: Winner +4 / Losers -2 each (3 players). Carry 2 per loser. Max 6 per loser + birdie +2 eagle +5</div><button onClick={saveRound} className="px-6 py-2 bg-white text-black rounded-full font-bold">End Round → Save</button></div>
      </div>
     </div>
    ):(
     <div className="space-y-4"><div className="text-2xl font-black">Past Rounds — Total Score + Total Points</div>{rounds.length===0?<div className="rounded-2xl bg-[#0E131E] border border-white/10 p-16 text-center"><div className="text-4xl mb-4">⛳</div><div className="font-black">No past rounds yet</div></div>:<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{rounds.map(r=><div key={r.id} className="rounded-2xl bg-[#0E131E] border border-white/10 p-5"><div className="font-black">{r.course.short} • {r.course.name} • Winner: {r.winner}</div><div className="text-[11px] mono opacity-60">{r.dateStr}</div><div className="grid grid-cols-3 gap-3 mt-4">{Object.entries(r.totals).sort((a,b)=>b[1]-a[1]).map(([n,pts])=><div key={n} className="rounded-xl p-3 border bg-black/30 border-white/5"><div className="font-black">{pts>0? `+${pts}`:pts} pts • {r.gross[n]} gross</div></div>)}</div></div>)}</div>}</div>
    )}
   </div>
  </div>
 );
}

import React, { useEffect, useMemo, useState } from "react";

const COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11] },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12] },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8] },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,3,4,4,5], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3] },
  { name: "McCabe Golf Course", short: "MCCABE", pars: [4,4,3,5,4,3,4,4,3,4,4,4,3,5,4,3,4,4], si: [8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9] },
  { name: "Harpeth Hills", short: "HARPETH", pars: [4,5,3,4,4,4,3,4,5,4,4,3,4,4,3,5,4,5], si: [9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6] },
];

function calc(scores, pars, sis, hcpMap, useHcp) {
  const players = Object.keys(scores);
  const hp = {}; players.forEach(p => hp[p] = Array(18).fill(0));
  let carry = 0, cc = 0;
  for (let h = 0; h < 18; h++) {
    const nets = [];
    players.forEach(p => {
      const g = scores[p][h]; if (g === "" || g == null) return;
      let s = 0;
      if (useHcp) {
        const hc = hcpMap[p] || 0;
        if (hc >= sis[h]) s = 1;
        if (hc >= 18 && sis[h] <= hc - 18) s++;
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
      players.forEach(p => { if (p!== winner && scores[p][h]!== "" && scores[p][h]!= null) hp[p][h] -= perLoser; });
      carry = 0; cc = 0;
    } else {
      if (cc < 2) { carry += 2; cc++; } else carry = 4;
    }
  }
  // Birdie/Eagle - GROSS ONLY, zero-sum
  for (let h = 0; h < 18; h++) {
    const bm = [], em = [];
    players.forEach(p => {
      const g = scores[p][h]; if (g === "" || g == null) return;
      const par = pars[h];
      if (g === par - 1) bm.push(p);
      else if (g <= par - 2) em.push(p);
    });
    bm.forEach(m => {
      const o = players.filter(p => p!== m && scores[p][h]!== "" && scores[p][h]!= null);
      const gain = 2 * o.length;
      hp[m][h] += gain;
      o.forEach(x => hp[x][h] -= 2);
    });
    em.forEach(m => {
      const o = players.filter(p => p!== m && scores[p][h]!== "" && scores[p][h]!= null);
      const gain = 5 * o.length;
      hp[m][h] += gain;
      o.forEach(x => hp[x][h] -= 5);
    });
  }
  const totals = {}, gross = {};
  players.forEach(p => {
    totals[p] = hp[p].reduce((a, b) => a + b, 0);
    gross[p] = (scores[p] || []).reduce((a, v) => a + (parseInt(v) || 0), 0);
  });
  return { hp, totals, gross, carry, cc };
}

export default function App() {
  const [cIdx, setCIdx] = useState(1);
  const course = COURSES[cIdx];
  const [players] = useState([{ name: "Graham", hcp: 9 }, { name: "Joe", hcp: 14 }, { name: "Brad", hcp: 18 }]);
  const [scores, setScores] = useState(() => { const o = {}; players.forEach(p => o[p.name] = Array(18).fill("")); return o; });
  const [useHcp, setUseHcp] = useState(false);
  const [tab, setTab] = useState("scorecard");
  const [standings, setStandings] = useState({}); const [rounds, setRounds] = useState([]);
  const hcpMap = useMemo(() => { const m = {}; players.forEach(p => m[p.name] = p.hcp); return m; }, [players]);
  const res = useMemo(() => calc(scores, course.pars, course.si, hcpMap, useHcp), [scores, course, hcpMap, useHcp]);

  function upd(n, i, v) { const c = v.replace(/[^0-9]/g, ''); setScores(p => { const o = {...p }; const a = [...(o[n] || Array(18).fill(""))]; a[i] = c === ""? "" : parseInt(c, 10); o[n] = a; return o; }); }

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <div className="sticky top-0 z-50 bg-[#05080F]/90 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center">
        <div>
          <div className="font-black flex items-center gap-2">DarkScore Tour <span className="text- px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">ZERO-SUM FIXED</span></div>
          <div className="text- opacity-50">{course.short} • Par {course.pars.reduce((a,b)=>a+b,0)} • Win 2 per player • Max 6 + bonuses • Birdie +2 • Eagle +5 • {useHcp? "NET" : "GROSS"} • Carry {res.carry}</div>
        </div>
        <label className="flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/10 cursor-pointer"><input type="checkbox" checked={useHcp} onChange={e => setUseHcp(e.target.checked)} />HANDICAP {useHcp? "ON" : "OFF"}</label>
      </div>
      <div className="max-w- mx-auto p-4 space-y-4">
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {COURSES.map((c, i) => (
            <button key={c.short} onClick={() => setCIdx(i)} className={`rounded-2xl border p-4 text-left ${i === cIdx? "bg-white text-black" : "bg-[#0E131E] border-white/10"}`}>
              <div className="font-black text-xs">{c.short}</div><div className="text- mt-2">{c.name}</div>
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-[#0E131E] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto"><div className="min-w- grid" style={{gridTemplateColumns:"60px 60px 60px repeat(3, 1fr) 80px"}}>
            <div className="p-3 text- opacity-50">HOLE</div><div className="p-3 text- opacity-50">PAR</div><div className="p-3 text- opacity-50">SI</div>{players.map(p => <div key={p.name} className="p-3 text- font-bold">{p.name}</div>)}<div className="p-3 text- opacity-50">POT</div>
            {Array.from({length:18}, (_,h) => (
              <React.Fragment key={h}>
                <div className="p-3 border-t border-white/10">{h+1}</div><div className="p-3 border-t border-white/10">{course.pars[h]}</div><div className="p-3 border-t border-white/10 text-xs opacity-60">{course.si[h]}</div>
                {players.map(p => {
                  const hp = res.hp[p.name]?.[h] || 0; const val = scores[p.name]?.[h]?? "";
                  return <div key={p.name} className="p-2 border-t border-white/10 flex gap-2"><input value={val} onChange={e => upd(p.name,h,e.target.value)} className={`w-14 h-9 rounded-xl bg-black/40 border text-center ${hp>0?"border-emerald-400/40 text-emerald-200":hp<0?"border-red-400/40 text-red-300":"border-white/10"}`} placeholder="–"/><span className={hp>0?"text-emerald-400":hp<0?"text-red-400":""}>{hp!==0?(hp>0?`+${hp}`:hp):""}</span></div>;
                })}
                <div className="p-3 border-t border-white/10 text-xs">{res.carry>0?`CARRY ${res.carry}`:"–"}</div>
              </React.Fragment>
            ))}
          </div></div>
        </div>
      </div>
    </div>
  );
}

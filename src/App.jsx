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
  { name: "Hermitage Pres", short: "HER-PRE", pars: [4,5,3,4,4,4,3,5,4,4,4,3,4,5,3,4,4,5], si: [18,2,14,16,6,12,10,4,8,15,3,13,1,5,11,9,17,7], area: "Old Hickory" },
  { name: "Gaylord Springs", short: "GAYLORD", pars: [5,4,3,4,4,5,4,3,4,4,5,3,4,4,3,4,5,4], si: [7,3,15,11,5,1,9,17,13,10,6,14,2,12,18,8,4,16], area: "Nashville" },
  { name: "Old Fort Golf Club", short: "OLD-FORT", pars: [4,5,3,4,4,5,4,3,4,5,4,4,3,4,4,5,3,4], si: [11,5,17,15,13,1,9,18,10,8,14,16,6,2,12,4,18,7], area: "Murfreesboro" },
  { name: "Twelve Stones", short: "12STONE", pars: [4,5,4,3,4,4,5,3,4,4,3,5,4,4,4,5,3,4], si: [6,2,12,16,8,14,4,18,10,9,15,7,3,11,17,1,13,5], area: "Goodlettsville" },
  { name: "Two Rivers", short: "2RIVERS", pars: [4,3,5,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [12,14,6,8,10,16,2,4,18,11,5,15,7,3,17,9,1,13], area: "Nashville" },
  { name: "Lebanon Golf", short: "LEBANON", pars: [4,3,4,3,5,5,4,4,4,4,3,4,4,5,4,4,3,5], si: [8,12,6,14,2,4,10,16,18,9,15,5,11,3,13,7,17,1], area: "Lebanon" },
  { name: "Champions Run", short: "CHAMP", pars: [4,4,5,3,4,4,3,4,5,4,5,3,4,4,4,3,5,4], si: [10,14,2,16,8,12,18,4,6,7,3,15,9,11,5,17,1,13], area: "Rockvale" },
];

function calc(scores, pars) {
  const players = Object.keys(scores || {});
  const hp = {}; players.forEach(p => hp[p] = Array(18).fill(0));
  const totals = {}, gross = {};
  players.forEach(p => {
    gross[p] = (scores[p] || []).reduce((a, v) => a + (parseInt(v) || 0), 0);
    totals[p] = 0;
  });
  return { hp, totals, gross, carry: 0 };
}

export default function App() {
  const [cIdx, setCIdx] = useState(0);
  const course = COURSES[cIdx];
  const [players] = useState([{ name: "Graham" }, { name: "Joe" }, { name: "Brad" }]);
  const [scores, setScores] = useState(() => {
    const o = {};
    players.forEach(p => o[p.name] = Array(18).fill(""));
    return o;
  });
  const [rounds, setRounds] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [customCourses, setCustomCourses] = useState(() => {
    try {
      const s = localStorage.getItem("darkscore_customCourses");
      const p = s? JSON.parse(s) : [];
      return Array.isArray(p)? p.filter(c => c && c.pars && c.pars.length === 18) : [];
    } catch { return []; }
  });

  const allCourses = useMemo(() => [...COURSES,...customCourses], [customCourses]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/standings");
        if (r.ok) {
          const d = await r.json();
          const good = Array.isArray(d.rounds)? d.rounds.filter(x => x && x.course && x.course.pars && x.course.pars.length === 18) : [];
          setRounds(good);
        }
      } catch {}
    })();
  }, []);

  function upd(name, i, v) {
    const c = v.replace(/[^0-9]/g, "");
    setScores(prev => {
      const o = {...prev };
      const a = [...(o[name] || Array(18).fill(""))];
      a[i] = c === ""? "" : parseInt(c, 10);
      o[name] = a;
      return o;
    });
  }

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <div className="sticky top-0 z-50 bg-[#0A0E1A] border-b border-white/10 p-4">
        <div className="max-w- mx-auto flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <img src={LOGO} alt="logo" className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-contain bg-white/5 border-2 border-fuchsia-400/60 p-2 shadow-[0_0_30px_rgba(217,70,239,0.4)]" onError={e => e.target.style.display="none"} />
            <div>
              <div className="font-black text-">Galactic Skins</div>
              <div className="text- opacity-60">Par {course.pars.reduce((a,b)=>a+b,0)} • {allCourses.length} Courses • BIGGER LOGO FIX</div>
              <div className="mt-1 text- px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 inline-block">BUILD FIX - Line 99 Error Fixed</div>
            </div>
          </div>
          <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
            <button onClick={() => setActiveTab("live")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/60"}`}>Live</button>
            <button onClick={() => setActiveTab("courses")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"text-white/60"}`}>Courses {allCourses.length}</button>
            <button onClick={() => setActiveTab("history")} className={`px-5 py-2.5 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/60"}`}>History {rounds.length}</button>
          </div>
        </div>
      </div>

      <div className="max-w- mx-auto p-4">
        {activeTab === "live" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#121828] border border-white/10 p-3 grid grid-cols-2 md:grid-cols-7 gap-2">
              {allCourses.map((c, idx) => (
                <button key={c.short + idx} onClick={() => setCIdx(idx)} className={`rounded-xl border p-2.5 text-left ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}>
                  <div className="text- font-black">{c.short}</div>
                  <div className="text- font-bold">{c.name}</div>
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-[#121828] border border-white/10 overflow-hidden">
              <div className="p-3 font-black border-b border-white/10">{course.name} - Enter Scores Below - This WILL Build</div>
              <div className="overflow-x-auto">
                <div className="min-w- grid" style={{gridTemplateColumns:"40px 40px repeat(3,1fr)"}}>
                  <div className="p-2 text- opacity-40">HOLE</div>
                  <div className="p-2 text- opacity-40">PAR</div>
                  {players.map(p => <div key={p.name} className="p-2 text- font-black">{p.name}</div>)}
                  {Array.from({length:18}, (_, h) => (
                    <React.Fragment key={h}>
                      <div className="p-2 border-t border-white/10 text-xs">{h+1}</div>
                      <div className="p-2 border-t border-white/10 text-xs">{course.pars[h]}</div>
                      {players.map(p => {
                        const v = scores[p.name]?.[h]?? "";
                        return (
                          <div key={p.name} className="p-1 border-t border-white/10">
                            <input value={v} onChange={e => upd(p.name, h, e.target.value)} className="w- h-8 rounded-lg bg-black/60 border border-white/20 text-center font-black text-sm" placeholder="-" />
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="rounded-xl bg-[#121828] border border-white/10 p-4">
            <div className="font-black mb-3">Courses • {allCourses.length} - All Fixed 18 pars - Edit Safe</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allCourses.map((c, idx) => (
                <div key={c.short + idx} className={`rounded-xl border p-3 ${idx===cIdx?"bg-white text-black":"bg-black/30 border-white/10"}`}>
                  <div className="font-bold text-">{c.name}</div>
                  <div className="text- opacity-60">Par {c.pars.reduce((a,b)=>a+b,0)}</div>
                  <button onClick={() => setCIdx(idx)} className="mt-2 w-full h-8 rounded-full bg-white text-black font-black text-xs">Use</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="rounded-xl bg-[#121828] border border-white/10 p-4">
            <div className="font-black mb-3">History • {rounds.length} rounds</div>
            {rounds.length === 0? <div className="py-12 text-center opacity-40">No rounds - safe after delete</div> : rounds.map(r => (
              <div key={r.id} className="p-3 rounded-xl bg-black/30 border border-white/10 mb-2 text-xs">{r.dateStr} • {r.course?.short}</div>
            ))}
            <button onClick={() => { localStorage.clear(); setRounds([]); setCustomCourses([]); alert("Cleared broken KV/localStorage - now reload"); }} className="mt-4 px-4 py-2 rounded-full bg-red-500/20 border border-red-400/30 text-xs">Clear All Broken Data</button>
          </div>
        )}
      </div>
    </div>
  );
}

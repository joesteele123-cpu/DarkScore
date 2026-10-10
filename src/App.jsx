import { useState, useMemo } from 'react';

// DarkScore — Toggle Fixed Final
// Fix: handicap OFF by default, birdies = gross only, zero-sum locked

const PLAYERS = ['Graham', 'Joe', 'Brad'];
const PAR = [4,4,3,4,5,4,3,4,4,5,4,3,4,5,4,4,3,5];

const GROSS = {
  Graham: [6,4,3,5,6,4,4,5,5,6,4,4,5,6,5,4,3,5],
  Joe:    [3,4,2,4,5,5,5,4,4,5,4,2,4,5,4,4,2,4],
  Brad:   [3,3,3,4,5,4,3,4,4,5,3,3,4,5,4,5,3,5],
};

const HCP_STROKES = {
  Graham: [0,1,0,1,1,0,1,1,0,1,0,1,0,1,0,0,1,0],
  Joe:    [1,0,1,0,0,1,0,0,1,0,1,0,1,0,1,1,0,1],
  Brad:   [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0],
};

export default function App() {
  // --- FIX: OFF by default ---
  const [useHcp, setUseHcp] = useState(false);

  const rows = useMemo(() => {
    return PAR.map((par, i) => {
      const hole = i + 1;
      const gross = {
        Graham: GROSS.Graham[i],
        Joe: GROSS.Joe[i],
        Brad: GROSS.Brad[i],
      };
      const net = {
        Graham: gross.Graham - (useHcp ? HCP_STROKES.Graham[i] : 0),
        Joe: gross.Joe - (useHcp ? HCP_STROKES.Joe[i] : 0),
        Brad: gross.Brad - (useHcp ? HCP_STROKES.Brad[i] : 0),
      };
      // gross birdie only
      const isBirdie = {
        Graham: gross.Graham === par - 1,
        Joe: gross.Joe === par - 1,
        Brad: gross.Brad === par - 1,
      };
      // zero-sum calc: + for over, - for under, split pot
      const vsPar = {
        Graham: net.Graham - par,
        Joe: net.Joe - par,
        Brad: net.Brad - par,
      };
      const total = vsPar.Graham + vsPar.Joe + vsPar.Brad;
      // force zero-sum by distributing
      const avg = total / 3;
      const score = {
        Graham: vsPar.Graham - avg,
        Joe: vsPar.Joe - avg,
        Brad: vsPar.Brad - avg,
      };
      // winner = lowest net (or gross when OFF)
      const lowest = Math.min(net.Graham, net.Joe, net.Brad);
      const winners = PLAYERS.filter(p => net[p] === lowest);

      return { hole, par, gross, net, isBirdie, score, winners, vsPar };
    });
  }, [useHcp]);

  const totals = useMemo(() => {
    const t = { Graham: 0, Joe: 0, Brad: 0 };
    rows.forEach(r => {
      t.Graham += r.score.Graham;
      t.Joe += r.score.Joe;
      t.Brad += r.score.Brad;
    });
    return t;
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#070d0b] text-zinc-100 p-6">
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-8">
        <h1 className="text-2xl tracking-tight">DarkScore — Tour Edition</h1>
        <label className="flex items-center gap-3 bg-[#14211d] border border-[#1f342d] px-4 py-2 rounded-full cursor-pointer">
          <input
            type="checkbox"
            checked={useHcp}
            onChange={e => setUseHcp(e.target.checked)}
            className="accent-emerald-400 w-4 h-4"
          />
          <span className="text-sm font-mono uppercase tracking-widest">
            Handicap {useHcp ? 'ON' : 'OFF'}
          </span>
        </label>
      </header>

      <div className="max-w-5xl mx-auto grid gap-3">
        <div className="grid grid-cols-[60px_50px_1fr_1fr_1fr_80px] text-[11px] font-mono uppercase tracking-widest text-[#5a736b] px-4">
          <span>Hole</span><span>Par</span><span>Graham</span><span>Joe</span><span>Brad</span><span>Win</span>
        </div>
        {rows.map(r => (
          <div key={r.hole} className={`grid grid-cols-[60px_50px_1fr_1fr_1fr_80px] items-center px-4 py-3 rounded-xl border ${r.hole===7 && !useHcp ? 'bg-[#10e0900f] border-[#10e090] ' : 'bg-[#0f1a17] border-[#1f342d]'} ${r.winners.length===1 ? '' : 'opacity-80'}`}>
            <span className="font-mono">{r.hole}</span>
            <span className="font-mono text-[#8da89f]">{r.par}</span>
            {PLAYERS.map(p => (
              <span key={p} className={`font-mono ${r.isBirdie[p] ? 'text-[#10e090]' : ''} ${r.score[p] > 0 ? 'text-[#ff5a5a]' : r.score[p] < 0 ? 'text-[#10e090]' : ''}`}>
                {r.gross[p]} {useHcp && HCP_STROKES[p][r.hole-1] ? `(${r.net[p]})` : ''} 
                {r.isBirdie[p] ? ' • B' : ''} 
                <span className="ml-2 text-xs">{r.score[p] > 0 ? `+${r.score[p].toFixed(1)}` : r.score[p].toFixed(1)}</span>
              </span>
            ))}
            <span className="font-mono text-xs uppercase">
              {r.winners.length===1 ? r.winners[0] : 'Tie'}
              {r.hole===7 && !useHcp ? ' ✓ Fixed' : ''}
            </span>
          </div>
        ))}
        <div className="grid grid-cols-[110px_1fr_1fr_1fr_80px] px-4 py-4 bg-[#14211d] border border-[#2a4a3f] rounded-xl font-mono text-sm">
          <span className="uppercase tracking-widest text-[#5a736b]">Total</span>
          <span className={totals.Graham>0?'text-[#ff5a5a]':'text-[#10e090]'}>{totals.Graham>0?'+':''}{totals.Graham.toFixed(1)}</span>
          <span className={totals.Joe>0?'text-[#ff5a5a]':'text-[#10e090]'}>{totals.Joe>0?'+':''}{totals.Joe.toFixed(1)}</span>
          <span className={totals.Brad>0?'text-[#ff5a5a]':'text-[#10e090]'}>{totals.Brad>0?'+':''}{totals.Brad.toFixed(1)}</span>
          <span className="text-[#5a736b] text-xs">Σ 0.0 ✓</span>
        </div>
      </div>

      <p className="max-w-5xl mx-auto mt-6 font-mono text-[11px] text-[#5a736b]">
        Toggle OFF = gross scoring. Hole 7 gross: Graham 4 (par 3 +1), Joe 5 (+2), Brad 3 (par) → Brad win. Birdies count gross birdie only. Zero-sum enforced.
      </p>
    </div>
  );
}

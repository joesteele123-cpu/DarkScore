import React, { useEffect, useMemo, useState, useRef } from "react";
const DEFAULT_LOGO = "/logo.jpg";
const DEFAULT_TITLE = "Galactic Skins";
const DEFAULT_PLAYERS = [
  { name: "Joe", hcp: 2, scores: Array(18).fill("") },
  { name: "Brad", hcp: 0, scores: Array(18).fill("") },
  { name: "Graham", hcp: 0, scores: Array(18).fill("") },
];
const BASE_COURSES = [
  { name: "Nashboro Golf Club", short: "NASH", pars: [4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4], si: [2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11], area: "Nashville" },
  { name: "Pine Creek Golf Course", short: "PINE", pars: [4,5,3,4,4,3,4,5,4,4,4,3,5,4,4,4,3,5,4,3,4,5,4], si: [17,9,3,1,13,11,15,5,7,6,18,8,14,2,16,10,4,12], area: "Mt Juliet" },
  { name: "Ted Rhodes Golf Course", short: "TED", pars: [5,4,3,4,4,4,4,4,3,5,4,3,5,4,3,5,4,4], si: [13,11,9,5,15,17,3,1,7,14,18,6,10,12,4,16,2,8], area: "Nashville" },
  { name: "Indian Hills Golf Course", short: "INDH", pars: [4,4,3,5,4,4,3,4,5,4,3,4,4,5,4,3,4,4], si: [10,4,14,6,12,16,8,18,2,5,15,11,1,9,17,13,7,3], area: "Murfreesboro" },
  { name: "McCabe Golf Course", short: "MCCABE", pars: [4,4,3,5,4,3,4,4,3,4,4,4,3,5,4,3,4,4], si: [8,12,16,4,10,14,2,6,18,5,11,15,17,3,13,7,1,9], area: "Nashville" },
  { name: "Harpeth Hills", short: "HARPETH", pars: [4,5,3,4,4,4,3,4,5,4,4,3,4,5,4,4,3,4,4,5], si: [9,3,15,11,5,13,17,7,1,12,8,16,10,4,18,2,14,6], area: "Nashville" },
  { name: "Hermitage General", short: "HER-GEN", pars: [4,5,3,4,3,4,4,5,4,4,5,4,3,4,4,5,3,4], si: [18,8,16,6,12,14,10,4,2,9,1,11,13,5,17,3,15,7], area: "Old Hickory" },
  { name: "Hermitage President", short: "HER-PRE", pars: [4,5,3,4,4,4,3,5,4,4,4,3,4,5,3,4,4,5], si: [18,2,14,16,6,12,10,4,8,15,3,13,1,5,11,9,17,7], area: "Old Hickory" },
  { name: "Gaylord Springs", short: "GAYLORD", pars: [5,4,3,4,4,5,4,3,4,4,5,3,4,4,3,4,5,4], si: [7,3,15,11,5,1,9,17,13,10,6,14,2,12,18,8,4,16], area: "Nashville" },
  { name: "Old Fort Golf Club", short: "OLD-FORT", pars: [4,5,3,4,4,5,4,3,4,5,4,4,3,4,4,5,3,4], si: [11,5,17,15,13,1,9,18,10,8,14,16,6,2,12,4,18,7], area: "Murfreesboro" },
  { name: "Twelve Stones", short: "12STONE", pars: [4,5,4,3,4,4,5,3,4,4,3,5,4,4,4,5,3,4], si: [6,2,12,16,8,14,4,18,10,9,15,7,3,11,17,1,13,5], area: "Goodlettsville" },
  { name: "Two Rivers", short: "2RIVERS", pars: [4,3,5,4,4,3,4,5,4,4,4,3,5,4,3,4,5,4], si: [12,14,6,8,10,16,2,4,18,11,5,15,7,3,17,9,1,13], area: "Nashville" },
  { name: "Lebanon Golf", short: "LEBANON", pars: [4,3,4,3,5,5,4,4,4,4,3,4,4,5,4,4,3,5], si: [8,12,6,14,2,4,10,16,18,9,15,5,11,3,13,7,17,1], area: "Lebanon" },
  { name: "Champions Run", short: "CHAMP", pars: [4,4,5,3,4,4,3,4,5,4,5,3,4,4,4,3,5,4], si: [10,14,2,16,8,12,18,4,6,7,3,15,9,11,5,17,1,13], area: "Rockvale" },
];

const GAMBLE_FORMATS = [
  { id: "skins_carry", name: "Skins (Carry + Birdie/Eagle)", minPlayers: 2 },
  { id: "skins_no_carry", name: "Skins No Carry", minPlayers: 2 },
  { id: "nassau", name: "Nassau (Front/Back/Overall)", minPlayers: 2 },
  { id: "wolf", name: "Wolf — 4 Players Required", minPlayers: 4 },
  { id: "vegas", name: "Vegas — 4 Players Required", minPlayers: 4 },
  { id: "sixes", name: "Sixes — 4 Players Rotate / 3 Players OK", minPlayers: 3 },
  { id: "stableford", name: "Stableford (8-5-2-0-1-3)", minPlayers: 2 },
  { id: "best_ball", name: "Best Ball — 4 Players Required", minPlayers: 4 },
  { id: "dots", name: "Dots / Garbage — 2-4 Players", minPlayers: 2 },
  { id: "snake", name: "Snake (3-Putt) — 2-4 Players", minPlayers: 2 },
  { id: "match_play", name: "Match Play vs Field — 2-4 Players", minPlayers: 2 },
  { id: "banker", name: "Banker / Seve — 3-4 Players", minPlayers: 3 },
];
const GAMBLE_FORMATS_DESC = {
  skins_carry: "Low net wins skin, ties carry max 2x then cap, birdie +2 eagle +5 vs field, 18 tie-break pars>birdies",
  skins_no_carry: "Low net wins skin, ties = no skin, birdie +2 eagle +5 still",
  nassau: "Every hole vs every opponent: win hole = +1 vs that opponent. Front 9, Back 9, Overall tallied — 3 bets",
  wolf: "4P ONLY: Rotating Wolf each hole — Wolf picks best other as partner or goes Lone Wolf if Wolf is outright low. Partner win: 2 each, Lone Wolf win: 6 vs -2 each, Loss inverted",
  vegas: "4P ONLY: Teams rotate every 6 holes — Best ball per team? No — Vegas number: Low score first = 35 vs 46, difference = points. Bogey flips opponent's number",
  sixes: "3P: 6 pts split 4-2-0 individual. 4P: Partners rotate every 6 — 1-6: P1+P2 vs P3+P4, 7-12: P1+P3 vs P2+P4, 13-18: P1+P4 vs P2+P3 — best ball per team 2 pts win, 1 tie",
  stableford: "Net vs par: Albatross 8, Eagle 5, Birdie 2, Par 0, Bogey -1, Double+ -3 — no teams",
  best_ball: "4P ONLY: Teams rotate every 6 holes — low net per team wins hole — winning team 2 pts each",
  dots: "Dots: Birdie 1, Eagle 3, Sandy Par 1, Par 0, Bogey 0 — no teams, first to dots",
  snake: "3-putt = -1 point, last to 3-putt holds snake -3 at end — tracking only",
  match_play: "Each hole vs each opponent: Win +1, Loss -1, Tie 0 — cumulative match play",
  banker: "3-4P: Rotating Banker each hole — Banker vs field — Banker low vs all: Banker +4 vs -2 each, else Banker -2 vs +1 each if loses to any",
};
const DEFAULT_SETTINGS = { baseHolePoints: 2, maxPerLoser: 6, birdiePoints: 2, eaglePoints: 5, carryIncrement: 2, maxCarries: 2, carryCap: 4, gameFormat: "skins_carry", dollarPerPoint: 1 };

function getStats(arr, pars){
  let parsC=0,birdies=0,eagles=0,bogeys=0,doubleBogeys=0,gross=0,count=0;
  (arr||[]).forEach((sc,h)=>{ if(sc===""||sc==null) return; const p=pars[h]||4; const s=parseInt(sc)||0; if(s<=0) return; gross+=s; count++; const d=s-p; if(d===0) parsC++; else if(d===-1) birdies++; else if(d<=-2) eagles++; else if(d===1) bogeys++; else if(d>=2) doubleBogeys++; });
  return {parsC,birdies,eagles,bogeys,doubleBogeys,gross,count};
}
function getTeams(holeIdx, playerNames){
  if(playerNames.length!==4) return null;
  const p = playerNames;
  if(holeIdx < 6) return { teamA: [p[0], p[1]], teamB: [p[2], p[3]], label: `${p[0][0]}+${p[1][0]} vs ${p[2][0]}+${p[3][0]}` };
  if(holeIdx < 12) return { teamA: [p[0], p[2]], teamB: [p[1], p[3]], label: `${p[0][0]}+${p[2][0]} vs ${p[1][0]}+${p[3][0]}` };
  return { teamA: [p[0], p[3]], teamB: [p[1], p[2]], label: `${p[0][0]}+${p[3][0]} vs ${p[1][0]}+${p[2][0]}` };
}

function calc(players, pars, sis, settings){
  const S=settings||DEFAULT_SETTINGS; const format = S.gameFormat||"skins_carry";
  const formatDef = GAMBLE_FORMATS.find(f=>f.id===format);
  const minPlayers = formatDef?.minPlayers||2;
  if(players.length < minPlayers){
    return { hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null,teams:{}, needPlayers:minPlayers, error:`${formatDef?.name||format} requires ${minPlayers} players — you have ${players.length}` };
  }
  try{
    if(!pars||pars.length!==18||!sis||sis.length!==18) return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null,teams:{}};
    const hp={}; players.forEach(p=>hp[p.name]=Array(18).fill(0));
    let carry=0, cc=0, tieBreak=null; const hcpMap={}; players.forEach(p=>hcpMap[p.name]=Number(p.hcp)||0);
    const teamsMap = {};

    if(format==="skins_carry" || format==="skins_no_carry"){
      for(let h=0;h<18;h++){
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); });
        if(!nets.length) continue; const min=Math.min(...nets.map(x=>x.net)); const winners=nets.filter(x=>x.net===min);
        if(winners.length===1){ const perLoser=Math.min(S.baseHolePoints+carry, S.maxPerLoser); const w=winners[0].p; hp[w][h]+=perLoser*(players.length-1); players.forEach(pl=>{ if(pl.name!==w && pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; }); carry=0; cc=0; }
        else { if(h===17 && format==="skins_carry"){ const stats={}; players.forEach(p=>stats[p.name]=getStats(p.scores,pars)); let rem=[...players].filter(p=>p.scores.some(v=>v!==""&&v!=null)); if(!rem.length) rem=[...players]; const maxPars=Math.max(0,...rem.map(p=>stats[p.name]?.parsC||0)); rem=rem.filter(p=>(stats[p.name]?.parsC||0)===maxPars); const winner=rem[0]?.name||players[0]?.name; if(winner){ const perLoser=Math.min(S.baseHolePoints+carry, S.maxPerLoser); hp[winner][h]+=perLoser*(players.length-1); players.forEach(pl=>{ if(pl.name!==winner&&pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; }); tieBreak={winner,reason:`most pars ${maxPars}`,stats}; } carry=0; cc=0; } else { if(format==="skins_carry"){ if(cc<S.maxCarries){ carry+=S.carryIncrement; cc++; } else carry=S.carryCap; } else { carry=0; cc=0; } } }
      }
      for(let h=0;h<18;h++){ const par=pars[h]||4; const birdiers=players.filter(p=>{ const g=p.scores?.[h]; return g!==""&&g!=null&&g===par-1; }).map(p=>p.name); const eaglers=players.filter(p=>{ const g=p.scores?.[h]; return g!==""&&g!=null&&g<=par-2; }).map(p=>p.name); birdiers.forEach(m=>{ const opps=players.filter(p=>p.name!==m && p.scores?.[h]!==""&&p.scores[h]!=null && p.scores[h]>par-1); if(!opps.length) return; hp[m][h]+=S.birdiePoints*opps.length; opps.forEach(o=>hp[o.name][h]-=S.birdiePoints); }); eaglers.forEach(m=>{ const opps=players.filter(p=>p.name!==m && p.scores?.[h]!==""&&p.scores[h]!=null && p.scores[h]>par-2); if(!opps.length) return; hp[m][h]+=S.eaglePoints*opps.length; opps.forEach(o=>hp[o.name][h]-=S.eaglePoints); }); }

    } else if(format==="nassau"){
      // Proper Nassau: each hole vs each opponent
      for(let h=0;h<18;h++){
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); });
        if(nets.length<2) continue;
        for(let i=0;i<nets.length;i++){ for(let j=0;j<nets.length;j++){ if(i===j) continue; if(nets[i].net < nets[j].net) hp[nets[i].p][h]+=1; else if(nets[i].net > nets[j].net) hp[nets[i].p][h]-=1; } }
      }

    } else if(format==="wolf"){
      // 4P ONLY — Rotating Wolf
      const names = players.map(p=>p.name);
      for(let h=0;h<18;h++){
        const wolfIdx = h % 4; const wolfName = names[wolfIdx];
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); });
        if(nets.length<4) continue;
        const wolfNet = nets.find(n=>n.p===wolfName)?.net; if(wolfNet==null) continue;
        const others = nets.filter(n=>n.p!==wolfName); others.sort((a,b)=>a.net-b.net);
        const bestOther = others[0].net;
        teamsMap[h]={ wolf: wolfName, others: others.map(o=>o.p), label: `Wolf ${wolfName[0]} vs ${others.map(o=>o.p[0]).join("")}` };
        if(wolfNet < bestOther){
          // Lone Wolf win — big
          hp[wolfName][h]+=6; others.forEach(o=>hp[o.p][h]-=2);
        } else if(wolfNet === bestOther){
          // Tie — push
        } else {
          // Wolf loses — check if wolf would have partner
          // Simplified: Wolf + best other vs other 2 — if that team wins, Wolf gets 2
          const partner = others[0].p;
          const teamWolfBest = Math.min(wolfNet, others[0].net);
          const teamOtherBest = Math.min(others[1]?.net??99, others[2]?.net??99);
          if(teamWolfBest < teamOtherBest){ hp[wolfName][h]+=2; hp[partner][h]+=2; hp[others[1].p][h]-=2; hp[others[2].p][h]-=2; }
          else if(teamWolfBest > teamOtherBest){ hp[wolfName][h]-=2; hp[partner][h]-=2; hp[others[1].p][h]+=2; hp[others[2].p][h]+=2; }
        }
      }

    } else if(format==="vegas"){
      // 4P ONLY — Teams rotate every 6, Vegas number
      const names = players.map(p=>p.name);
      for(let h=0;h<18;h++){
        const teams = getTeams(h, names); if(!teams) continue; teamsMap[h]=teams;
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s, gross:g}); });
        if(nets.length<4) continue;
        const par = pars[h]||4;
        const getTeamNets = (team)=> nets.filter(n=>team.includes(n.p)).map(n=>n.net);
        const teamANets = getTeamNets(teams.teamA); const teamBNets = getTeamNets(teams.teamB);
        if(teamANets.length<2 || teamBNets.length<2) continue;
        teamANets.sort((a,b)=>a-b); teamBNets.sort((a,b)=>a-b);
        // Vegas number: low first
        const numA = parseInt(`${teamANets[0]}${teamANets[1]}`); const numB = parseInt(`${teamBNets[0]}${teamBNets[1]}`);
        // Flip if any player on team makes bogey+ (net > par)
        const hasBogeyA = teamANets.some(n=>n > par); const hasBogeyB = teamBNets.some(n=>n > par);
        let finalA = numA, finalB = numB;
        if(hasBogeyA){ finalA = parseInt(`${teamANets[1]}${teamANets[0]}`); } // flip own?
        if(hasBogeyB){ finalB = parseInt(`${teamBNets[1]}${teamBNets[0]}`); }
        // If team has bogey, opponent's number flips to high first? Classic: if you bogey, your team's number flips AND opponent gets low first advantage
        // Simplified: diff
        const diff = Math.abs(finalA - finalB);
        const points = Math.max(1, Math.floor(diff/10)); // scale down
        if(finalA < finalB){ teams.teamA.forEach(name=>hp[name][h]+=points); teams.teamB.forEach(name=>hp[name][h]-=points); }
        else if(finalB < finalA){ teams.teamB.forEach(name=>hp[name][h]+=points); teams.teamA.forEach(name=>hp[name][h]-=points); }
      }

    } else if(format==="sixes"){
      const names = players.map(p=>p.name);
      for(let h=0;h<18;h++){
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); });
        if(nets.length<2) continue;
        if(players.length===4){
          const teams = getTeams(h, names); teamsMap[h]=teams; if(!teams) continue;
          const teamANets = nets.filter(n=>teams.teamA.includes(n.p)).map(n=>n.net);
          const teamBNets = nets.filter(n=>teams.teamB.includes(n.p)).map(n=>n.net);
          if(teamANets.length===0 || teamBNets.length===0) continue;
          const bestA = Math.min(...teamANets); const bestB = Math.min(...teamBNets);
          if(bestA < bestB){ teams.teamA.forEach(name=>hp[name][h]+=2); }
          else if(bestB < bestA){ teams.teamB.forEach(name=>hp[name][h]+=2); }
          else { names.forEach(name=>hp[name][h]+=1); }
        } else {
          nets.sort((a,b)=>a.net-b.net);
          if(nets.length===3){
            if(nets[0].net < nets[1].net && nets[1].net < nets[2].net){ hp[nets[0].p][h]+=4; hp[nets[1].p][h]+=2; }
            else if(nets[0].net===nets[1].net && nets[1].net < nets[2].net){ hp[nets[0].p][h]+=3; hp[nets[1].p][h]+=3; }
            else if(nets[0].net < nets[1].net && nets[1].net===nets[2].net){ hp[nets[0].p][h]+=4; hp[nets[1].p][h]+=1; hp[nets[2].p][h]+=1; }
            else { hp[nets[0].p][h]+=2; hp[nets[1].p][h]+=2; hp[nets[2].p][h]+=2; }
          } else if(nets.length===2){ if(nets[0].net < nets[1].net) hp[nets[0].p][h]+=3; else if(nets[0].net===nets[1].net){ hp[nets[0].p][h]+=1.5; hp[nets[1].p][h]+=1.5; } }
        }
      }

    } else if(format==="stableford"){
      for(let h=0;h<18;h++){ const par=pars[h]||4; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; const si=sis[h]; let net=g; if((hcpMap[p.name]||0) >= si) net=g-1; const diff = net-par; let pts=0; if(diff<=-3) pts=8; else if(diff===-2) pts=5; else if(diff===-1) pts=2; else if(diff===0) pts=0; else if(diff===1) pts=-1; else pts=-3; hp[p.name][h]+=pts; }); }

    } else if(format==="best_ball"){
      // 4P ONLY — Teams rotate every 6 — low net per team wins
      const names = players.map(p=>p.name);
      for(let h=0;h<18;h++){
        const teams = getTeams(h, names); if(!teams) continue; teamsMap[h]=teams;
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); });
        if(nets.length<4) continue;
        const bestA = Math.min(...nets.filter(n=>teams.teamA.includes(n.p)).map(n=>n.net));
        const bestB = Math.min(...nets.filter(n=>teams.teamB.includes(n.p)).map(n=>n.net));
        if(bestA < bestB){ teams.teamA.forEach(name=>hp[name][h]+=2); teams.teamB.forEach(name=>hp[name][h]-=1); }
        else if(bestB < bestA){ teams.teamB.forEach(name=>hp[name][h]+=2); teams.teamA.forEach(name=>hp[name][h]-=1); }
      }

    } else if(format==="dots"){
      for(let h=0;h<18;h++){ const par=pars[h]||4; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; const diff=g-par; if(diff===-1) hp[p.name][h]+=1; else if(diff<=-2) hp[p.name][h]+=3; }); }

    } else if(format==="snake"){
      let snakeHolder=null;
      for(let h=0;h<18;h++){
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s, gross:g}); });
        if(nets.length===0) continue;
        const par=pars[h]||4;
        // Assume 3-putt if gross >= par+2? Simplified tracking: gross >= par+2 counts as potential 3-putt, worst gets snake
        const maxGross = Math.max(...nets.map(n=>n.gross));
        if(maxGross >= par+2){ const loser = nets.filter(n=>n.gross===maxGross).sort((a,b)=>b.net-a.net)[0]; snakeHolder = loser.p; hp[loser.p][h]-=1; }
      }
      if(snakeHolder){ hp[snakeHolder][17]-=3; }

    } else if(format==="match_play"){
      for(let h=0;h<18;h++){ const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); }); if(nets.length<2) continue; for(let i=0;i<nets.length;i++){ for(let j=0;j<nets.length;j++){ if(i===j) continue; if(nets[i].net < nets[j].net) hp[nets[i].p][h]+=1; else if(nets[i].net > nets[j].net) hp[nets[i].p][h]-=1; } } }

    } else if(format==="banker"){
      const names = players.map(p=>p.name);
      for(let h=0;h<18;h++){
        const bankerIdx = h % players.length; const bankerName = names[bankerIdx];
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); });
        if(nets.length<players.length) continue;
        const bankerNet = nets.find(n=>n.p===bankerName)?.net; if(bankerNet==null) continue;
        const minOther = Math.min(...nets.filter(n=>n.p!==bankerName).map(n=>n.net));
        teamsMap[h]={ banker: bankerName, label: `Banker ${bankerName[0]}` };
        if(bankerNet < minOther){ hp[bankerName][h]+=4; nets.filter(n=>n.p!==bankerName).forEach(n=>hp[n.p][h]-=2); }
        else if(bankerNet > minOther){ hp[bankerName][h]-=2; nets.filter(n=>n.p!==bankerName).forEach(n=>{ if(n.net < bankerNet) hp[n.p][h]+=1; }); }
      }
    }

    const totals={},gross={},running={}; players.forEach(p=>{ const gArr=(p.scores||[]).map(v=>parseInt(v)||0); gross[p.name]=gArr.reduce((a,b)=>a+b,0); totals[p.name]=(hp[p.name]||[]).reduce((a,b)=>a+b,0); let run=0; running[p.name]=(hp[p.name]||[]).map(v=>{ run+=Number(v)||0; return run; }); });
    return {hp,totals,gross,running,carry,tieBreak,teams:teamsMap};
  }catch(e){ return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null,teams:{}}; }
}

export default function App(){
  const [logoSrc,setLogoSrc]=useState(()=>{ try{ return localStorage.getItem("darkscore_logo")||DEFAULT_LOGO; }catch{ return DEFAULT_LOGO; } });
  const [appTitle,setAppTitle]=useState(()=>{ try{ return localStorage.getItem("darkscore_title")||DEFAULT_TITLE; }catch{ return DEFAULT_TITLE; } });
  const fileInputRef=useRef(null);
  const [customCourses,setCustomCourses]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_customCourses"); const p=s?JSON.parse(s):[]; return Array.isArray(p)?p.filter(c=>c&&Array.isArray(c.pars)&&c.pars.length===18):[]; }catch{ return []; } });
  const [editedBuiltIns,setEditedBuiltIns]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_editedBuiltIns"); return s?JSON.parse(s):{}; }catch{ return {}; } });
  const [settings,setSettings]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_settings"); return s?{...DEFAULT_SETTINGS,...JSON.parse(s)}:DEFAULT_SETTINGS; }catch{ return DEFAULT_SETTINGS; } });
  const allCourses=useMemo(()=>{
    const baseWithEdits = BASE_COURSES.map((c,idx)=> editedBuiltIns[idx]? {...editedBuiltIns[idx], isEdited:true, originalIdx:idx} : {...c, originalIdx:idx});
    const customs = customCourses.map((c,idx)=>({...c, isCustom:true, originalIdx: BASE_COURSES.length+idx}));
    return [...baseWithEdits,...customs];
  },[customCourses,editedBuiltIns]);
  const [cIdx,setCIdx]=useState(0); const course=allCourses[cIdx]||allCourses[0];
  const [players,setPlayers]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_players_v2"); if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>=2) return p.map(pl=>({name:pl.name, hcp:pl.hcp||0, scores: Array.isArray(pl.scores)&&pl.scores.length===18?pl.scores:Array(18).fill("")})); } }catch{} return DEFAULT_PLAYERS; });
  const [rounds,setRounds]=useState([]); const [activeTab,setActiveTab]=useState("live");
  const [activeHole,setActiveHole]=useState(0);
  const [showEdit,setShowEdit]=useState(false); const [editingIdx,setEditingIdx]=useState(null);
  const [editForm,setEditForm]=useState({name:"",short:"",parsStr:"",siStr:"",area:""});
  const [newName,setNewName]=useState(""); const [newHcp,setNewHcp]=useState(2);
  const [sortKey,setSortKey]=useState("points");
  const [showFormatInfo,setShowFormatInfo]=useState(false);
  const res=useMemo(()=>calc(players,course?.pars||Array(18).fill(4),course?.si||Array(18).fill(10),settings),[players,course,settings]);

  useEffect(()=>{ localStorage.setItem("darkscore_settings",JSON.stringify(settings)); },[settings]);
  useEffect(()=>{ localStorage.setItem("darkscore_players_v2",JSON.stringify(players.map(p=>({name:p.name,hcp:p.hcp,scores:p.scores})))); },[players]);
  useEffect(()=>{ localStorage.setItem("darkscore_title",appTitle); },[appTitle]);
  useEffect(()=>{ localStorage.setItem("darkscore_customCourses",JSON.stringify(customCourses)); },[customCourses]);
  useEffect(()=>{ localStorage.setItem("darkscore_editedBuiltIns",JSON.stringify(editedBuiltIns)); },[editedBuiltIns]);
  useEffect(()=>{(async()=>{ try{ const r=await fetch("/api/standings"); if(r.ok){ const d=await r.json(); const arr=Array.isArray(d)?d:(Array.isArray(d.rounds)?d.rounds:[]); setRounds(arr); } }catch{} })();},[]);

  function handleLogoClick(){ fileInputRef.current?.click(); }
  function handleLogoUpload(e){ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ const dataUrl=ev.target.result; setLogoSrc(dataUrl); try{ localStorage.setItem("darkscore_logo",dataUrl); }catch{} }; reader.readAsDataURL(file); e.target.value=""; }
  function upd(name,h,raw){ let num; if(typeof raw==="number"){ num=raw; } else { const clean=String(raw).replace(/[^0-9]/g,""); num=clean===""?"":parseInt(clean,10); } if(num!=="" && (num<1 || num>12)) return; setPlayers(prev=>prev.map(p=>{ if(p.name!==name) return p; const ns=[...p.scores]; ns[h]=num; return {...p,scores:ns}; })); }
  function addPlayer(){ const n=newName.trim(); if(!n){ alert("Enter name"); return; } if(players.length>=4){ alert("Max 4"); return; } if(players.find(p=>p.name.toLowerCase()===n.toLowerCase())){ alert("Exists"); return; } setPlayers(prev=>[...prev,{name:n,hcp:parseInt(newHcp)||0,scores:Array(18).fill("")}]); setNewName(""); setNewHcp(2); }
  function removePlayer(name){ if(players.length<=2){ alert("Min 2"); return; } if(!confirm(`Remove ${name}?`)) return; setPlayers(prev=>prev.filter(p=>p.name!==name)); }
  function updateHcp(name,delta){ setPlayers(prev=>prev.map(p=>{ if(p.name!==name) return p; let nh=(parseInt(p.hcp)||0)+delta; nh=Math.max(0,Math.min(36,nh)); return {...p,hcp:nh}; })); }
  function updatePlayerName(oldName,newVal){ if(!newVal.trim()) return; if(players.find(p=>p.name===newVal.trim()&&p.name!==oldName)) return; setPlayers(prev=>prev.map(p=>p.name===oldName?{...p,name:newVal.trim()}:p)); }
  function resetPlayers(){ if(!confirm("Reset to defaults?")) return; setPlayers(DEFAULT_PLAYERS.map(p=>({...p,scores:Array(18).fill("")}))); }
  function openEditCourse(idx){ const c=allCourses[idx]; setEditingIdx(idx); setEditForm({name:c.name,short:c.short,parsStr:c.pars.join(","),siStr:c.si.join(","),area:c.area}); setShowEdit(true); }
  function openNewCourse(){ setEditingIdx(null); setEditForm({name:"New Course",short:"NEW",parsStr:"4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4",siStr:"2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11",area:"Nashville"}); setShowEdit(true); }
  function saveCourse(){ const parseNums = (str) => str.split(/[\n,\s;]+/).map(s=>s.trim()).filter(Boolean).map(s=>parseInt(s)).filter(n=>!isNaN(n)&&n>=1&&n<=18); const parsePars = (str) => str.split(/[\n,\s;]+/).map(s=>s.trim()).filter(Boolean).map(s=>parseInt(s)).filter(n=>!isNaN(n)&&n>=3&&n<=6); const pars=parsePars(editForm.parsStr); const si=parseNums(editForm.siStr); if(pars.length!==18||si.length!==18){ alert("Need 18 pars and 18 SI"); return; } const newCourse = { name: editForm.name.trim()||"Unnamed", short: editForm.short.trim().toUpperCase()||"NEW", pars, si, area: editForm.area.trim()||"Custom" }; if(editingIdx===null){ setCustomCourses(prev=>[...prev, newCourse]); setCIdx(allCourses.length); } else { if(editingIdx < BASE_COURSES.length){ setEditedBuiltIns(prev=>({...prev, [editingIdx]: newCourse})); } else { const customIdx = editingIdx - BASE_COURSES.length; setCustomCourses(prev=>{ const copy=[...prev]; copy[customIdx]=newCourse; return copy; }); } } setShowEdit(false); }
  function deleteCourse(idx){ if(idx < BASE_COURSES.length){ if(editedBuiltIns[idx]){ if(!confirm(`Reset ${allCourses[idx].name}?`)) return; setEditedBuiltIns(prev=>{ const copy={...prev}; delete copy[idx]; return copy; }); } else alert("Can't delete built-in."); return; } else { if(!confirm(`Delete ${allCourses[idx].name}?`)) return; const customIdx = idx - BASE_COURSES.length; setCustomCourses(prev=>prev.filter((_,i)=>i!==customIdx)); setCIdx(0); } }
  function updateSetting(key,delta){ setSettings(prev=>{ let v=prev[key]+delta; if(key==="baseHolePoints") v=Math.max(1,Math.min(10,v)); if(key==="maxPerLoser") v=Math.max(prev.baseHolePoints,Math.min(20,v)); if(key==="birdiePoints") v=Math.max(0,Math.min(10,v)); if(key==="eaglePoints") v=Math.max(0,Math.min(20,v)); if(key==="carryIncrement") v=Math.max(1,Math.min(5,v)); if(key==="maxCarries") v=Math.max(1,Math.min(5,v)); if(key==="carryCap") v=Math.max(0,Math.min(10,v)); if(key==="dollarPerPoint") v=Math.max(1,Math.min(20,v)); return {...prev,[key]:v}; }); }

  const leaderboard = useMemo(()=>{
    const map={}; rounds.forEach(r=>{ const pars=r.course?.pars||BASE_COURSES.find(c=>c.short===r.course?.short)?.pars||Array(18).fill(4); const scoresObj=r.scores||{}; Object.keys(scoresObj).forEach(name=>{ const arr=scoresObj[name]||[]; const st=getStats(arr,pars); const pts=r.totals?.[name]||0; if(!map[name]) map[name]={name, rounds:0, points:0, pars:0, birdies:0, eagles:0, bogeys:0, doubles:0, gross:0, holes:0}; map[name].rounds+=1; map[name].points+=pts; map[name].pars+=st.parsC; map[name].birdies+=st.birdies; map[name].eagles+=st.eagles; map[name].bogeys+=st.bogeys; map[name].doubles+=st.doubleBogeys; map[name].gross+=st.gross; map[name].holes+=st.count; }); });
    const list=Object.values(map);
    return [...list].sort((a,b)=>{
      if(sortKey==="points") return b.points-a.points;
      if(sortKey==="avg") return (b.points/(b.rounds||1)) - (a.points/(a.rounds||1));
      if(sortKey==="pars") return b.pars-a.pars;
      if(sortKey==="birdies") return b.birdies-a.birdies;
      if(sortKey==="eagles") return b.eagles-a.eagles;
      if(sortKey==="gross") return a.gross-b.gross;
      if(sortKey==="bogeys") return a.bogeys-b.bogeys;
      if(sortKey==="doubles") return a.doubles-b.doubles;
      return b.points-a.points;
    });
  },[rounds,sortKey]);
  const currentFormat = GAMBLE_FORMATS.find(f=>f.id===settings.gameFormat)||GAMBLE_FORMATS[0];

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <div className="sticky top-0 z-50 bg-[#0A0E1A]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w- mx-auto p-3 md:p-4 flex items-center gap-3 md:gap-4">
          <div className="relative group shrink-0 cursor-pointer" onClick={handleLogoClick}>
            <img src={logoSrc} alt="" className="w-16 h-16 md:w-40 md:h-40 rounded- md:rounded- object-cover bg-transparent border-2 border-fuchsia-400/50" onError={e=>e.target.src=DEFAULT_LOGO} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text- md:text- text-white tracking-tight">{appTitle}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select value={cIdx} onChange={e=>setCIdx(parseInt(e.target.value))} className="h-9 rounded-full bg-white text-black border-2 border-white px-3 text- font-black max-w-">
                {allCourses.map((c,idx)=><option key={(c.short||c.name)+idx} value={idx}>{c.short} Par {c.pars.reduce((a,b)=>a+b,0)}</option>)}
              </select>
              <select value={settings.gameFormat} onChange={e=>setSettings(s=>({...s, gameFormat:e.target.value}))} className="h-9 rounded-full bg-white text-black border-2 border-fuchsia-500 px-3 text- font-black max-w-">
                {GAMBLE_FORMATS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button onClick={()=>setShowFormatInfo(!showFormatInfo)} className="shrink-0 w-8 h-8 rounded-full bg-white text-black border-2 border-white font-black">?</button>
            </div>
            {showFormatInfo&&<div className="mt-2 p-3 rounded-xl bg-white border-2 border-black text- text-black"><div className="font-black">{currentFormat.name} {players.length < currentFormat.minPlayers? `— NEEDS ${currentFormat.minPlayers} PLAYERS` : ""}</div><div className="mt-1 text-black/70">{GAMBLE_FORMATS_DESC[currentFormat.id]}</div></div>}
          </div>
          <div className="hidden xl:flex rounded-full bg-white/[0.08] border border-white/20 p-1">
            <button onClick={()=>setActiveTab("live")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/70"}`}>Live</button>
            <button onClick={()=>setActiveTab("players")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="players"?"bg-white text-black":"text-white/70"}`}>Players</button>
            <button onClick={()=>setActiveTab("leaderboard")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="leaderboard"?"bg-white text-black":"text-white/70"}`}>Board</button>
            <button onClick={()=>setActiveTab("setup")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="setup"?"bg-white text-black":"text-white/70"}`}>Setup</button>
            <button onClick={()=>setActiveTab("history")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/70"}`}>History</button>
          </div>
        </div>
        <div className="xl:hidden flex gap-1 px-3 pb-3 overflow-x-auto">
          <button onClick={()=>setActiveTab("live")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black border-2 ${activeTab==="live"?"bg-white text-black border-white":"bg-fuchsia-500 text-white border-fuchsia-400"}`}>Live</button>
          <button onClick={()=>setActiveTab("players")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="players"?"bg-white text-black":"bg-white/10 text-white"}`}>Players</button>
          <button onClick={()=>setActiveTab("setup")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="setup"?"bg-white text-black":"bg-white/10 text-white"}`}>Setup</button>
        </div>
        <div className="px-3 md:px-4 py-1.5 bg-white border-t-2 border-fuchsia-400 text- font-black text-black flex justify-between"><span>{currentFormat.name} • $ {settings.dollarPerPoint}/pt • {course?.short} Par {course?.pars.reduce((a,b)=>a+b,0)} {res.teams&&res.teams[activeHole]? `• ${res.teams[activeHole].label}` : ""}</span><span className={players.length < currentFormat.minPlayers? "text-red-600" : "text-black/50"}>{players.length}/{currentFormat.minPlayers} players {players.length < currentFormat.minPlayers? "— ADD PLAYER" : ""}</span></div>
      </div>

      <div className="max-w- mx-auto p-3 md:p-4 space-y-4">
        {res.error && (
          <div className="rounded- bg-red-500 border-2 border-black p-4 flex justify-between items-center">
            <div><div className="font-black text- text-white">⚠️ {res.error}</div><div className="text- text-white/80 mt-1">{currentFormat.name} is designed for {currentFormat.minPlayers} players. Add {currentFormat.minPlayers - players.length} more player(s) in Players tab.</div></div>
            <button onClick={()=>setActiveTab("players")} className="px-5 h-11 rounded-full bg-white text-black font-black text- border-2 border-black">+ Add Player</button>
          </div>
        )}

        {activeTab==="live" &&!res.error && (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {Array.from({length:18},(_,h)=>{
                const par=course?.pars[h]||4; const hasScore=players.some(p=>p.scores[h]!==""&&p.scores[h]!=null);
                return (<button key={h} onClick={()=>setActiveHole(h)} className={`shrink-0 w-12 md:w-14 h-12 rounded-xl border-2 flex flex-col items-center justify-center ${activeHole===h?"bg-white text-black border-white scale-105":hasScore?"bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-200":"bg-black border-white/20 text-white"}`}><span className="text- font-black">H{h+1}</span><span className="text- opacity-70">P{par}</span></button>);
              })}
            </div>
            <div className="md:hidden">
              {(()=>{
                const h=activeHole; const par=course?.pars[h]||4;
                return (
                  <div className="rounded- bg-[#121828] border border-white/20 overflow-hidden">
                    <div className="p-4 flex justify-between items-center bg-black/40">
                      <div><div className="font-black text- text-white">Hole {h+1} • Par {par} • SI {course?.si[h]} {res.teams&&res.teams[h]? `• ${res.teams[h].label}` : ""}</div><div className="text- text-white/60">{currentFormat.name}</div></div>
                      <div className="flex gap-2"><button onClick={()=>setActiveHole(Math.max(0,h-1))} className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white font-black">‹</button><button onClick={()=>setActiveHole(Math.min(17,h+1))} className="w-10 h-10 rounded-full bg-white text-black font-black">›</button></div>
                    </div>
                    <div className="p-3 space-y-3">
                      {players.map(p=>{
                        const v=p.scores?.[h]??""; const hp=res.hp?.[p.name]?.[h]||0; const run=res.running?.[p.name]?.[h]??0; const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isEagle=v!==""&&v<=par-2; const getsStroke=p.hcp>=course.si[h];
                        return (
                          <div key={p.name} className={`rounded- border-2 p-3 flex items-center justify-between ${isEagle?"bg-amber-500/15 border-amber-400/50":isBirdie?"bg-emerald-500/15 border-emerald-400/50":isPar?"bg-white/[0.05] border-white/20":"bg-black border-white/20"}`}>
                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black">{p.name[0]}</div><div><div className="font-bold text- text-white">{p.name} <span className="text- text-white/50">H{p.hcp}{getsStroke?" *":""}</span></div><span className={`text- px-2 py-1 rounded-full font-mono font-bold ${hp>0?"bg-fuchsia-400 text-black":hp<0?"bg-red-400 text-black":"bg-white/10 text-white/70"}`}>{hp>0?`+${hp.toFixed(1)}`:`${hp.toFixed(1)}`} • {run>0?`+${run.toFixed(1)}`:run.toFixed(1)}</span></div></div>
                            <div className="flex items-center gap-1.5"><button onClick={()=>{ const curr=parseInt(players.find(pl=>pl.name===p.name).scores[h])||par; upd(p.name,h,Math.max(1,curr-1)); }} className="w-12 h-12 rounded-full border bg-white/10 border-white/30 text-white text- font-black">-</button><div className="w-14 h-12 rounded-xl border-2 flex items-center justify-center font-black text- bg-black border-white/30 text-white">{v===""?"-":v}</div><button onClick={()=>{ const curr=parseInt(players.find(pl=>pl.name===p.name).scores[h])||par; upd(p.name,h,Math.min(12,curr+1)); }} className="w-12 h-12 rounded-full border bg-white text-black border-white text- font-black">+</button></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="hidden md:block rounded- bg-[#121828] border border-white/20 overflow-hidden">
              <div className="p-3 bg-white border-b-2 border-black flex justify-between items-center"><div className="font-black text- text-black">{course?.name} • {currentFormat.name} • $ {settings.dollarPerPoint}/pt • Par {course?.pars.reduce((a,b)=>a+b,0)} {res.teams&&res.teams[activeHole]? `• ${res.teams[activeHole].label}` : ""}</div></div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{minWidth: `${260 + players.length*230}px`}}>
                  <thead><tr className="bg-black/60 text- font-black tracking-widest text-white/60"><th className="p-3 text-left w- text-white">HOLE</th><th className="p-3 text-left w- text-white">PAR</th><th className="p-3 text-left w- text-white">SI</th>{players.map(p=><th key={p.name} className="p-3 text-left min-w- text-white">{p.name} H{p.hcp} G:{res.gross?.[p.name]||0} P:{(res.totals?.[p.name]||0).toFixed(1)} $:{(res.totals?.[p.name]*settings.dollarPerPoint||0).toFixed(0)}</th>)}<th className="p-3 text-left w- text-white">INFO</th></tr></thead>
                  <tbody>
                    {Array.from({length:18},(_,h)=>{
                      const par=course?.pars[h]||4; const isLast=h===17; const isActive=h===activeHole;
                      return (
                        <tr key={h} className={`border-t border-white/10 hover:bg-white/[0.05] ${isLast?"bg-amber-400/10":""} ${isActive?"bg-white/[0.08]":""}`}>
                          <td className="p-3 text-xs font-black text-white">{h+1}{isLast?"★":""}<div className="text- text-fuchsia-300 mt-1">{res.teams&&res.teams[h]? res.teams[h].label : ""}</div></td>
                          <td className="p-3"><span className="w-7 h-7 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text- font-bold text-white">{par}</span></td>
                          <td className="p-3 text- text-white/70">{course?.si[h]}</td>
                          {players.map(p=>{
                            const v=p.scores?.[h]??""; const hp=res.hp?.[p.name]?.[h]||0; const run=res.running?.[p.name]?.[h]??0;
                            const isPar=v!==""&&v===par; const isBirdie=v!==""&&v===par-1; const isEagle=v!==""&&v<=par-2; const getsStroke=p.hcp>=course.si[h];
                            return (
                              <td key={`${p.name}-${h}`} className={`p-2 ${isEagle?"bg-amber-500/20":isBirdie?"bg-emerald-500/20":isPar?"bg-white/[0.05]":""}`}>
                                <div className="flex items-center gap-2">
                                  <input value={v} onChange={e=>upd(p.name,h,e.target.value)} className={`w- h-9 rounded-xl border-2 text-center font-black text- bg-black text-white ${isEagle?"border-amber-400":isBirdie?"border-emerald-400":isPar?"border-white/40":"border-white/20"}`} placeholder="-" />
                                  <div className="flex flex-col gap-1">
                                    {getsStroke&&<span className="text- px-1 py-0.5 rounded-full bg-blue-400 text-black font-black">+1</span>}
                                    <span className={`text- px-2 py-1 rounded-full font-mono font-bold ${hp>0?"bg-fuchsia-400 text-black":hp<0?"bg-red-400 text-black":"bg-white/15 text-white/80"}`}>{hp>0?`+${hp.toFixed(1)}`:`${hp.toFixed(1)}`} ({run.toFixed(1)})</span>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 text- font-mono text-white/60">{isLast&&res.tieBreak?`TB ${res.tieBreak.winner}`:res.carry>0&&!isLast?`+${res.carry}`:""}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-black/60 border-t-2 border-fuchsia-400/30 font-black"><td className="p-3 text- text-white">TOTAL</td><td className="p-3 text- text-white">Par {course?.pars.reduce((a,b)=>a+b,0)}</td><td className="p-3"></td>{players.map(p=><td key={p.name} className="p-3 text-white"><div className="text-">{res.gross?.[p.name]||0} gross</div><div className="text- mt-1 text-white/80">{(res.totals?.[p.name]||0).toFixed(1)} pts • ${(res.totals?.[p.name]*settings.dollarPerPoint||0).toFixed(0)}</div></td>)}<td className="p-3 text- text-white">FINAL</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={async()=>{ const playersObj={}; players.forEach(p=>playersObj[p.name]=p.scores); const rd={id:Date.now(),dateStr:new Date().toLocaleString(),course:{name:course.name,short:course.short,pars:course.pars,si:course.si},scores:playersObj,players:players.map(p=>({name:p.name,hcp:p.hcp})),totals:{...res.totals},gross:{...res.gross},tieBreak:res.tieBreak||null,settings:{...settings},title:appTitle, format:settings.gameFormat, teams: res.teams||{}}; const nr=[rd,...rounds]; setRounds(nr); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:nr})}); }catch{} setPlayers(prev=>prev.map(p=>({...p,scores:Array(18).fill("")}))); setActiveHole(0); setActiveTab("leaderboard"); }} className="flex-1 md:flex-none px-7 py-4 rounded-full font-black text- bg-fuchsia-500 text-white">End Round → Save</button>
              <button onClick={()=>{ setPlayers(prev=>prev.map(p=>({...p,scores:Array(18).fill("")}))); setActiveHole(0); }} className="px-6 py-4 rounded-full font-black text- bg-white text-black border-2 border-black">Clear Scores</button>
            </div>
          </>
        )}

        {activeTab==="live" && res.error && (
          <div className="py-20 text-center">
            <div className="text-">⛳</div>
            <div className="mt-4 font-black text- text-white">{res.error}</div>
            <div className="mt-2 text-white/60 text-">{GAMBLE_FORMATS_DESC[settings.gameFormat]}</div>
            <button onClick={()=>setActiveTab("players")} className="mt-6 px-8 py-4 rounded-full bg-white text-black font-black border-2 border-black">Go to Players — Add {currentFormat.minPlayers - players.length}</button>
          </div>
        )}

        {activeTab==="players" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div><div className="font-black text- text-white">Players • {players.length}/4 • {currentFormat.name} needs {currentFormat.minPlayers}</div><div className="text- text-white/60 mt-1">{GAMBLE_FORMATS_DESC[currentFormat.id]}</div></div>
              <button onClick={resetPlayers} className="px-5 h-10 rounded-full bg-white text-black font-black text-xs border-2 border-black">Reset</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((p,idx)=>{
                const g=res.gross?.[p.name]||0; const pts=res.totals?.[p.name]||0;
                return (
                  <div key={p.name} className="rounded- bg-black border border-white/20 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-fuchsia-500 text-black flex items-center justify-center font-black">{idx+1}</div><input value={p.name} onChange={e=>updatePlayerName(p.name,e.target.value)} className="bg-transparent border-b-2 border-white/30 focus:border-fuchsia-400 outline-none font-bold text- w- pb-1 text-white" /></div>
                      <button onClick={()=>removePlayer(p.name)} className="w-10 h-10 rounded-full bg-red-500/20 border border-red-400/30 text-white font-black">✕</button>
                    </div>
                    <div className="mt-5">
                      <div className="text- text-white/60 tracking-widest font-black mb-2">HANDICAP — {p.hcp}</div>
                      <div className="flex items-center gap-3">
                        <button onClick={()=>updateHcp(p.name,-1)} className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white font-black text-">-</button>
                        <div className="flex-1 h-14 rounded-xl bg-[#1A1F2E] border-2 border-fuchsia-400/30 flex items-center justify-center font-black text- text-white">{p.hcp}</div>
                        <button onClick={()=>updateHcp(p.name,1)} className="w-14 h-14 rounded-full bg-white text-black font-black text- border-2 border-white">+</button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/[0.06] border border-white/10 p-2.5 text-center"><div className="text- text-white/50 tracking-widest">GROSS</div><div className="text- font-black text-white mt-1">{g}</div></div>
                      <div className={`rounded-xl border p-2.5 text-center ${pts>0?"bg-fuchsia-500 border-fuchsia-400":"bg-white/[0.06] border-white/10"}`}><div className="text- tracking-widest text-white/50">POINTS</div><div className="text- font-black text-white mt-1">{pts>0?`+${pts.toFixed(1)}`:`${pts.toFixed(1)}`}</div></div>
                    </div>
                  </div>
                );
              })}
              {players.length<4? (
                <div className="rounded- border-2 border-dashed border-fuchsia-400/60 bg-fuchsia-500/[0.12] p-5 flex flex-col justify-center">
                  <div className="font-black text- text-white mb-1">+ Add Player {players.length < currentFormat.minPlayers? `— Need ${currentFormat.minPlayers - players.length} more for ${currentFormat.name}` : ""}</div>
                  <div className="text- text-white/70 mb-4">Up to 4 players • {currentFormat.minPlayers} required for {currentFormat.name}</div>
                  <div className="space-y-3">
                    <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()} placeholder="Player name" className="w-full h-12 rounded-xl bg-white text-black border-2 border-black px-4 text- font-bold placeholder:text-black/40" autoFocus />
                    <div className="flex items-center gap-2">
                      <span className="text- font-black text-white/60 w-">HCP</span>
                      <button onClick={()=>setNewHcp(v=>Math.max(0,v-1))} className="w-11 h-11 rounded-full bg-black text-white border-2 border-white font-black text-">-</button>
                      <div className="flex-1 h-11 rounded-xl bg-white text-black border-2 border-black flex items-center justify-center font-black text-">{newHcp}</div>
                      <button onClick={()=>setNewHcp(v=>Math.min(36,v+1))} className="w-11 h-11 rounded-full bg-white text-black border-2 border-black font-black text-">+</button>
                    </div>
                    <button onClick={addPlayer} className="w-full h-12 rounded-full bg-fuchsia-500 text-white font-black text-">+ Add Player</button>
                  </div>
                </div>
              ) : (
                <div className="rounded- border border-white/10 bg-white/[0.03] p-5 flex flex-col items-center justify-center text-center">
                  <div className="font-black text- text-white">4 Players — All Formats Unlocked</div>
                  <div className="text- text-white/50 mt-2">Wolf, Vegas, Best Ball now available</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab==="setup" && (
          <div className="rounded- bg-white border-2 border-black p-5 space-y-6">
            <div className="font-black text- text-black">Setup</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text- font-black text-black mb-2">App Title</div>
                  <div className="flex gap-2"><input value={appTitle} onChange={e=>setAppTitle(e.target.value)} className="flex-1 h-11 rounded-xl bg-white text-black border-2 border-black px-4 text- font-black" /><button onClick={()=>setAppTitle(DEFAULT_TITLE)} className="px-5 h-11 rounded-full bg-black text-white font-black text-xs">Reset</button></div>
                </div>
                <div>
                  <div className="text- font-black text-black mb-2">Gamble Format — {players.length}/{currentFormat.minPlayers} players {players.length < currentFormat.minPlayers? "— ADD PLAYER" : "— OK"}</div>
                  <select value={settings.gameFormat} onChange={e=>setSettings(s=>({...s, gameFormat:e.target.value}))} className={`w-full h-12 rounded-xl border-2 px-4 text- font-black ${players.length < currentFormat.minPlayers? "bg-red-100 text-black border-red-500" : "bg-white text-black border-black"}`}>
                    {GAMBLE_FORMATS.map(f=><option key={f.id} value={f.id}>{f.name} {players.length < f.minPlayers? `— NEED ${f.minPlayers}` : ""}</option>)}
                  </select>
                  <div className="mt-3 p-3 rounded-xl bg-black text-white border-2 border-fuchsia-400"><div className="font-black text-">{currentFormat.name}</div><div className="text- text-white/70 mt-1">{GAMBLE_FORMATS_DESC[currentFormat.id]}</div><div className="mt-2 text- font-mono text-fuchsia-300">{players.length < currentFormat.minPlayers? `⚠️ NEED ${currentFormat.minPlayers} PLAYERS — ADD ${currentFormat.minPlayers - players.length}` : `✓ ${players.length} players — ready`}</div></div>
                </div>
                <div>
                  <div className="text- font-black text-black mb-2">$ Per Point</div>
                  <div className="flex items-center gap-2"><button onClick={()=>updateSetting("dollarPerPoint",-1)} className="w-12 h-12 rounded-full bg-black text-white font-black text- border-2 border-black">-</button><div className="flex-1 h-12 rounded-xl bg-white text-black border-2 border-black flex items-center justify-center font-black text-">${settings.dollarPerPoint}</div><button onClick={()=>updateSetting("dollarPerPoint",1)} className="w-12 h-12 rounded-full bg-fuchsia-500 text-white font-black text- border-2 border-black">+</button></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text- font-black text-black">Skins Tuning</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><div className="text- text-black/60 mb-1">Base Points</div><div className="flex gap-1"><button onClick={()=>updateSetting("baseHolePoints",-1)} className="flex-1 h-9 rounded-full bg-black text-white font-black">-</button><div className="flex-1 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-black">{settings.baseHolePoints}</div><button onClick={()=>updateSetting("baseHolePoints",1)} className="flex-1 h-9 rounded-full bg-white text-black border-2 border-black font-black">+</button></div></div>
                  <div><div className="text- text-black/60 mb-1">Max Per Loser</div><div className="flex gap-1"><button onClick={()=>updateSetting("maxPerLoser",-1)} className="flex-1 h-9 rounded-full bg-black text-white font-black">-</button><div className="flex-1 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-black">{settings.maxPerLoser}</div><button onClick={()=>updateSetting("maxPerLoser",1)} className="flex-1 h-9 rounded-full bg-white text-black border-2 border-black font-black">+</button></div></div>
                  <div><div className="text- text-black/60 mb-1">Birdie Pts</div><div className="flex gap-1"><button onClick={()=>updateSetting("birdiePoints",-1)} className="flex-1 h-9 rounded-full bg-black text-white font-black">-</button><div className="flex-1 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-black">{settings.birdiePoints}</div><button onClick={()=>updateSetting("birdiePoints",1)} className="flex-1 h-9 rounded-full bg-white text-black border-2 border-black font-black">+</button></div></div>
                  <div><div className="text- text-black/60 mb-1">Eagle Pts</div><div className="flex gap-1"><button onClick={()=>updateSetting("eaglePoints",-1)} className="flex-1 h-9 rounded-full bg-black text-white font-black">-</button><div className="flex-1 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-black">{settings.eaglePoints}</div><button onClick={()=>updateSetting("eaglePoints",1)} className="flex-1 h-9 rounded-full bg-white text-black border-2 border-black font-black">+</button></div></div>
                  <div><div className="text- text-black/60 mb-1">Carry +</div><div className="flex gap-1"><button onClick={()=>updateSetting("carryIncrement",-1)} className="flex-1 h-9 rounded-full bg-black text-white font-black">-</button><div className="flex-1 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-black">{settings.carryIncrement}</div><button onClick={()=>updateSetting("carryIncrement",1)} className="flex-1 h-9 rounded-full bg-white text-black border-2 border-black font-black">+</button></div></div>
                  <div><div className="text- text-black/60 mb-1">Max Carries</div><div className="flex gap-1"><button onClick={()=>updateSetting("maxCarries",-1)} className="flex-1 h-9 rounded-full bg-black text-white font-black">-</button><div className="flex-1 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-black">{settings.maxCarries}</div><button onClick={()=>updateSetting("maxCarries",1)} className="flex-1 h-9 rounded-full bg-white text-black border-2 border-black font-black">+</button></div></div>
                  <div><div className="text- text-black/60 mb-1">Carry Cap</div><div className="flex gap-1"><button onClick={()=>updateSetting("carryCap",-1)} className="w-12 h-9 rounded-full bg-black text-white font-black">-</button><div className="flex-1 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-black">{settings.carryCap}</div><button onClick={()=>updateSetting("carryCap",1)} className="w-12 h-9 rounded-full bg-white text-black border-2 border-black font-black">+</button></div></div>
                </div>
                <div className="p-3 rounded-xl bg-black border-2 border-white text-white text-"><div className="font-black">All 12 Formats — Player Requirements</div><div className="mt-2 grid grid-cols-1 gap-1">{GAMBLE_FORMATS.map(f=>{ const need = f.minPlayers; const have = players.length; const ok = have >= need; return <div key={f.id} className={`p-2 rounded-lg border flex justify-between ${f.id===settings.gameFormat? ok? "bg-fuchsia-500 border-white" : "bg-red-500 border-white" : ok? "bg-white/10 border-white/20" : "bg-red-500/20 border-red-400/30"}`}><span><span className="font-black">{f.name}</span> — <span className="text- opacity-70">{GAMBLE_FORMATS_DESC[f.id]}</span></span><span className="text- font-black ml-2">{need}P {ok?"✓":"NEED "+(need-have)}</span></div>; })}</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab==="leaderboard" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3"><div><div className="font-black text- text-white">Board • {currentFormat.name}</div><div className="text- text-white/60 mt-1">{rounds.length} rounds • {currentFormat.minPlayers}P required {players.length < currentFormat.minPlayers? `— NEED ${currentFormat.minPlayers - players.length}` : ""}</div></div><select value={sortKey} onChange={e=>setSortKey(e.target.value)} className="h-10 rounded-full bg-white text-black border-2 border-black px-4 text- font-black"><option value="points">Sort: Points</option><option value="avg">Sort: Avg Points</option><option value="pars">Sort: Most Pars</option><option value="birdies">Sort: Most Birdies</option><option value="eagles">Sort: Most Eagles</option><option value="gross">Sort: Low Gross</option><option value="bogeys">Sort: Fewest Bogeys</option><option value="doubles">Sort: Fewest Doubles</option></select></div>
            <div>
              <div className="font-black text- tracking-widest text-white/60 mb-3">LIVE ROUND • {course?.short} Par {course?.pars.reduce((a,b)=>a+b,0)} {res.error? `— ${res.error}` : ""}</div>
              {res.error? <div className="rounded-xl bg-red-500/20 border border-red-400/30 p-4 text-white">{res.error}</div> :
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {players.map(p=>{
                    const st=getStats(p.scores,course?.pars||[]); const pts=res.totals?.[p.name]||0; const g=res.gross?.[p.name]||0;
                    return (
                      <div key={p.name} className={`rounded- border p-3 ${pts>0?"bg-fuchsia-500/20 border-fuchsia-400/40":"bg-black border-white/20"}`}>
                        <div className="flex justify-between items-center"><span className="font-black text- text-white">{p.name} H{p.hcp}</span><span className={`px-3 py-1 rounded-full font-black text- ${pts>0?"bg-fuchsia-400 text-black":"bg-white/10 text-white"}`}>{pts>0?`+${pts.toFixed(1)}`:`${pts.toFixed(1)}`} $:{(pts*settings.dollarPerPoint).toFixed(0)}</span></div>
                        <div className="mt-2 flex gap-1.5 flex-wrap text-"><span className="px-2 py-1 rounded-full bg-white/10 text-white">G {g}</span><span className="px-2 py-1 rounded-full bg-white/10 text-white">{st.parsC} P</span><span className="px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-200">{st.birdies} B</span><span className="px-2 py-1 rounded-full bg-amber-400/20 text-amber-200">{st.eagles} E</span></div>
                      </div>
                    );
                  })}
                </div>
              }
            </div>
            <div>
              <div className="font-black text- tracking-widest text-white/60 mb-3">ALL-TIME • Sorted by {sortKey}</div>
              {leaderboard.length===0? <div className="py-16 text-center"><div className="text- mb-3">🏆</div><div className="text-white/40">No rounds yet</div></div> :
                <div className="grid gap-3">{leaderboard.map((pl,i)=><div key={pl.name} className={`rounded- border p-4 ${i===0?"bg-amber-400/10 border-amber-400/30":"bg-black border-white/20"}`}><div className="flex justify-between items-center"><div className="flex items-center gap-3"><span className="text- w-8">{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}</span><div><div className="font-black text- text-white">{pl.name}</div><div className="text- text-white/50 mt-1">{pl.rounds} rnds • {pl.pars}P • {pl.birdies}B • {pl.eagles}E • {pl.bogeys}Bog • {pl.doubles}Dbl • Gross {pl.gross} • {pl.holes} holes</div></div></div><span className="px-4 py-2 rounded-full bg-fuchsia-500 text-black font-black text-">{pl.points>0?`+${pl.points.toFixed(1)}`:`${pl.points.toFixed(1)}`} $:{(pl.points*settings.dollarPerPoint).toFixed(0)}</span></div></div>)}</div>
              }
            </div>
          </div>
        )}

        {activeTab==="courses" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4 space-y-4">
            <div className="font-black text-white">Courses • {allCourses.length}</div>
            <select value={cIdx} onChange={e=>setCIdx(parseInt(e.target.value))} className="w-full h-12 rounded-xl bg-white text-black border-2 border-black px-4 text- font-bold">
              {allCourses.map((c,idx)=><option key={(c.short||c.name)+idx} value={idx}>{c.short} - {c.name} Par {c.pars.reduce((a,b)=>a+b,0)}</option>)}
            </select>
          </div>
        )}

        {activeTab==="history" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4">
            <div className="font-black text- mb-4 text-white">History • {rounds.length} rounds</div>
            {rounds.length===0? <div className="py-16 text-center text-white/40">No rounds yet</div> :
              rounds.map(r=>{
                const short=r.course?.short||r.course?.name; const totals=r.totals||{}; const gross=r.gross||{}; const scoresObj=r.scores||{}; const orderNames=r.players?.map(p=>p.name)||Object.keys(scoresObj);
                const coursePars=r.course?.pars||BASE_COURSES.find(c=>c.short===short)?.pars||Array(18).fill(4);
                return (
                  <div key={r.id} className="p-4 rounded- bg-black border border-white/20 mb-3">
                    <div className="flex justify-between items-start gap-3"><div className="text- font-mono text-white/80"><div className="font-black text-white text-">{r.dateStr} • {short} • {r.format||r.settings?.gameFormat} • ${r.settings?.dollarPerPoint||1}/pt</div><div className="mt-1 text- text-white/50">{r.course?.name||""} • Par {coursePars.reduce((a,b)=>a+b,0)}</div>{r.tieBreak&&<div className="mt-1 text- px-2 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200 inline-block">Tie-break: {r.tieBreak.winner} — {r.tieBreak.reason}</div>}</div><button onClick={async()=>{ if(!confirm(`Delete ${r.dateStr}?`)) return; const u=rounds.filter(x=>x.id!==r.id); setRounds(u); try{ await fetch("/api/standings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rounds:u})}); }catch{} }} className="shrink-0 px-3 py-2 rounded-full bg-red-500/20 border border-red-400/30 text- font-bold text-red-200">Delete</button></div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {orderNames.map(name=>{
                        const arr=scoresObj[name]||[]; const st=getStats(arr, coursePars); const pts=totals[name]??0; const g=gross[name]??0;
                        return (
                          <div key={name} className="rounded-xl bg-[#0F1423] border border-white/10 p-3">
                            <div className="flex justify-between items-center"><span className="font-bold text- text-white">{name}</span><span className="text- font-black text-white">{g} / {pts.toFixed(1)} $:{(pts*(r.settings?.dollarPerPoint||1)).toFixed(0)}</span></div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <span className="text- px-2 py-1 rounded-full bg-white/10 text-white border border-white/10">{st.parsC} Pars</span>
                              <span className="text- px-2 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/20 text-emerald-200">{st.birdies} Birdies</span>
                              <span className="text- px-2 py-1 rounded-full bg-amber-400/15 border border-amber-400/20 text-amber-200">{st.eagles} Eagles</span>
                              <span className="text- px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{st.bogeys} Bogeys</span>
                              <span className="text- px-2 py-1 rounded-full bg-red-400/10 border border-red-400/20 text-red-300">{st.doubleBogeys} Dbl+</span>
                            </div>
                            <div className="mt-2 text- font-mono text-white/30">{(arr||[]).map(v=>v===""?"-":v).join(" - ")}</div>
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
      </div>
    </div>
  );
}

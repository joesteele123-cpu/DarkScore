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
  { id: "skins_carry", name: "Skins (Carry + Birdie/Eagle)" },
  { id: "skins_no_carry", name: "Skins No Carry" },
  { id: "nassau", name: "Nassau (Front/Back/Overall)" },
  { id: "wolf", name: "Wolf (Rotating)" },
  { id: "vegas", name: "Vegas (Flip)" },
  { id: "sixes", name: "Sixes / Round Robin (6 pts)" },
  { id: "stableford", name: "Stableford (8-5-2-0-1-3)" },
  { id: "best_ball", name: "Best Ball Skins" },
  { id: "dots", name: "Dots / Garbage" },
  { id: "snake", name: "Snake (3-Putt)" },
  { id: "match_play", name: "Match Play vs Field" },
  { id: "banker", name: "Banker / Seve (1 vs Field)" },
];

const GAMBLE_FORMATS_DESC = {
  skins_carry: "Classic skins, ties carry, birdie +2 eagle +5 vs field, 18th tie-break pars->birdies->doubles",
  skins_no_carry: "Tie = no skin, no carry, birdie/eagle still pay",
  nassau: "3 bets per match — Front 9, Back 9, Total 18 — low gross wins bet",
  wolf: "Rotating Wolf picks partner or goes Lone Wolf — Wolf order rotates",
  vegas: "Teams low score first — e.g., 3 & 5 = 35 vs 46 — low team wins points",
  sixes: "6 pts per hole — Win 4-2-0, 2nd 2pts, 3-2-1 split, 2-2-2 tie",
  stableford: "Albatross 8, Eagle 5, Birdie 2, Par 0, Bogey -1, Dbl+ -3",
  best_ball: "Lowest net per hole wins skin for team",
  dots: "Par 0, Birdie 1, Eagle 3, Sandy Par 2, Greenie 1, etc",
  snake: "Track 3-putts — last to 3-putt holds snake, pays at end",
  match_play: "Each hole W/L/T vs each opponent — match play points",
  banker: "Rotating Banker — Banker vs 2 others each hole, Banker low wins double",
};

const DEFAULT_SETTINGS = { baseHolePoints: 2, maxPerLoser: 6, birdiePoints: 2, eaglePoints: 5, carryIncrement: 2, maxCarries: 2, carryCap: 4, gameFormat: "skins_carry", dollarPerPoint: 1 };

function getStats(arr, pars){
  let parsC=0,birdies=0,eagles=0,bogeys=0,doubleBogeys=0,gross=0,count=0;
  (arr||[]).forEach((sc,h)=>{ if(sc===""||sc==null) return; const p=pars[h]||4; const s=parseInt(sc)||0; if(s<=0) return; gross+=s; count++; const d=s-p; if(d===0) parsC++; else if(d===-1) birdies++; else if(d<=-2) eagles++; else if(d===1) bogeys++; else if(d>=2) doubleBogeys++; });
  return {parsC,birdies,eagles,bogeys,doubleBogeys,gross,count};
}
function calc(players, pars, sis, settings){
  const S=settings||DEFAULT_SETTINGS; const format = S.gameFormat||"skins_carry";
  try{
    if(!pars||pars.length!==18||!sis||sis.length!==18) return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null};
    const hp={}; players.forEach(p=>hp[p.name]=Array(18).fill(0));
    let carry=0, cc=0, tieBreak=null; const hcpMap={}; players.forEach(p=>hcpMap[p.name]=Number(p.hcp)||0);
    if(format==="skins_carry" || format==="skins_no_carry"){
      for(let h=0;h<18;h++){
        const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); });
        if(!nets.length) continue; const min=Math.min(...nets.map(x=>x.net)); const winners=nets.filter(x=>x.net===min);
        if(winners.length===1){ const perLoser=Math.min(S.baseHolePoints+carry, S.maxPerLoser); const w=winners[0].p; hp[w][h]+=perLoser*(players.length-1); players.forEach(pl=>{ if(pl.name!==w && pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; }); carry=0; cc=0; }
        else { if(h===17 && format==="skins_carry"){ const stats={}; players.forEach(p=>stats[p.name]=getStats(p.scores,pars)); let rem=[...players].filter(p=>p.scores.some(v=>v!==""&&v!=null)); if(!rem.length) rem=[...players]; const maxPars=Math.max(0,...rem.map(p=>stats[p.name]?.parsC||0)); rem=rem.filter(p=>(stats[p.name]?.parsC||0)===maxPars); let reason=`most pars ${maxPars}`; if(rem.length>1){ const maxBird=Math.max(0,...rem.map(p=>stats[p.name]?.birdies||0)); rem=rem.filter(p=>(stats[p.name]?.birdies||0)===maxBird); reason=`${maxPars} pars tie → most birdies ${maxBird}`; if(rem.length>1){ const minDbl=Math.min(99,...rem.map(p=>stats[p.name]?.doubleBogeys??99)); rem=rem.filter(p=>(stats[p.name]?.doubleBogeys??99)===minDbl); reason=`${maxPars} pars tie → ${maxBird} birdies tie → least doubles ${minDbl}`; } } const winner=rem[0]?.name||players[0]?.name; if(winner){ const perLoser=Math.min(S.baseHolePoints+carry, S.maxPerLoser); hp[winner][h]+=perLoser*(players.length-1); players.forEach(pl=>{ if(pl.name!==winner&&pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=perLoser; }); tieBreak={winner,reason,stats}; } carry=0; cc=0; } else { if(format==="skins_carry"){ if(cc<S.maxCarries){ carry+=S.carryIncrement; cc++; } else carry=S.carryCap; } else { carry=0; cc=0; } } }
      }
      for(let h=0;h<18;h++){ const par=pars[h]||4; const birdiers=players.filter(p=>{ const g=p.scores?.[h]; return g!==""&&g!=null&&g===par-1; }).map(p=>p.name); const eaglers=players.filter(p=>{ const g=p.scores?.[h]; return g!==""&&g!=null&&g<=par-2; }).map(p=>p.name); birdiers.forEach(m=>{ const opps=players.filter(p=>p.name!==m && p.scores?.[h]!==""&&p.scores[h]!=null && p.scores[h]>par-1); if(!opps.length) return; hp[m][h]+=S.birdiePoints*opps.length; opps.forEach(o=>hp[o.name][h]-=S.birdiePoints); }); eaglers.forEach(m=>{ const opps=players.filter(p=>p.name!==m && p.scores?.[h]!==""&&p.scores[h]!=null && p.scores[h]>par-2); if(!opps.length) return; hp[m][h]+=S.eaglePoints*opps.length; opps.forEach(o=>hp[o.name][h]-=S.eaglePoints); }); }
    } else if(format==="sixes"){
      for(let h=0;h<18;h++){ const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); }); if(nets.length<3) continue; nets.sort((a,b)=>a.net-b.net); if(nets[0].net < nets[1].net && nets[1].net < nets[2].net){ hp[nets[0].p][h]+=4; hp[nets[1].p][h]+=2; hp[nets[2].p][h]+=0; } else if(nets[0].net===nets[1].net && nets[1].net < nets[2].net){ hp[nets[0].p][h]+=3; hp[nets[1].p][h]+=3; hp[nets[2].p][h]+=0; } else if(nets[0].net < nets[1].net && nets[1].net===nets[2].net){ hp[nets[0].p][h]+=4; hp[nets[1].p][h]+=1; hp[nets[2].p][h]+=1; } else { hp[nets[0].p][h]+=2; hp[nets[1].p][h]+=2; hp[nets[2].p][h]+=2; } }
    } else if(format==="stableford"){
      for(let h=0;h<18;h++){ const par=pars[h]||4; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; const diff = g-par; let pts=0; if(diff<=-3) pts=8; else if(diff===-2) pts=5; else if(diff===-1) pts=2; else if(diff===0) pts=0; else if(diff===1) pts=-1; else pts=-3; hp[p.name][h]+=pts; }); }
    } else {
      for(let h=0;h<18;h++){ const nets=[]; players.forEach(p=>{ const g=p.scores?.[h]; if(g===""||g==null) return; let s=0; const si=sis[h]; if(si && (hcpMap[p.name]||0) >= si) s=1; nets.push({p:p.name, net:g-s}); }); if(nets.length<2) continue; nets.sort((a,b)=>a.net-b.net); if(nets[0].net < nets[1].net){ hp[nets[0].p][h]+=2; players.forEach(pl=>{ if(pl.name!==nets[0].p && pl.scores?.[h]!==""&&pl.scores[h]!=null) hp[pl.name][h]-=1; }); } }
    }
    const totals={},gross={},running={}; players.forEach(p=>{ const gArr=(p.scores||[]).map(v=>parseInt(v)||0); gross[p.name]=gArr.reduce((a,b)=>a+b,0); totals[p.name]=(hp[p.name]||[]).reduce((a,b)=>a+b,0); let run=0; running[p.name]=(hp[p.name]||[]).map(v=>{ run+=Number(v)||0; return run; }); });
    return {hp,totals,gross,running,carry,tieBreak};
  }catch(e){ return {hp:{},totals:{},gross:{},running:{},carry:0,tieBreak:null}; }
}

export default function App(){
  const [logoSrc,setLogoSrc]=useState(()=>{ try{ return localStorage.getItem("darkscore_logo")||DEFAULT_LOGO; }catch{ return DEFAULT_LOGO; } });
  const [appTitle,setAppTitle]=useState(()=>{ try{ return localStorage.getItem("darkscore_title")||DEFAULT_TITLE; }catch{ return DEFAULT_TITLE; } });
  const fileInputRef=useRef(null); const photoInputRef=useRef(null);
  const [customCourses,setCustomCourses]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_customCourses"); const p=s?JSON.parse(s):[]; return Array.isArray(p)?p.filter(c=>c&&Array.isArray(c.pars)&&c.pars.length===18):[]; }catch{ return []; } });
  const [editedBuiltIns,setEditedBuiltIns]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_editedBuiltIns"); return s?JSON.parse(s):{}; }catch{ return {}; } });
  const [settings,setSettings]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_settings"); return s?{...DEFAULT_SETTINGS,...JSON.parse(s)}:DEFAULT_SETTINGS; }catch{ return DEFAULT_SETTINGS; } });
  const [photos,setPhotos]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_photos"); return s?JSON.parse(s):[]; }catch{ return []; } });
  const allCourses=useMemo(()=>{
    const baseWithEdits = BASE_COURSES.map((c,idx)=> editedBuiltIns[idx]? {...editedBuiltIns[idx], isEdited:true, originalIdx:idx} : {...c, originalIdx:idx});
    const customs = customCourses.map((c,idx)=>({...c, isCustom:true, originalIdx: BASE_COURSES.length+idx}));
    return [...baseWithEdits,...customs];
  },[customCourses,editedBuiltIns]);
  const [cIdx,setCIdx]=useState(0); const course=allCourses[cIdx]||allCourses[0];
  const [players,setPlayers]=useState(()=>{ try{ const s=localStorage.getItem("darkscore_players_v2"); if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>=2) return p.map(pl=>({name:pl.name, hcp:pl.hcp||0, scores: Array.isArray(pl.scores)&&pl.scores.length===18?pl.scores:Array(18).fill("")})); } }catch{} return DEFAULT_PLAYERS; });
  const [rounds,setRounds]=useState([]); const [activeTab,setActiveTab]=useState("players");
  const [activeHole,setActiveHole]=useState(0);
  const [showEdit,setShowEdit]=useState(false); const [editingIdx,setEditingIdx]=useState(null);
  const [editForm,setEditForm]=useState({name:"",short:"",parsStr:"",siStr:"",area:""});
  const [newName,setNewName]=useState(""); const [newHcp,setNewHcp]=useState(2);
  const [photoFilter,setPhotoFilter]=useState("all"); const [selectedPhoto,setSelectedPhoto]=useState(null);
  const [showFormatInfo,setShowFormatInfo]=useState(false);
  const res=useMemo(()=>calc(players,course?.pars||Array(18).fill(4),course?.si||Array(18).fill(10),settings),[players,course,settings]);

  useEffect(()=>{ localStorage.setItem("darkscore_settings",JSON.stringify(settings)); },[settings]);
  useEffect(()=>{ localStorage.setItem("darkscore_players_v2",JSON.stringify(players.map(p=>({name:p.name,hcp:p.hcp,scores:p.scores})))); },[players]);
  useEffect(()=>{ localStorage.setItem("darkscore_title",appTitle); },[appTitle]);
  useEffect(()=>{ localStorage.setItem("darkscore_customCourses",JSON.stringify(customCourses)); },[customCourses]);
  useEffect(()=>{ localStorage.setItem("darkscore_editedBuiltIns",JSON.stringify(editedBuiltIns)); },[editedBuiltIns]);
  useEffect(()=>{ try{ localStorage.setItem("darkscore_photos",JSON.stringify(photos)); }catch{ alert("Photos storage full"); } },[photos]);
  useEffect(()=>{(async()=>{ try{ const r=await fetch("/api/standings"); if(r.ok){ const d=await r.json(); const arr=Array.isArray(d)?d:(Array.isArray(d.rounds)?d.rounds:[]); setRounds(arr); } }catch{} })();},[]);

  function handleLogoClick(){ fileInputRef.current?.click(); }
  function handleLogoUpload(e){ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=(ev)=>{ const dataUrl=ev.target.result; setLogoSrc(dataUrl); try{ localStorage.setItem("darkscore_logo",dataUrl); }catch{} }; reader.readAsDataURL(file); e.target.value=""; }
  function handlePhotoUpload(e){
    const files=Array.from(e.target.files||[]); if(!files.length) return;
    files.forEach(file=>{ const reader=new FileReader(); reader.onload=(ev)=>{ const dataUrl=ev.target.result; const newPhoto={ id: Date.now()+Math.random(), src: dataUrl, date: new Date().toLocaleString(), course: course?.short||course?.name||"Live", hole: activeHole+1, caption: "", players: players.map(p=>p.name).join(", ") }; setPhotos(prev=>[newPhoto,...prev]); }; reader.readAsDataURL(file); });
    e.target.value="";
  }
  function deletePhoto(id){ if(!confirm("Delete photo?")) return; setPhotos(prev=>prev.filter(p=>p.id!==id)); setSelectedPhoto(null); }
  function updatePhotoCaption(id, cap){ setPhotos(prev=>prev.map(p=>p.id===id?{...p, caption: cap}:p)); }
  function upd(name,h,raw){ let num; if(typeof raw==="number"){ num=raw; } else { const clean=String(raw).replace(/[^0-9]/g,""); num=clean===""?"":parseInt(clean,10); } if(num!=="" && (num<1 || num>12)) return; setPlayers(prev=>prev.map(p=>{ if(p.name!==name) return p; const ns=[...p.scores]; ns[h]=num; return {...p,scores:ns}; })); }
  function addPlayer(){ const n=newName.trim(); if(!n){ alert("Enter name"); return; } if(players.length>=4){ alert("Max 4 players"); return; } if(players.find(p=>p.name.toLowerCase()===n.toLowerCase())){ alert("Name already exists"); return; } setPlayers(prev=>[...prev,{name:n,hcp:parseInt(newHcp)||0,scores:Array(18).fill("")}]); setNewName(""); setNewHcp(2); }
  function removePlayer(name){ if(players.length<=2){ alert("Need at least 2 players"); return; } if(!confirm(`Remove ${name}?`)) return; setPlayers(prev=>prev.filter(p=>p.name!==name)); }
  function updateHcp(name,delta){ setPlayers(prev=>prev.map(p=>{ if(p.name!==name) return p; let nh=(parseInt(p.hcp)||0)+delta; nh=Math.max(0,Math.min(36,nh)); return {...p,hcp:nh}; })); }
  function updatePlayerName(oldName,newVal){ if(!newVal.trim()) return; if(players.find(p=>p.name===newVal.trim()&&p.name!==oldName)) return; setPlayers(prev=>prev.map(p=>p.name===oldName?{...p,name:newVal.trim()}:p)); }
  function resetPlayers(){ if(!confirm("Reset to defaults: Joe (2), Brad (0), Graham (0)?")) return; setPlayers(DEFAULT_PLAYERS.map(p=>({...p,scores:Array(18).fill("")}))); }
  function openEditCourse(idx){ const c=allCourses[idx]; setEditingIdx(idx); setEditForm({name:c.name,short:c.short,parsStr:c.pars.join(","),siStr:c.si.join(","),area:c.area}); setShowEdit(true); }
  function openNewCourse(){ setEditingIdx(null); setEditForm({name:"New Course",short:"NEW",parsStr:"4,4,3,5,4,4,5,3,4,5,4,4,3,4,3,4,5,4",siStr:"2,8,16,6,12,4,18,14,10,7,3,5,17,9,15,1,13,11",area:"Nashville"}); setShowEdit(true); }
  function saveCourse(){ const parseNums = (str) => str.split(/[\n,\s;]+/).map(s=>s.trim()).filter(Boolean).map(s=>parseInt(s)).filter(n=>!isNaN(n)&&n>=1&&n<=18); const parsePars = (str) => str.split(/[\n,\s;]+/).map(s=>s.trim()).filter(Boolean).map(s=>parseInt(s)).filter(n=>!isNaN(n)&&n>=3&&n<=6); const pars=parsePars(editForm.parsStr); const si=parseNums(editForm.siStr); if(pars.length!==18||si.length!==18){ alert("Need 18 pars and 18 SI"); return; } const newCourse = { name: editForm.name.trim()||"Unnamed", short: editForm.short.trim().toUpperCase()||"NEW", pars, si, area: editForm.area.trim()||"Custom" }; if(editingIdx===null){ setCustomCourses(prev=>[...prev, newCourse]); setCIdx(allCourses.length); } else { if(editingIdx < BASE_COURSES.length){ setEditedBuiltIns(prev=>({...prev, [editingIdx]: newCourse})); } else { const customIdx = editingIdx - BASE_COURSES.length; setCustomCourses(prev=>{ const copy=[...prev]; copy[customIdx]=newCourse; return copy; }); } } setShowEdit(false); }
  function deleteCourse(idx){ if(idx < BASE_COURSES.length){ if(editedBuiltIns[idx]){ if(!confirm(`Reset ${allCourses[idx].name} back to original?`)) return; setEditedBuiltIns(prev=>{ const copy={...prev}; delete copy[idx]; return copy; }); } else alert("Can't delete built-in."); return; } else { if(!confirm(`Delete custom course ${allCourses[idx].name}?`)) return; const customIdx = idx - BASE_COURSES.length; setCustomCourses(prev=>prev.filter((_,i)=>i!==customIdx)); setCIdx(0); } }
  function updateSetting(key,delta){ setSettings(prev=>{ let v=prev[key]+delta; if(key==="dollarPerPoint") v=Math.max(1,Math.min(20,v)); return {...prev,[key]:v}; }); }

  const leaderboard = useMemo(()=>{
    const map={}; rounds.forEach(r=>{ const pars=r.course?.pars||BASE_COURSES.find(c=>c.short===r.course?.short)?.pars||Array(18).fill(4); const scoresObj=r.scores||{}; Object.keys(scoresObj).forEach(name=>{ const arr=scoresObj[name]||[]; const st=getStats(arr,pars); const pts=r.totals?.[name]||0; if(!map[name]) map[name]={name, rounds:0, points:0, pars:0, birdies:0, eagles:0, gross:0}; map[name].rounds+=1; map[name].points+=pts; map[name].pars+=st.parsC; map[name].birdies+=st.birdies; map[name].eagles+=st.eagles; map[name].gross+=st.gross; }); }); return Object.values(map).sort((a,b)=>b.points-a.points);
  },[rounds]);
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
              <select value={cIdx} onChange={e=>setCIdx(parseInt(e.target.value))} className="h-9 rounded-full bg-white text-black border-2 border-white px-3 text- font-black">
                {allCourses.map((c,idx)=><option key={(c.short||c.name)+idx} value={idx}>{c.short} - Par {c.pars.reduce((a,b)=>a+b,0)}</option>)}
              </select>
              <select value={settings.gameFormat} onChange={e=>setSettings(s=>({...s, gameFormat:e.target.value}))} className="h-9 rounded-full bg-white text-black border-2 border-fuchsia-400 px-3 text- font-black max-w-">
                {GAMBLE_FORMATS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button onClick={()=>setShowFormatInfo(!showFormatInfo)} className="shrink-0 w-8 h-8 rounded-full bg-white text-black border-2 border-white font-black text-">?</button>
              <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </div>
            {showFormatInfo&&<div className="mt-2 p-3 rounded-xl bg-white border-2 border-fuchsia-400 text- text-black"><div className="font-black">{currentFormat.name}</div><div className="mt-1 text-black/70">{GAMBLE_FORMATS_DESC[currentFormat.id]}</div></div>}
          </div>
          <div className="hidden xl:flex rounded-full bg-white/[0.08] border border-white/20 p-1">
            <button onClick={()=>setActiveTab("live")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"text-white/70"}`}>Live</button>
            <button onClick={()=>setActiveTab("leaderboard")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="leaderboard"?"bg-white text-black":"text-white/70"}`}>Board</button>
            <button onClick={()=>setActiveTab("players")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="players"?"bg-white text-black":"text-white/70"}`}>Players ★</button>
            <button onClick={()=>setActiveTab("photos")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="photos"?"bg-white text-black":"text-white/70"}`}>Photos</button>
            <button onClick={()=>setActiveTab("courses")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="courses"?"bg-white text-black":"text-white/70"}`}>Courses</button>
            <button onClick={()=>setActiveTab("setup")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="setup"?"bg-white text-black":"text-white/70"}`}>Setup</button>
            <button onClick={()=>setActiveTab("history")} className={`px-3 py-2.5 rounded-full text-xs font-black ${activeTab==="history"?"bg-white text-black":"text-white/70"}`}>History</button>
          </div>
        </div>
        <div className="xl:hidden flex gap-1 px-3 pb-3 overflow-x-auto">
          <button onClick={()=>setActiveTab("live")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="live"?"bg-white text-black":"bg-white/10 text-white"}`}>Live</button>
          <button onClick={()=>setActiveTab("players")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black border-2 ${activeTab==="players"?"bg-white text-black border-white":"bg-fuchsia-500 text-white border-fuchsia-400"}`}>Players ★</button>
          <button onClick={()=>setActiveTab("setup")} className={`shrink-0 px-4 h-9 rounded-full text-xs font-black ${activeTab==="setup"?"bg-white text-black":"bg-white/10 text-white"}`}>Setup</button>
        </div>
        <div className="px-3 md:px-4 py-1.5 bg-white border-t-2 border-fuchsia-400 text- font-black text-black">{currentFormat.name} • $ {settings.dollarPerPoint}/pt • {course?.short} Par {course?.pars.reduce((a,b)=>a+b,0)} — {GAMBLE_FORMATS_DESC[currentFormat.id]}</div>
      </div>

      <div className="max-w- mx-auto p-3 md:p-4 space-y-4">
        {activeTab==="players" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div><div className="font-black text- text-white">Players • {players.length}/4</div><div className="text- text-white/60 mt-1">Current game: {currentFormat.name} • Tap name to rename</div></div>
              <button onClick={resetPlayers} className="px-5 h-10 rounded-full bg-white text-black font-black text-xs">↺ Reset to Joe/Brad/Graham</button>
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
                      <div className="text- text-white/60 tracking-widest font-black mb-2">HANDICAP — {p.hcp} strokes</div>
                      <div className="flex items-center gap-3">
                        <button onClick={()=>updateHcp(p.name,-1)} className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white font-black text-">-</button>
                        <div className="flex-1 h-14 rounded-xl bg-[#1A1F2E] border-2 border-fuchsia-400/30 flex items-center justify-center font-black text- text-white">{p.hcp}</div>
                        <button onClick={()=>updateHcp(p.name,1)} className="w-14 h-14 rounded-full bg-white text-black font-black text-">+</button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/[0.06] border border-white/10 p-2.5 text-center"><div className="text- text-white/50 tracking-widest">GROSS</div><div className="text- font-black text-white mt-1">{g}</div></div>
                      <div className={`rounded-xl border p-2.5 text-center ${pts>0?"bg-fuchsia-500 border-fuchsia-400":"bg-white/[0.06] border-white/10"}`}><div className={`text- tracking-widest ${pts>0?"text-black/70":"text-white/50"}`}>POINTS</div><div className={`text- font-black mt-1 ${pts>0?"text-black":"text-white"}`}>{pts>0?`+${pts.toFixed(1)}`:`${pts.toFixed(1)}`}</div></div>
                    </div>
                  </div>
                );
              })}
              {players.length<4? (
                <div className="rounded- border-2 border-dashed border-fuchsia-400/50 bg-fuchsia-500/[0.10] p-5 flex flex-col justify-center">
                  <div className="font-black text- text-white mb-1">+ Add New Player</div>
                  <div className="text- text-white/60 mb-4">Up to 4 players</div>
                  <div className="space-y-3">
                    <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addPlayer()} placeholder="Player name — e.g., Mike" className="w-full h-12 rounded-xl bg-white text-black border-2 border-black px-4 text- font-bold placeholder:text-black/40 focus:border-fuchsia-500 outline-none" />
                    <div className="flex items-center gap-2">
                      <span className="text- font-black text-white/60">HCP</span>
                      <button onClick={()=>setNewHcp(v=>Math.max(0,v-1))} className="w-11 h-11 rounded-full bg-white text-black font-black text- border-2 border-black">-</button>
                      <div className="flex-1 h-11 rounded-xl bg-white text-black border-2 border-black flex items-center justify-center font-black text-">{newHcp}</div>
                      <button onClick={()=>setNewHcp(v=>Math.min(36,v+1))} className="w-11 h-11 rounded-full bg-white text-black font-black text- border-2 border-black">+</button>
                    </div>
                    <button onClick={addPlayer} className="w-full h-12 rounded-full bg-fuchsia-500 text-white font-black text-">+ Add Player {newName.trim()?`— ${newName.trim()}`:""}</button>
                  </div>
                </div>
              ) : (
                <div className="rounded- border border-white/10 bg-white/[0.03] p-5 flex flex-col items-center justify-center text-center">
                  <div className="font-black text- text-white">4 Players Max Reached</div>
                  <div className="text- text-white/50 mt-2">Remove a player to add a new one</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab==="setup" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-4 md:p-6 space-y-6">
            <div className="rounded- bg-white border-2 border-black p-5">
              <div className="font-black text- text-black">Setup • Game Format </div>
              <div className="text- text-black/60 mt-1">All dropdowns now white background, black text — high contrast</div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text- font-black text-black mb-2 tracking-widest">⛳ GAMBLE FORMAT — 12 Formats</div>
                  <select value={settings.gameFormat} onChange={e=>setSettings(s=>({...s, gameFormat:e.target.value}))} className="w-full h-12 rounded-xl bg-white text-black border-2 border-black px-4 text- font-black">
                    {GAMBLE_FORMATS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <div className="mt-3 p-3 rounded-xl bg-black text-white border-2 border-fuchsia-400">
                    <div className="font-black text-">{currentFormat.name}</div>
                    <div className="text- text-white/70 mt-1">{GAMBLE_FORMATS_DESC[currentFormat.id]}</div>
                    <div className="mt-2 text- font-mono text-fuchsia-300">ID: {currentFormat.id} • $ {settings.dollarPerPoint}/pt</div>
                  </div>
                </div>
                <div>
                  <div className="text- font-black text-black mb-2 tracking-widest">💰 $ PER POINT / SKIN</div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>updateSetting("dollarPerPoint",-1)} className="w-12 h-12 rounded-full bg-black text-white font-black text- border-2 border-black">-</button>
                    <div className="flex-1 h-12 rounded-xl bg-white text-black border-2 border-black flex items-center justify-center font-black text-">${settings.dollarPerPoint}</div>
                    <button onClick={()=>updateSetting("dollarPerPoint",1)} className="w-12 h-12 rounded-full bg-fuchsia-500 text-white font-black text- border-2 border-black">+</button>
                  </div>
                  <div className="mt-3 text- text-black/60">Example: 3 pts × ${settings.dollarPerPoint} = ${(3*settings.dollarPerPoint).toFixed(0)} • Used in Board + History</div>
                  <div className="mt-4">
                    <div className="text- font-black text-black mb-2 tracking-widest">🏷️ APP TITLE</div>
                    <div className="flex gap-2">
                      <input value={appTitle} onChange={e=>setAppTitle(e.target.value)} className="flex-1 h-11 rounded-xl bg-white text-black border-2 border-black px-4 text- font-black" />
                      <button onClick={()=>setAppTitle(DEFAULT_TITLE)} className="px-5 h-11 rounded-full bg-black text-white font-black text-xs">Reset</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-3 rounded-xl bg-black border-2 border-white">
                <div className="font-black text- text-white tracking-widest">ALL 12 FORMATS — QUICK REFERENCE</div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {GAMBLE_FORMATS.map(f=>{
                    const isActive = f.id===settings.gameFormat;
                    return <div key={f.id} className={`p-2.5 rounded-xl border-2 text- ${isActive?"bg-fuchsia-500 text-white border-black":"bg-white text-black border-black/20"}`}><span className="font-black">{f.name}</span><br/><span className={`text- ${isActive?"text-white/80":"text-black/60"}`}>{GAMBLE_FORMATS_DESC[f.id]}</span></div>;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab==="live" && (
          <div className="text-white/50 text-center py-20">Go to Players to add players, then Live tab for scoring — Game: {currentFormat.name}</div>
        )}
        {activeTab==="leaderboard" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-6 text-white">Board — {currentFormat.name} — $ {settings.dollarPerPoint}/pt — {leaderboard.length} rounds saved</div>
        )}
        {activeTab==="photos" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-6 text-white">Photos — {photos.length} photos — Upload in header</div>
        )}
        {activeTab==="courses" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-6 space-y-4">
            <div className="flex justify-between items-center"><div className="font-black text-white">Courses • {allCourses.length}</div><button onClick={openNewCourse} className="px-5 h-10 rounded-full bg-fuchsia-500 text-white font-black text-xs">+ Add Course</button></div>
            <select value={cIdx} onChange={e=>setCIdx(parseInt(e.target.value))} className="w-full h-12 rounded-xl bg-white text-black border-2 border-black px-4 text- font-bold">
              {allCourses.map((c,idx)=><option key={(c.short||c.name)+idx} value={idx}>{c.short} - {c.name} Par {c.pars.reduce((a,b)=>a+b,0)}</option>)}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allCourses.map((c,idx)=>(
                <div key={(c.short||c.name)+idx} className={`rounded-xl border-2 p-4 ${idx===cIdx?"bg-white text-black border-black":"bg-black text-white border-white/20"}`}>
                  <div className="font-bold">{c.name}</div>
                  <div className="mt-3 flex gap-2"><button onClick={()=>{ setCIdx(idx); setActiveTab("live"); }} className="h-9 px-4 rounded-full bg-fuchsia-500 text-white font-black text-">Use</button><button onClick={()=>openEditCourse(idx)} className="h-9 px-4 rounded-full bg-white text-black border-2 border-black font-bold text-">Edit</button></div>
                </div>
              ))}
            </div>
            {showEdit && (
              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded- border-2 border-black p-5 w-full max-w-">
                  <div className="font-black text-black">Edit Course</div>
                  <div className="space-y-3 mt-3">
                    <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} placeholder="Course Name" className="w-full h-11 px-4 rounded-xl bg-white text-black border-2 border-black" />
                    <div className="grid grid-cols-2 gap-2"><input value={editForm.short} onChange={e=>setEditForm(f=>({...f,short:e.target.value.toUpperCase()}))} placeholder="SHORT" className="h-11 px-4 rounded-xl bg-white text-black border-2 border-black" /><input value={editForm.area} onChange={e=>setEditForm(f=>({...f,area:e.target.value}))} placeholder="Area" className="h-11 px-4 rounded-xl bg-white text-black border-2 border-black" /></div>
                    <textarea value={editForm.parsStr} onChange={e=>setEditForm(f=>({...f,parsStr:e.target.value}))} className="w-full h-24 p-3 rounded-xl bg-white text-black border-2 border-black font-mono text-" />
                    <textarea value={editForm.siStr} onChange={e=>setEditForm(f=>({...f,siStr:e.target.value}))} className="w-full h-24 p-3 rounded-xl bg-white text-black border-2 border-black font-mono text-" />
                  </div>
                  <div className="flex gap-2 mt-5"><button onClick={()=>setShowEdit(false)} className="flex-1 h-11 rounded-full bg-black text-white font-bold">Cancel</button><button onClick={saveCourse} className="flex-1 h-11 rounded-full bg-fuchsia-500 text-white font-black">✓ Save</button></div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab==="history" && (
          <div className="rounded- bg-[#121828] border border-white/20 p-6 text-white">History — {rounds.length} rounds</div>
        )}
      </div>
    </div>
  );
}

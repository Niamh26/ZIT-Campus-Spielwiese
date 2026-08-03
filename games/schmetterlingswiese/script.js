const GAME_CATALOG = [
  { id: "anatomie-memory", title: "Anatomie-Memory", icon: "🧠", maxPoints: 10 },
  { id: "craniosacral-quiz", title: "Craniosacral-Quiz", icon: "🌿", maxPoints: 10 },
  { id: "trauma-kreuzwortraetsel", title: "Trauma-Kreuzworträtsel", icon: "🧩", maxPoints: 20 },
  { id: "traumakreislauf", title: "Der Traumakreislauf", icon: "🔄", maxPoints: 20 },
  { id: "10-step-domino", title: "10-Step-Domino", icon: "🁣", maxPoints: 10 },
  { id: "faszien-labyrinth", title: "Faszien-Labyrinth", icon: "🐇", maxPoints: 10 }
];

const MILESTONES = [
  { min: 0, max: 19, label: "0–19" }, { min: 20, max: 39, label: "20–39" },
  { min: 40, max: 59, label: "40–59" }, { min: 60, max: 79, label: "60–79" },
  { min: 80, max: 99, label: "80–99" }, { min: 100, max: Infinity, label: "ab 100" }
];

const BUTTERFLIES = [
  { type: "lemon", left: 27, top: 22, size: 72, duration: 15, delay: -4 },
  { type: "blue", left: 48, top: 31, size: 68, duration: 18, delay: -9 },
  { type: "monarch", left: 73, top: 20, size: 86, duration: 17, delay: -2 },
  { type: "white", left: 68, top: 58, size: 71, duration: 20, delay: -12 },
  { type: "peacock", left: 34, top: 56, size: 82, duration: 16, delay: -7 },
  { type: "orange", left: 57, top: 44, size: 61, duration: 14, delay: -5 }
];

const FLOWERS = [
  ["daisy",5,0,72],["cornflower",10,4,60],["clover",14,0,82],["buttercup",18,3,55],
  ["poppy",23,0,76],["daisy",28,2,58],["salvia",33,0,105],["clover",38,1,77],
  ["cornflower",42,0,68],["daisy",47,5,61],["buttercup",51,1,56],["poppy",56,0,84],
  ["clover",61,3,73],["daisy",65,0,67],["salvia",70,0,112],["cornflower",75,2,65],
  ["buttercup",79,0,62],["clover",83,4,79],["daisy",87,0,73],["poppy",92,0,80],
  ["daisy",97,2,57],["salvia",2,0,91],["cornflower",20,6,52],["clover",31,6,58],
  ["buttercup",45,8,48],["daisy",59,8,54],["poppy",72,7,67],["cornflower",89,7,55],
  ["daisy",8,11,44],["clover",25,12,55],["buttercup",39,13,46],["daisy",54,12,48],
  ["cornflower",67,12,51],["clover",80,13,52],["poppy",95,12,59],["daisy",16,17,42]
];

const el = id => document.getElementById(id);
const totalPointsEl = el("totalPoints"), totalPointsBottomEl = el("totalPointsBottom");
const nextButterflyTextEl = el("nextButterflyText"), pointsRemainingEl = el("pointsRemaining");
const progressBarEl = el("progressBar"), butterflyLayerEl = el("butterflyLayer");
const flowerLayerEl = el("flowerLayer"), milestonesEl = el("milestones"), gameListEl = el("gameList");
const emptyMessageEl = el("emptyMessage"), arrivalToastEl = el("arrivalToast");
const resetProgressButton = el("resetProgress");

function getButterflyCount(points){ if(points<20)return 0;if(points<40)return 1;if(points<60)return 2;if(points<80)return 3;if(points<100)return 4;return 6; }
function getNextThreshold(points){return [20,40,60,80,100].find(t=>points<t)??null}
function getFlowerCount(points){return Math.min(FLOWERS.length,8+Math.floor(points/10)*3)}

function renderScore(progress){
  const points=progress.totalPoints; totalPointsEl.textContent=points; totalPointsBottomEl.textContent=points;
  const next=getNextThreshold(points);
  if(next===null){nextButterflyTextEl.textContent="Deine Schmetterlingswiese ist vollständig erblüht.";pointsRemainingEl.textContent="Du hast alle aktuellen Schmetterlingsstufen erreicht.";progressBarEl.style.width="100%";return}
  const previous=Math.max(0,next-20), percent=Math.max(0,Math.min(100,((points-previous)/20)*100)), remaining=next-points;
  nextButterflyTextEl.textContent=next===20?"Der erste Schmetterling erscheint bei 20 Punkten.":`Nächster Schmetterling bei ${next} Punkten.`;
  pointsRemainingEl.textContent=remaining===1?"Noch 1 Punkt bis zum nächsten Schmetterling.":`Noch ${remaining} Punkte bis zum nächsten Schmetterling.`;
  progressBarEl.style.width=`${percent}%`;
}

function flowerSvg(type){
  const stem='<path d="M50 100 C48 72 54 48 50 19" stroke="#3f7f32" stroke-width="4" fill="none"/><path d="M49 68 C33 60 29 67 47 75" fill="#66a84f"/><path d="M52 52 C68 44 72 51 53 59" fill="#5c9d47"/>';
  const defs={
    daisy:`${stem}<g transform="translate(50 20)"><g fill="#fffdf4">${Array.from({length:10},(_,i)=>`<ellipse rx="7" ry="18" transform="rotate(${i*36}) translate(0 -16)"/>`).join('')}</g><circle r="11" fill="#e7ad27"/><circle r="5" fill="#b67b15" opacity=".55"/></g>`,
    cornflower:`${stem}<g transform="translate(50 20)" fill="#3978c9">${Array.from({length:12},(_,i)=>`<path d="M0 0 L-5 -20 L0 -15 L5 -22 L6 -4 Z" transform="rotate(${i*30})"/>`).join('')}<circle r="8" fill="#234f91"/></g>`,
    clover:`${stem}<g transform="translate(50 21)">${Array.from({length:22},(_,i)=>`<circle cx="${Math.cos(i*.9)*13}" cy="${Math.sin(i*.9)*10}" r="7" fill="${i%3===0?'#d86bb6':'#c64d9f'}"/>`).join('')}<circle r="7" fill="#8d3576"/></g>`,
    buttercup:`${stem}<g transform="translate(50 20)">${Array.from({length:5},(_,i)=>`<ellipse rx="11" ry="17" fill="#ffd33d" transform="rotate(${i*72}) translate(0 -10)"/>`).join('')}<circle r="8" fill="#c99012"/></g>`,
    poppy:`${stem}<g transform="translate(50 23)"><path d="M0 0 C-28 -24 -29 8 -8 10 C-25 31 10 30 10 10 C35 20 35 -16 10 -9 C8 -34 -20 -24 0 0Z" fill="#e95038"/><circle r="8" fill="#352c25"/></g>`,
    salvia:`<path d="M50 100 C49 74 51 45 50 8" stroke="#3b7c31" stroke-width="4" fill="none"/>${Array.from({length:7},(_,i)=>`<g transform="translate(50 ${18+i*10})"><path d="M0 0 C-18 -10 -20 5 -4 6Z" fill="#7650c6"/><path d="M0 0 C18 -10 20 5 4 6Z" fill="#925fdf"/></g>`).join('')}`
  }; return `<svg viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg">${defs[type]}</svg>`;
}

function butterflySvg(type){
  const palettes={lemon:["#f7df57","#d8b62e","#725b19"],blue:["#4ba7e8","#2375bf","#233d5b"],monarch:["#f28a26","#df671a","#211c18"],white:["#fffdf1","#e8e3ce","#4d4942"],peacock:["#b6493c","#7b2f68","#202744"],orange:["#ee9b32","#d96c22","#3b2821"]};
  const [a,b,d]=palettes[type];
  return `<svg viewBox="0 0 120 88" xmlns="http://www.w3.org/2000/svg"><g class="wing-left"><path d="M58 44 C40 5 5 4 9 34 C12 57 37 59 58 48Z" fill="${a}" stroke="${d}" stroke-width="3"/><path d="M55 48 C35 42 19 58 29 77 C41 91 55 67 59 50Z" fill="${b}" stroke="${d}" stroke-width="3"/><circle cx="25" cy="28" r="4" fill="${d}" opacity=".8"/><circle cx="36" cy="63" r="4" fill="#fff" opacity=".8"/></g><g class="wing-right"><path d="M62 44 C80 5 115 4 111 34 C108 57 83 59 62 48Z" fill="${a}" stroke="${d}" stroke-width="3"/><path d="M65 48 C85 42 101 58 91 77 C79 91 65 67 61 50Z" fill="${b}" stroke="${d}" stroke-width="3"/><circle cx="95" cy="28" r="4" fill="${d}" opacity=".8"/><circle cx="84" cy="63" r="4" fill="#fff" opacity=".8"/></g><ellipse cx="60" cy="47" rx="5" ry="20" fill="#2f2924"/><circle cx="60" cy="26" r="5" fill="#2f2924"/><path d="M58 24 Q46 10 44 6 M62 24 Q74 10 76 6" fill="none" stroke="#2f2924" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function renderFlowers(points){flowerLayerEl.innerHTML="";const count=getFlowerCount(points);FLOWERS.forEach((f,i)=>{const [type,left,bottom,height]=f;const plant=document.createElement("div");plant.className=`plant${i<count?' visible':''}`;plant.style.left=`${left}%`;plant.style.bottom=`${bottom}%`;plant.style.setProperty("--plant-w",`${height*.72}px`);plant.style.setProperty("--plant-h",`${height}px`);plant.style.setProperty("--sway",`${3.2+(i%5)*.45}s`);plant.style.setProperty("--delay",`${-(i%7)*.55}s`);plant.innerHTML=flowerSvg(type);flowerLayerEl.appendChild(plant)})}

function renderButterflies(points){const count=getButterflyCount(points);butterflyLayerEl.innerHTML="";emptyMessageEl.hidden=count>0;BUTTERFLIES.slice(0,count).forEach((style,index)=>{const b=document.createElement("div");b.className="butterfly";b.style.left=`${style.left}%`;b.style.top=`${style.top}%`;b.style.setProperty("--size",`${style.size}px`);b.style.setProperty("--duration",`${style.duration}s`);b.style.setProperty("--delay",`${style.delay}s`);b.setAttribute("aria-label",`Schmetterling ${index+1}`);b.innerHTML=butterflySvg(style.type);butterflyLayerEl.appendChild(b)})}

function renderMilestones(points){milestonesEl.innerHTML="";MILESTONES.forEach((m,i)=>{const reached=i===0||points>=m.min,item=document.createElement("div");item.className=`milestone${reached?' reached':''}`;item.innerHTML=`<strong>${m.min}${m.max===Infinity?'+':''}</strong><div class="milestone-badge">🦋</div><small>${m.label}<br>Punkte</small>`;milestonesEl.appendChild(item)})}
function renderGames(progress){gameListEl.innerHTML="";GAME_CATALOG.forEach(game=>{const gp=progress.games[game.id],completed=Boolean(gp?.awarded),row=document.createElement("div");row.className=`game-row${completed?' completed':''}`;row.innerHTML=`<div class="game-icon">${game.icon}</div><div><strong>${game.title}</strong><small>${completed?`${gp.points} Punkte erhalten`:`bis zu ${game.maxPoints} Punkte`}</small></div><div class="game-status">${completed?'✓':'○'}</div>`;gameListEl.appendChild(row)})}

function maybeCelebrate(points){const count=getButterflyCount(points),key="zit_meadow_butterfly_count",old=Number(localStorage.getItem(key)||0);if(count>old&&count>0){const last=butterflyLayerEl.lastElementChild;if(last)last.classList.add("arriving");arrivalToastEl.classList.add("show");setTimeout(()=>arrivalToastEl.classList.remove("show"),3000)}localStorage.setItem(key,String(count))}
function render(){const progress=window.ZITPoints.load();renderScore(progress);renderFlowers(progress.totalPoints);renderButterflies(progress.totalPoints);renderMilestones(progress.totalPoints);renderGames(progress);maybeCelebrate(progress.totalPoints)}
resetProgressButton.addEventListener("click",()=>{if(!window.confirm("Möchtest du wirklich alle gesammelten Punkte und Spielabschlüsse auf diesem Gerät löschen?"))return;window.ZITPoints.reset();localStorage.removeItem("zit_meadow_butterfly_count");render()});
window.addEventListener("zit-points-changed",render);window.addEventListener("storage",render);render();

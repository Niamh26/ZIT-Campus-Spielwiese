const data = JSON.parse(document.getElementById("crossword-data").textContent);
const gridEl = document.getElementById("grid");
const acrossEl = document.getElementById("acrossClues");
const downEl = document.getElementById("downClues");
const messageEl = document.getElementById("message");
const progressEl = document.getElementById("progressText");

const cells = new Map();
const entries = data.entries.map((e, idx) => ({...e, id: idx, solved: false}));

function key(r,c){ return `${r},${c}`; }

const cellInfo = new Map();
for(const entry of entries){
  for(let i=0;i<entry.answer.length;i++){
    const r = entry.row + (entry.direction === "down" ? i : 0);
    const c = entry.col + (entry.direction === "across" ? i : 0);
    const k = key(r,c);
    if(!cellInfo.has(k)) cellInfo.set(k,{letter:entry.answer[i],entries:[]});
    cellInfo.get(k).entries.push(entry.id);
  }
}

gridEl.style.gridTemplateColumns = `repeat(${data.cols}, auto)`;

for(let r=0;r<data.rows;r++){
  for(let c=0;c<data.cols;c++){
    const k=key(r,c);
    const wrapper=document.createElement("div");
    wrapper.className="cell";
    wrapper.setAttribute("role","gridcell");
    const info=cellInfo.get(k);
    if(!info){
      wrapper.classList.add("block");
    }else{
      const start=entries.find(e=>e.row===r && e.col===c);
      if(start){
        const n=document.createElement("span");
        n.className="num";
        n.textContent=start.number;
        wrapper.appendChild(n);
      }
      const input=document.createElement("input");
      input.maxLength=1;
      input.autocomplete="off";
      input.inputMode="text";
      input.setAttribute("aria-label",`Feld Zeile ${r+1}, Spalte ${c+1}`);
      input.addEventListener("input",e=>{
        e.target.value=e.target.value.toUpperCase().replace(/[^A-Z]/g,"");
        wrapper.classList.remove("correct","incorrect");
        moveNext(r,c,info.entries[0]);
        updateProgress();
      });
      input.addEventListener("focus",()=>highlightEntries(info.entries));
      input.addEventListener("keydown",e=>handleKey(e,r,c,info.entries[0]));
      wrapper.appendChild(input);
      cells.set(k,input);
    }
    gridEl.appendChild(wrapper);
  }
}

function renderClues(direction, target){
  entries.filter(e=>e.direction===direction).sort((a,b)=>a.number-b.number).forEach(e=>{
    const li=document.createElement("li");
    li.value=e.number;
    li.dataset.entry=e.id;
    li.textContent=e.clue;
    li.addEventListener("click",()=>{
      cells.get(key(e.row,e.col)).focus();
      highlightEntries([e.id]);
    });
    target.appendChild(li);
  });
}
renderClues("across",acrossEl);
renderClues("down",downEl);

function highlightEntries(ids){
  document.querySelectorAll(".clues li").forEach(li=>li.classList.toggle("active",ids.includes(Number(li.dataset.entry))));
}

function moveNext(r,c,entryId){
  const e=entries[entryId];
  const index=e.direction==="across" ? c-e.col : r-e.row;
  const next=index+1;
  if(next<e.answer.length){
    const nr=e.row+(e.direction==="down"?next:0);
    const nc=e.col+(e.direction==="across"?next:0);
    cells.get(key(nr,nc))?.focus();
  }
}

function handleKey(event,r,c,entryId){
  const e=entries[entryId];
  const index=e.direction==="across" ? c-e.col : r-e.row;
  let next=index;
  if(event.key==="ArrowRight") next=index+1;
  else if(event.key==="ArrowLeft") next=index-1;
  else if(event.key==="ArrowDown" && e.direction==="down") next=index+1;
  else if(event.key==="ArrowUp" && e.direction==="down") next=index-1;
  else if(event.key==="Backspace" && !event.target.value) next=index-1;
  else return;
  if(next>=0 && next<e.answer.length){
    event.preventDefault();
    const nr=e.row+(e.direction==="down"?next:0);
    const nc=e.col+(e.direction==="across"?next:0);
    cells.get(key(nr,nc))?.focus();
  }
}

function entryValue(e){
  let value="";
  for(let i=0;i<e.answer.length;i++){
    const r=e.row+(e.direction==="down"?i:0);
    const c=e.col+(e.direction==="across"?i:0);
    value += cells.get(key(r,c))?.value || "";
  }
  return value;
}

function updateProgress(){
  let solved=0;
  for(const e of entries){
    e.solved=entryValue(e)===e.answer;
    if(e.solved) solved++;
  }
  progressEl.textContent=`${solved} von ${entries.length} Begriffen gelöst`;
  if(solved===entries.length){
    messageEl.textContent="Geschafft! Du hast das Kreuzworträtsel vollständig gelöst. 🌿";
  }
}

document.getElementById("checkBtn").addEventListener("click",()=>{
  let wrong=0;
  for(const [k,input] of cells){
    const wrapper=input.parentElement;
    wrapper.classList.remove("correct","incorrect");
    if(!input.value) continue;
    if(input.value===cellInfo.get(k).letter) wrapper.classList.add("correct");
    else {wrapper.classList.add("incorrect");wrong++;}
  }
  updateProgress();
  messageEl.textContent=wrong ? `${wrong} Buchstabe${wrong===1?" ist":"n sind"} noch nicht richtig.` : "Alle bisher eingetragenen Buchstaben sind richtig.";
});

document.getElementById("hintBtn").addEventListener("click",()=>{
  const open=entries.filter(e=>entryValue(e)!==e.answer);
  if(!open.length){messageEl.textContent="Alles ist bereits gelöst.";return;}
  const e=open[Math.floor(Math.random()*open.length)];
  const missing=[];
  for(let i=0;i<e.answer.length;i++){
    const r=e.row+(e.direction==="down"?i:0);
    const c=e.col+(e.direction==="across"?i:0);
    const input=cells.get(key(r,c));
    if(input.value!==e.answer[i]) missing.push({input,letter:e.answer[i]});
  }
  const hint=missing[Math.floor(Math.random()*missing.length)];
  hint.input.value=hint.letter;
  hint.input.parentElement.classList.add("correct");
  messageEl.textContent=`Tipp für ${e.number}: Ein Buchstabe wurde ergänzt.`;
  updateProgress();
});

document.getElementById("resetBtn").addEventListener("click",()=>{
  if(!confirm("Möchtest du alle Einträge löschen?")) return;
  for(const input of cells.values()){input.value="";input.parentElement.classList.remove("correct","incorrect");}
  messageEl.textContent="";
  updateProgress();
});

updateProgress();

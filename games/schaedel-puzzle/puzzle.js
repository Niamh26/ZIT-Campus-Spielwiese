window.__skullPuzzleBooted=true;
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { BONES } from './bones.js';

const stage=document.getElementById('stage'), canvas=document.getElementById('canvas');
const loading=document.getElementById('loading'), loadText=document.getElementById('loadText'), loadBar=document.getElementById('loadBar');
const boneName=document.getElementById('boneName'), boneLatin=document.getElementById('boneLatin'), progressText=document.getElementById('progressText'), progressBar=document.getElementById('progressBar');
const startBtn=document.getElementById('startBtn'), moveBtn=document.getElementById('moveBtn'), rotateBtn=document.getElementById('rotateBtn'), hintBtn=document.getElementById('hintBtn'), snapBtn=document.getElementById('snapBtn'), resetBtn=document.getElementById('resetBtn'), boneList=document.getElementById('boneList'), toast=document.getElementById('toast');

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,1,.1,2000); camera.position.set(0,-230,45);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0xffffff,0x587064,2.4)); const key=new THREE.DirectionalLight(0xffffff,3); key.position.set(-100,-120,160); scene.add(key); const fill=new THREE.DirectionalLight(0xffffff,1.6); fill.position.set(120,80,80); scene.add(fill);
const root=new THREE.Group(); scene.add(root);
const orbit=new OrbitControls(camera,canvas); orbit.enableDamping=true; orbit.target.set(0,0,5); orbit.minDistance=85; orbit.maxDistance=420;
const transform=new TransformControls(camera,canvas); transform.setSize(.75); scene.add(transform.getHelper()); transform.addEventListener('dragging-changed',e=>orbit.enabled=!e.value); transform.addEventListener('objectChange',()=>{ if(selected) updateSelectionUI(); });

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(); const loader=new STLLoader();
const pieces=[]; let selected=null, started=false, completed=0, hintGhost=null;
const REMOTE='https://raw.githubusercontent.com/Kevin-Mattheus-Moerman/BodyParts3D/main/assets/BodyParts3D_data/stl/';
const localUrl=b=>`./models/${b.fma}.stl`; const remoteUrl=b=>`${REMOTE}${b.fma}.stl`;

function loadStl(url,timeoutMs=25000){return new Promise((resolve,reject)=>{let done=false;const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error('Zeitüberschreitung: '+url));},timeoutMs);loader.load(url,g=>{if(done)return;done=true;clearTimeout(timer);resolve(g);},undefined,e=>{if(done)return;done=true;clearTimeout(timer);reject(e||new Error('Ladefehler: '+url));});});}
async function loadGeometry(b){try{return await loadStl(localUrl(b),12000);}catch(localErr){console.warn('Lokales Modell fehlt, nutze Quellen-Fallback:',b.fma,localErr);return await loadStl(remoteUrl(b),30000);}}
function material(color,opacity=1){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:0,transparent:opacity<1,opacity,side:THREE.DoubleSide});}

async function init(){
  let loadedCount=0;
  loadText.textContent=`0 / ${BONES.length} · Modelle werden vorbereitet`;
  try{
    const raw=await Promise.all(BONES.map(async b=>{
      const g=await loadGeometry(b); g.computeVertexNormals();
      loadedCount++; loadText.textContent=`${loadedCount} / ${BONES.length}`; loadBar.style.width=`${loadedCount/BONES.length*100}%`;
      return {b,g};
    }));
    const total=new THREE.Box3(); raw.forEach(x=>total.union(new THREE.Box3().setFromBufferAttribute(x.g.attributes.position))); const skullCenter=total.getCenter(new THREE.Vector3());
    raw.forEach(({b,g},i)=>{
      const box=new THREE.Box3().setFromBufferAttribute(g.attributes.position), c=box.getCenter(new THREE.Vector3()); g.translate(-c.x,-c.y,-c.z);
      const mesh=new THREE.Mesh(g,material(b.color)); mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData.index=i;
      mesh.position.copy(c.sub(skullCenter)); mesh.userData.targetPosition=mesh.position.clone(); mesh.userData.targetQuaternion=new THREE.Quaternion(); mesh.userData.placed=true; mesh.userData.bone=b; root.add(mesh); pieces.push(mesh);
    });
    const box=new THREE.Box3().setFromObject(root), size=box.getSize(new THREE.Vector3()); const scale=120/Math.max(size.x,size.y,size.z); root.scale.setScalar(scale);
    buildList(); loading.hidden=true; resize(); selectPiece(pieces[0]); animate();
  }catch(err){
    loading.innerHTML=`<div class="error"><strong>Die Schädelknochen konnten nicht vollständig geladen werden.</strong><br>${loadedCount} von ${BONES.length} Modellen wurden erreicht.<br><br>Bitte prüfe, ob der Ordner <code>games/schaedel-puzzle/models</code> mit veröffentlicht wurde, und lade die Seite danach neu.</div>`; console.error(err);
  }
}
function buildList(){boneList.innerHTML=''; pieces.forEach((p,i)=>{const b=p.userData.bone, el=document.createElement('div'); el.className='bone-item'; el.dataset.i=i; el.innerHTML=`<span class="swatch" style="background:${b.color}"></span><span>${b.de}</span><span class="check">✓</span>`; el.onclick=()=>selectPiece(p); boneList.appendChild(el);}); updateProgress();}
function selectPiece(p){selected=p; transform.detach(); if(!p) return; const b=p.userData.bone; boneName.textContent=b.de; boneLatin.textContent=b.la; if(started&&!p.userData.placed) transform.attach(p); clearHint();}
function setMode(mode){transform.setMode(mode); moveBtn.classList.toggle('active',mode==='translate'); rotateBtn.classList.toggle('active',mode==='rotate');}
function scatter(){
  started=true; completed=0; clearHint();
  const radius=105/root.scale.x;
  pieces.forEach((p,i)=>{p.userData.placed=false; const a=i/BONES.length*Math.PI*2, ring=(i%3)*18/root.scale.x; p.position.copy(p.userData.targetPosition).add(new THREE.Vector3(Math.cos(a)*(radius+ring),Math.sin(a)*(radius+ring),((i%5)-2)*23/root.scale.x)); p.rotation.set((i%4)*.35,(i%6)*.42,(i%3)*.27); p.material.opacity=1;});
  startBtn.textContent='Puzzle läuft'; startBtn.disabled=true; selectPiece(pieces[0]); updateProgress(); fitView(1.35); showToast('22 Knochen verteilt – viel Freude beim Puzzeln!');
}
function resetAssembled(){started=false; completed=BONES.length; clearHint(); pieces.forEach(p=>{p.position.copy(p.userData.targetPosition); p.quaternion.copy(p.userData.targetQuaternion); p.userData.placed=true;}); transform.detach(); startBtn.disabled=false; startBtn.textContent='Puzzle starten'; updateProgress(); fitView(1.05);}
function checkSnap(force=false){if(!selected||selected.userData.placed||!started)return; const d=selected.position.distanceTo(selected.userData.targetPosition); const qAngle=selected.quaternion.angleTo(selected.userData.targetQuaternion); const posTol=force?18/root.scale.x:10/root.scale.x, rotTol=force?Math.PI:0.65; if(d<posTol&&qAngle<rotTol){place(selected);} else showToast(force?'Noch nicht nah genug an der Zielposition.':'Fast – Position und Ausrichtung noch etwas korrigieren.');}
function place(p){p.position.copy(p.userData.targetPosition); p.quaternion.copy(p.userData.targetQuaternion); p.userData.placed=true; transform.detach(); completed=pieces.filter(x=>x.userData.placed).length; updateProgress(); showToast(`✓ ${p.userData.bone.de} sitzt richtig.`); const next=pieces.find(x=>!x.userData.placed); if(next) selectPiece(next); else finish();}
function finish(){startBtn.disabled=false; startBtn.textContent='Noch einmal spielen'; started=false; if(window.ZITPoints){const r=ZITPoints.award('schaedel-puzzle',20,'3D-Schädelpuzzle'); showToast(r.awarded?'Geschafft! +20 Punkte für deine Schmetterlingswiese 🦋':'Geschafft! Der Schädel ist vollständig.');}else showToast('Geschafft! Der Schädel ist vollständig.');}
function updateProgress(){completed=pieces.filter(p=>p.userData.placed).length; progressText.textContent=`${completed} / ${BONES.length}`; progressBar.style.width=`${completed/BONES.length*100}%`; [...boneList.children].forEach((el,i)=>{const done=pieces[i]?.userData.placed; el.classList.toggle('done',done); el.querySelector('.check').textContent=done?'✓':'';});}
function updateSelectionUI(){if(selected){boneName.textContent=selected.userData.bone.de; boneLatin.textContent=selected.userData.bone.la;}}
function showHint(){if(!selected||selected.userData.placed||!started)return; clearHint(); const ghost=new THREE.Mesh(selected.geometry,material(selected.userData.bone.color,.2)); ghost.position.copy(selected.userData.targetPosition); ghost.quaternion.copy(selected.userData.targetQuaternion); root.add(ghost); hintGhost=ghost; showToast('Die transparente Form zeigt die Zielposition.'); setTimeout(clearHint,3500);}
function clearHint(){if(hintGhost){root.remove(hintGhost); hintGhost.material.dispose(); hintGhost=null;}}
function showToast(msg){toast.textContent=msg; toast.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.remove('show'),2600);}
function fitView(mult=1.1){const box=new THREE.Box3().setFromObject(root), sphere=box.getBoundingSphere(new THREE.Sphere()); orbit.target.copy(sphere.center); const fov=THREE.MathUtils.degToRad(camera.fov); const dist=sphere.radius/Math.sin(fov/2)*mult; camera.position.copy(sphere.center).add(new THREE.Vector3(0,-dist*.9,dist*.22)); orbit.update();}
function pick(e){if(transform.dragging)return; const r=canvas.getBoundingClientRect(); pointer.x=(e.clientX-r.left)/r.width*2-1; pointer.y=-((e.clientY-r.top)/r.height*2-1); raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObjects(pieces,false); if(hits.length) selectPiece(hits[0].object);}
function resize(){const w=stage.clientWidth,h=stage.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();}
function animate(){requestAnimationFrame(animate); orbit.update(); renderer.render(scene,camera);}
canvas.addEventListener('pointerdown',pick); window.addEventListener('resize',resize); transform.addEventListener('mouseUp',()=>checkSnap(false));
startBtn.onclick=()=>scatter(); moveBtn.onclick=()=>setMode('translate'); rotateBtn.onclick=()=>setMode('rotate'); hintBtn.onclick=showHint; snapBtn.onclick=()=>checkSnap(true); resetBtn.onclick=resetAssembled;
window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return; if(e.key.toLowerCase()==='w')setMode('translate'); if(e.key.toLowerCase()==='e')setMode('rotate'); if(e.key.toLowerCase()==='h')showHint();});
init();

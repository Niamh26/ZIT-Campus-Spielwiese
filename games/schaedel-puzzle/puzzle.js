window.__skullPuzzleBooted=true;
import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/addons/controls/OrbitControls.js';
import { STLLoader } from './vendor/three/addons/loaders/STLLoader.js';
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
const guideGroup=new THREE.Group(); root.add(guideGroup); guideGroup.visible=false;
const gridHelper=new THREE.Group(); root.add(gridHelper); gridHelper.visible=false;
const targetMarker=new THREE.Group();
const ringMat=new THREE.LineBasicMaterial({color:0x36594b,transparent:true,opacity:.55,depthTest:false});
[38,52,66].forEach(r=>{
  const pts=[]; for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,-42));}
  targetMarker.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),ringMat));
});
targetMarker.visible=false; root.add(targetMarker);

const orbit=new OrbitControls(camera,canvas); orbit.enableDamping=true; orbit.target.set(0,0,5); orbit.minDistance=85; orbit.maxDistance=420;

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(); const loader=new STLLoader();
const pieces=[]; const guides=[]; let selected=null, started=false, completed=0, hintGhost=null;
let mode='translate', draggingPiece=false, dragMoved=false, dragStartX=0, dragStartY=0;
const dragPlane=new THREE.Plane(), dragHit=new THREE.Vector3(), dragOffset=new THREE.Vector3();
const localUrl=b=>`./models/${b.fma}.stl`;

function loadStl(url,timeoutMs=25000){return new Promise((resolve,reject)=>{let done=false;const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error('Zeitüberschreitung: '+url));},timeoutMs);loader.load(url,g=>{if(done)return;done=true;clearTimeout(timer);resolve(g);},undefined,e=>{if(done)return;done=true;clearTimeout(timer);reject(e||new Error('Ladefehler: '+url));});});}
async function loadGeometry(b){return await loadStl(localUrl(b),20000);}
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
      const guideMat=new THREE.MeshBasicMaterial({
        color:0xe7eee9,
        transparent:true,
        opacity:.48,
        depthWrite:false,
        depthTest:false,
        side:THREE.DoubleSide
      });
      const guide=new THREE.Mesh(g,guideMat);
      guide.position.copy(mesh.userData.targetPosition);
      guide.quaternion.copy(mesh.userData.targetQuaternion);
      guide.renderOrder=-2;
      guide.userData.piece=mesh;
      guideGroup.add(guide);

      const edgeGeo=new THREE.EdgesGeometry(g,18);
      const edgeMat=new THREE.LineBasicMaterial({color:0x36594b,transparent:true,opacity:.92,depthWrite:false,depthTest:false});
      const edge=new THREE.LineSegments(edgeGeo,edgeMat);
      edge.position.copy(mesh.userData.targetPosition);
      edge.quaternion.copy(mesh.userData.targetQuaternion);
      edge.renderOrder=-1;
      edge.userData.piece=mesh;
      guide.userData.edge=edge;
      guideGroup.add(edge);

      guides.push(guide);
    });
    const box=new THREE.Box3().setFromObject(root), size=box.getSize(new THREE.Vector3()); const scale=120/Math.max(size.x,size.y,size.z); root.scale.setScalar(scale);
    buildList(); loading.hidden=true; resize(); selectPiece(pieces[0]); animate();
  }catch(err){
    loading.innerHTML=`<div class="error"><strong>Die Schädelknochen konnten nicht vollständig geladen werden.</strong><br>${loadedCount} von ${BONES.length} Modellen wurden erreicht.<br><br>Bitte prüfe, ob der Ordner <code>games/schaedel-puzzle/models</code> mit veröffentlicht wurde, und lade die Seite danach neu.</div>`; console.error(err);
  }
}
function buildList(){boneList.innerHTML=''; pieces.forEach((p,i)=>{const b=p.userData.bone, el=document.createElement('div'); el.className='bone-item'; el.dataset.i=i; el.innerHTML=`<span class="swatch" style="background:${b.color}"></span><span>${b.de}</span><span class="check">✓</span>`; el.onclick=()=>selectPiece(p); boneList.appendChild(el);}); updateProgress();}
function selectPiece(p){
  selected=p; if(!p) return;
  const b=p.userData.bone; boneName.textContent=b.de; boneLatin.textContent=b.la; clearHint();
  guides.forEach(g=>{
    const active=g.userData.piece===p && started && !p.userData.placed;
    const placed=g.userData.piece.userData.placed;
    g.visible = started && !placed;
    g.material.color.set(active?b.color:0xd8e7df);
    g.material.opacity=active?.78:.48;
    if(g.userData.edge){
      g.userData.edge.visible = started && !placed;
      g.userData.edge.material.color.set(active?b.color:0x5d7d70);
      g.userData.edge.material.opacity=active?1:.92;
    }
  });
}
function setMode(nextMode){mode=nextMode; moveBtn.classList.toggle('active',mode==='translate'); rotateBtn.classList.toggle('active',mode==='rotate'); showToast(mode==='translate'?'Verschieben: Knochen direkt greifen und ziehen.':'Drehen: Knochen direkt greifen und ziehen.');}
function scatter(){
  started=true; completed=0; clearHint(); guideGroup.visible=true; targetMarker.visible=true;
  const radius=105/root.scale.x;
  pieces.forEach((p,i)=>{p.userData.placed=false; const a=i/BONES.length*Math.PI*2, ring=(i%3)*18/root.scale.x; p.position.copy(p.userData.targetPosition).add(new THREE.Vector3(Math.cos(a)*(radius+ring),Math.sin(a)*(radius+ring),((i%5)-2)*23/root.scale.x)); p.rotation.set((i%4)*.35,(i%6)*.42,(i%3)*.27); p.material.opacity=1;});
  startBtn.textContent='Puzzle läuft'; startBtn.disabled=true; selectPiece(pieces[0]); updateProgress(); fitView(1.35); showToast('Die helle Schädel-Silhouette in der Mitte ist dein Ziel.');
}
function resetAssembled(){started=false; completed=BONES.length; clearHint(); guideGroup.visible=false; targetMarker.visible=false; pieces.forEach(p=>{p.position.copy(p.userData.targetPosition); p.quaternion.copy(p.userData.targetQuaternion); p.userData.placed=true;}); startBtn.disabled=false; startBtn.textContent='Puzzle starten'; updateProgress(); fitView(1.05);}
function checkSnap(force=false){
  if(!selected||selected.userData.placed||!started)return;
  const d=selected.position.distanceTo(selected.userData.targetPosition);
  const posTol=(force?27:19)/root.scale.x;
  if(d<posTol){
    magneticPlace(selected);
  }else{
    showToast(force?'Noch etwas näher an die farbige Zielaussparung schieben.':'Noch nicht in der magnetischen Fangzone.');
  }
}
function magneticPlace(p){
  if(!p||p.userData.placed)return;
  const startPos=p.position.clone(), startQ=p.quaternion.clone();
  const endPos=p.userData.targetPosition.clone(), endQ=p.userData.targetQuaternion.clone();
  const t0=performance.now(), duration=180;
  p.userData.placed=true;
  function step(now){
    const t=Math.min(1,(now-t0)/duration), e=1-Math.pow(1-t,3);
    p.position.lerpVectors(startPos,endPos,e); p.quaternion.slerpQuaternions(startQ,endQ,e);
    if(t<1) requestAnimationFrame(step); else place(p,true);
  }
  requestAnimationFrame(step);
}
function place(p,alreadyLocked=false){
  p.position.copy(p.userData.targetPosition);
  p.quaternion.copy(p.userData.targetQuaternion);
  p.userData.placed=true;
  const g=guides[p.userData.index];
  if(g){g.visible=false; if(g.userData.edge) g.userData.edge.visible=false;}
  completed=pieces.filter(x=>x.userData.placed).length;
  updateProgress();
  showToast(`🧲 ✓ ${p.userData.bone.de} ist eingerastet.`);
  const next=pieces.find(x=>!x.userData.placed);
  if(next) selectPiece(next); else finish();
}
function finish(){startBtn.disabled=false; startBtn.textContent='Noch einmal spielen'; started=false; guideGroup.visible=false; targetMarker.visible=false; if(window.ZITPoints){const r=ZITPoints.award('schaedel-puzzle',20,'3D-Schädelpuzzle'); showToast(r.awarded?'Geschafft! +20 Punkte für deine Schmetterlingswiese 🦋':'Geschafft! Der Schädel ist vollständig.');}else showToast('Geschafft! Der Schädel ist vollständig.');}
function updateProgress(){completed=pieces.filter(p=>p.userData.placed).length; progressText.textContent=`${completed} / ${BONES.length}`; progressBar.style.width=`${completed/BONES.length*100}%`; [...boneList.children].forEach((el,i)=>{const done=pieces[i]?.userData.placed; el.classList.toggle('done',done); el.querySelector('.check').textContent=done?'✓':'';});}
function updateSelectionUI(){if(selected){boneName.textContent=selected.userData.bone.de; boneLatin.textContent=selected.userData.bone.la;}}
function showHint(){if(!selected||selected.userData.placed||!started)return; clearHint(); const ghost=new THREE.Mesh(selected.geometry,material(selected.userData.bone.color,.2)); ghost.position.copy(selected.userData.targetPosition); ghost.quaternion.copy(selected.userData.targetQuaternion); root.add(ghost); hintGhost=ghost; showToast('Die transparente Form zeigt die Zielposition.'); setTimeout(clearHint,3500);}
function clearHint(){if(hintGhost){root.remove(hintGhost); hintGhost.material.dispose(); hintGhost=null;}}
function showToast(msg){toast.textContent=msg; toast.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.remove('show'),2600);}
function fitView(mult=1.1){const box=new THREE.Box3().setFromObject(root), sphere=box.getBoundingSphere(new THREE.Sphere()); orbit.target.copy(sphere.center); const fov=THREE.MathUtils.degToRad(camera.fov); const dist=sphere.radius/Math.sin(fov/2)*mult; camera.position.copy(sphere.center).add(new THREE.Vector3(0,-dist*.9,dist*.22)); orbit.update();}
function setPointer(e){const r=canvas.getBoundingClientRect(); pointer.x=(e.clientX-r.left)/r.width*2-1; pointer.y=-((e.clientY-r.top)/r.height*2-1); raycaster.setFromCamera(pointer,camera);}
function pointerDown(e){
  setPointer(e);
  const hits=raycaster.intersectObjects(pieces,false);
  if(!hits.length){ draggingPiece=false; orbit.enabled=true; return; }
  const p=hits[0].object; selectPiece(p);
  if(!started||p.userData.placed){ draggingPiece=false; orbit.enabled=true; return; }
  draggingPiece=true; dragMoved=false; dragStartX=e.clientX; dragStartY=e.clientY; orbit.enabled=false;
  canvas.setPointerCapture?.(e.pointerId);
  if(mode==='translate'){
    const worldPos=p.getWorldPosition(new THREE.Vector3());
    const normal=camera.getWorldDirection(new THREE.Vector3());
    dragPlane.setFromNormalAndCoplanarPoint(normal,worldPos);
    if(raycaster.ray.intersectPlane(dragPlane,dragHit)){
      const localHit=root.worldToLocal(dragHit.clone());
      dragOffset.copy(p.position).sub(localHit);
    }
  }
  e.preventDefault();
}
function pointerMove(e){
  if(!draggingPiece||!selected||selected.userData.placed)return;
  const dx=e.clientX-dragStartX, dy=e.clientY-dragStartY;
  if(Math.abs(dx)+Math.abs(dy)>2) dragMoved=true;
  if(mode==='translate'){
    setPointer(e);
    if(raycaster.ray.intersectPlane(dragPlane,dragHit)){
      const localHit=root.worldToLocal(dragHit.clone());
      selected.position.copy(localHit.add(dragOffset));
      const d=selected.position.distanceTo(selected.userData.targetPosition);
      const g=guides[selected.userData.index];
      if(g){
        const near=d<24/root.scale.x;
        g.material.opacity=near?.92:.78;
        if(g.userData.edge) g.userData.edge.material.opacity=near?1:.95;
      }
    }
  }else{
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0).normalize();
    const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1).normalize();
    const qx=new THREE.Quaternion().setFromAxisAngle(up,dx*0.008);
    const qy=new THREE.Quaternion().setFromAxisAngle(right,dy*0.008);
    selected.quaternion.premultiply(qx).premultiply(qy).normalize();
    dragStartX=e.clientX; dragStartY=e.clientY;
  }
  e.preventDefault();
}
function pointerUp(e){
  if(!draggingPiece)return;
  draggingPiece=false; orbit.enabled=true; canvas.releasePointerCapture?.(e.pointerId);
  if(dragMoved) checkSnap(false);
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();}
function animate(){requestAnimationFrame(animate); orbit.update(); renderer.render(scene,camera);}
canvas.addEventListener('pointerdown',pointerDown); canvas.addEventListener('pointermove',pointerMove); canvas.addEventListener('pointerup',pointerUp); canvas.addEventListener('pointercancel',pointerUp); window.addEventListener('resize',resize);
startBtn.onclick=()=>scatter(); moveBtn.onclick=()=>setMode('translate'); rotateBtn.onclick=()=>setMode('rotate'); hintBtn.onclick=showHint; snapBtn.onclick=()=>checkSnap(true); resetBtn.onclick=resetAssembled;
window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return; if(e.key.toLowerCase()==='w')setMode('translate'); if(e.key.toLowerCase()==='e')setMode('rotate'); if(e.key.toLowerCase()==='h')showHint();});
init();

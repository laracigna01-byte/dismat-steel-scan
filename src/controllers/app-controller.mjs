import { interpretMarkers, rotateMarkersClockwise } from '../domain/reading.mjs';
import { FIELDS, makeId, todayLocal, validPhotoUrl } from '../domain/scan-model.mjs';
import { createScanRepository } from '../data/scan-repository.mjs';
import { makeBackup, parseBackup } from '../services/backup-service.mjs';
import { drawAnnotatedPhoto } from '../views/photo-canvas.mjs';
import { captureTrainingPhoto } from '../views/training-photo.mjs';
import { makeTrainingExample } from '../services/training-sample.mjs';
import { archiveMarkup } from '../views/archive-view.mjs';
import { makePrintHtml } from '../views/pdf-view.mjs';
import { initCatalogController } from '../catalog/catalog-controller.mjs';

const $ = id => document.getElementById(id);
const repository=createScanRepository();
let databaseReady=false;
let catalogController=null;
let photo = null;
let toastHandle;
let editingId = null;
let photoData = '';
let rotation = 0;
let reverse = false;
let markers = [];
let markerType = 'large';
let zoom = 100;
let contrast = 100;

function showToast(message, error=false){
  const node=$('toast'); node.textContent=message; node.className=`toast show ${error?'error':''}`;
  clearTimeout(toastHandle); toastHandle=setTimeout(()=>node.className='toast',4200);
}
const openDatabase = () => repository.open();
const getAllScans = () => repository.getAll();
const getScan = id => repository.get(id);
const putScan = scan => repository.put(scan);
const deleteScan = id => repository.delete(id);
function readFields(){return Object.fromEntries(FIELDS.map(id=>[id,$(id).value.trim()]));}
function writeFields(data){for(const id of FIELDS) $(id).value=data?.[id]??(id==='date'?todayLocal():(id==='outcome'?'Da verificare':''));}
async function imageFromFile(file){
  if(!file || !file.type.startsWith('image/'))throw new Error('Seleziona una fotografia valida.');
  if(file.size>45*1024*1024)throw new Error('Foto troppo grande (massimo 45 MB).');
  const objectUrl=URL.createObjectURL(file);
  try{
    const img=new Image();img.src=objectUrl;await img.decode();
    const ratio=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
    const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*ratio);c.height=Math.round(img.naturalHeight*ratio);
    if(!c.width||!c.height)throw new Error('La fotografia non è leggibile.');
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    return c.toDataURL('image/jpeg',.83);
  }finally{URL.revokeObjectURL(objectUrl);}
}
async function setPhoto(data){
  if(!data){photo=null;photoData='';$('imageCanvas').hidden=true;$('photoPlaceholder').hidden=false;renderPhoto();return;}
  if(!validPhotoUrl(data))throw new Error('Formato immagine non supportato.');
  const img=new Image();img.src=data;await img.decode();
  photo=img;photoData=data;$('imageCanvas').hidden=false;$('photoPlaceholder').hidden=true;renderPhoto();
}
async function onPhotoChosen(event){
  const input=event.currentTarget;const f=input.files?.[0];input.value='';if(!f)return;
  if(markers.length && !confirm('Sostituire la fotografia? I marcatori di questa scheda saranno cancellati.'))return;
  try{const compressed=await imageFromFile(f);rotation=0;reverse=false;markers=[];zoom=100;contrast=100;
    $('zoomRange').value='100';$('contrastRange').value='100'; await setPhoto(compressed);updateReading();showToast('Fotografia acquisita. Puoi marcare le nervature.');
  }catch(e){showToast(e.message||'Impossibile leggere la foto.',true);}
}
function renderPhoto(){
  const ready=!!photo;
  for(const id of ['rotateButton','zoomRange','contrastRange'])$(id).disabled=!ready;
  $('undoButton').disabled=!markers.length;$('clearButton').disabled=!markers.length;
  if(!photo)return;
  drawAnnotatedPhoto({canvas:$('imageCanvas'),stageElement:$('photoStage'),photo,markers,rotation,zoom,contrast});
}
function onImageTap(e){
  if(!photo)return;
  const r=e.currentTarget.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  if(x<0||x>1||y<0||y>1)return;
  const near=markers.findIndex(m=>Math.hypot((m.x-x)*r.width,(m.y-y)*r.height)<14);
  if(near>=0){markers.splice(near,1);}else markers.push({x,y,type:markerType});
  renderPhoto();updateReading();
}
function updateReading(){
  const result=interpretMarkers(markers,reverse);
  $('codeResult').textContent=result.code||'—';$('largeCounter').textContent=`${result.largeCount} ingrossate`;$('normalCounter').textContent=`${result.normalCount} normali`;
  $('codeHelp').textContent=!result.code?'Marca almeno due nervature ingrossate e le nervature normali intermedie.':(!result.complete?'Sequenza parziale: aggiungi le altre nervature di riferimento.':'Verifica visivamente il conteggio e la direzione di lettura.');
  $('undoButton').disabled=!markers.length;$('clearButton').disabled=!markers.length;
  $('lookupCodeButton').disabled=!result.code;
  $('exportTrainingSampleButton').disabled=!(photo && result.complete);
  return result;
}
function showPanel(panel){
  for(const name of ['scanner','catalog','archive','guide'])$(name+'Panel').hidden=name!==panel;
  document.querySelectorAll('[data-panel]').forEach(b=>b.classList.toggle('is-active',b.dataset.panel===panel));
  $('currentSection').textContent={scanner:'Scanner',catalog:'Acciaierie',archive:'Archivio',guide:'Guida'}[panel];
  if(panel==='catalog')catalogController?.render();if(panel==='archive')renderArchive();if(panel==='scanner')setTimeout(renderPhoto,0);
  window.scrollTo({top:0,behavior:'smooth'});
}
async function resetScan(){
  if(photo && (markers.length || $('site').value || $('notes').value) && !confirm('Creare una nuova scheda? Prima salva quella attuale se vuoi conservarla.'))return;
  editingId=null;markers=[];reverse=false;rotation=0;zoom=100;contrast=100;$('zoomRange').value='100';$('contrastRange').value='100';writeFields();await setPhoto('');updateReading();showPanel('scanner');
  showToast('Nuova scheda pronta.');
}
function collectScan(){
  const result=updateReading();return {
    id:editingId??makeId(), createdAt:undefined, updatedAt:new Date().toISOString(),
    fields:readFields(), photo:photoData, annotatedPhoto:photo ? $('imageCanvas').toDataURL('image/jpeg',.85) : '', rotation,markers:markers.map(m=>({...m})),reversed:reverse,contrast,
    code:result.code
  };
}
async function saveCurrent(){
  if(!photo){showToast('Prima acquisisci la fotografia del tondino.',true);return;}
  if(!databaseReady){showToast('Archivio locale non disponibile. Usa Chrome/Edge su localhost o HTTPS.',true);return;}
  try{const scan=collectScan();const old=editingId?await getScan(editingId):null;scan.createdAt=old?.createdAt??scan.updatedAt;await putScan(scan);editingId=scan.id;await updateCount();showToast('Scheda salvata nell’archivio locale. Ricordati il backup JSON.');}
  catch(e){console.error(e);showToast('Salvataggio non riuscito: verifica lo spazio libero del browser.',true);}
}
async function updateCount(){if(!databaseReady)return;const scans=await getAllScans();$('sideCount').textContent=String(scans.length);}
async function loadScan(id){
  try{const s=await getScan(id);if(!s)return;editingId=s.id;writeFields(s.fields);rotation=[0,90,180,270].includes(s.rotation)?s.rotation:0;reverse=!!s.reversed;
    markers=Array.isArray(s.markers)?s.markers.filter(m=>['large','normal'].includes(m.type)&&Number.isFinite(m.x)&&Number.isFinite(m.y)).map(m=>({x:m.x,y:m.y,type:m.type})):[];
    zoom=100;contrast=Number(s.contrast)||100;$('contrastRange').value=String(contrast);$('zoomRange').value='100';await setPhoto(s.photo);updateReading();showPanel('scanner');showToast('Scheda caricata.');
  }catch(e){console.error(e);showToast('Non è stato possibile aprire la scheda.',true);}
}
async function renderArchive(){
  const target=$('archiveList');if(!databaseReady){target.innerHTML='<div class="archive-empty">Archivio non disponibile in questo browser.</div>';return;}
  let scans;try{scans=await getAllScans();}catch(e){showToast('Errore lettura archivio.',true);return;}
  scans.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
  const q=$('archiveSearch').value.toLocaleLowerCase('it');
  if(q)scans=scans.filter(s=>[s.code,...Object.values(s.fields||{})].join(' ').toLocaleLowerCase('it').includes(q));
  target.innerHTML=archiveMarkup(scans,q);
}
function exportTrainingSample() {
  if (!photo) {showToast('Prima acquisisci la fotografia.',true);return;}
  if (!interpretMarkers(markers,reverse).complete) {
    showToast('Prima completa e controlla i marcatori.',true);return;
  }
  if (!confirm('Confermi di avere i diritti per usare questa fotografia come esempio di addestramento e di avere verificato tutti i marcatori? Il file conterrà solo la fotografia e i punti marcati, NON dati di cantiere. Non verrà caricato online.'))return;
  try{
    const image=captureTrainingPhoto(photo,rotation);
    const record=makeTrainingExample({
      ...image,markers,reversed:reverse,operatorConfirmed:true
    });
    const blob=new Blob([JSON.stringify(record)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download='DISMAT-ribs-esempio-'+todayLocal()+'-'+makeId().slice(0,8)+'.json';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
    showToast('Esempio annotato esportato sul dispositivo. Nessuna foto inviata online.');
  }catch(e){console.error(e);showToast(e.message||'Esportazione esempio non riuscita.',true);}
}

async function exportBackup(){
  if(!databaseReady){showToast('Archivio non disponibile.',true);return;}
  const all=await getAllScans();if(!all.length){showToast('Non ci sono schede da esportare.',true);return;}
  const payload=makeBackup(all);
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`DISMAT-Steel-Scan-backup-${todayLocal()}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
  showToast(`Backup creato: ${all.length} schede con fotografie.`);
}
async function importBackup(event){
  const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(!file)return;
  if(!databaseReady){showToast('Archivio non disponibile.',true);return;}
  try{
    if(file.size>150*1024*1024)throw new Error('Backup troppo grande (massimo 150 MB).');
    const valid=parseBackup(await file.text());
    if(!confirm(`Importare ${valid.length} schede? Le schede con lo stesso identificativo verranno aggiornate. L'archivio attuale non sarà cancellato.`))return;
    let count=0;for(const s of valid){await putScan(s);count++;}
    await updateCount();await renderArchive();showToast(`${count} schede importate nell'archivio.`);
  }catch(e){console.error(e);showToast(e.message||'Errore nell’importazione.',true);}
}
function printRecord(scan){
  if(!validPhotoUrl(scan.photo)){showToast('Questa scheda non contiene una foto valida.',true);return;}
  const popup=window.open('','_blank');
  if(!popup){showToast('Permetti i pop-up per aprire la stampa PDF.',true);return;}
  popup.document.open();popup.document.write(makePrintHtml(scan));popup.document.close();
}
function currentForPrint(){
  if(!photo){showToast('Prima carica una fotografia.',true);return;}
  const scan=collectScan();printRecord(scan);
}
async function onArchiveClick(e){
  const b=e.target.closest('button[data-action]');if(!b)return;const id=b.dataset.id,action=b.dataset.action;
  if(action==='open'){await loadScan(id);return;}
  if(action==='print'){const s=await getScan(id);if(s)printRecord(s);return;}
  if(action==='delete'&&confirm('Eliminare definitivamente questa scheda dal dispositivo? Esporta prima il backup se vuoi conservarla.')){
    await deleteScan(id);if(editingId===id)editingId=null;await updateCount();await renderArchive();showToast('Scheda eliminata.');
  }
}

function setup(){
  for(const btn of document.querySelectorAll('[data-panel]'))btn.addEventListener('click',()=>showPanel(btn.dataset.panel));
  $('cameraInput').addEventListener('change',onPhotoChosen);$('imageInput').addEventListener('change',onPhotoChosen);
  $('imageCanvas').addEventListener('click',onImageTap);
  document.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{markerType=b.dataset.type;document.querySelectorAll('[data-type]').forEach(e=>e.classList.toggle('is-selected',e===b));}));
  $('rotateButton').addEventListener('click',()=>{rotation=(rotation+90)%360;markers=rotateMarkersClockwise(markers);renderPhoto();updateReading();});
  $('undoButton').addEventListener('click',()=>{markers.pop();renderPhoto();updateReading();});
  $('clearButton').addEventListener('click',()=>{if(markers.length&&confirm('Rimuovere tutti i marcatori?')){markers=[];renderPhoto();updateReading();}});
  $('exportTrainingSampleButton').addEventListener('click',exportTrainingSample);
  $('reverseButton').addEventListener('click',()=>{reverse=!reverse;updateReading();showToast(reverse?'Lettura invertita.':'Lettura normale.');});
  $('zoomRange').addEventListener('input',e=>{zoom=Number(e.target.value);$('zoomValue').textContent=`${zoom}%`;renderPhoto();});
  $('contrastRange').addEventListener('input',e=>{contrast=Number(e.target.value);renderPhoto();});
  $('saveButton').addEventListener('click',saveCurrent);$('newButton').addEventListener('click',resetScan);
  $('printButton').addEventListener('click',currentForPrint);$('archiveSearch').addEventListener('input',renderArchive);
  $('exportButton').addEventListener('click',exportBackup);$('importInput').addEventListener('change',importBackup);
  $('archiveList').addEventListener('click',onArchiveClick);
  $('lookupCodeButton').addEventListener('click',()=>{const code=updateReading().code;showPanel('catalog');catalogController?.searchCode(code);});
  catalogController=initCatalogController({notify:showToast});
  window.addEventListener('resize',()=>{if(!$('scannerPanel').hidden)renderPhoto();});
  writeFields();updateReading();
}
export async function start(){
  setup();try{await openDatabase();databaseReady=true;await updateCount();}catch(e){console.error(e);showToast('Archivio non disponibile. Apri l’app dal file AVVIA_WINDOWS.bat.',true);}
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('Offline non disponibile:',e));
  }
}

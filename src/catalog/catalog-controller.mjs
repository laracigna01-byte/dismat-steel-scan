import {CATALOG_FIELDS,normalizeMark} from './catalog-model.mjs';
import {createCatalogStore} from './catalog-store.mjs';
import {catalogMarkup} from './catalog-view.mjs';
import {CATALOG_REVISION,OFFICIAL_CATALOG} from './catalog-data.mjs';

const $=id=>document.getElementById(id);
function downloadJson(text){
  const blob=new Blob([text],{type:'application/json'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`DISMAT-Steel-Scan-catalogo-manuale-${new Date().toISOString().slice(0,10)}.json`;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
export function initCatalogController({notify}) {
  let store,editing=null;
  try{store=createCatalogStore();store.manual();}catch(e){notify('Catalogo manuale non disponibile: '+e.message,true);}
  function render(){
    $('catalogRevision').textContent=`${OFFICIAL_CATALOG.length} attestati trascritti da documenti pubblici · controllo fonti ${CATALOG_REVISION}`;
    try{
      const all=store?store.all():OFFICIAL_CATALOG;
      const kind=$('catalogProductFilter').value;
      const shown=kind==='tutti'?all:all.filter(item=>item.productKind===kind);
      $('catalogList').innerHTML=catalogMarkup(shown,$('catalogSearch').value);
      $('catalogCount').textContent=String(all.length);
    }catch(e){notify(e.message,true);$('catalogList').textContent='Errore di lettura del catalogo locale.';}
  }
  function clearForm(){editing=null;$('catalogEditTitle').textContent='Nuova scheda manuale';$('catalogEntryForm').reset();$('catalogFormWrap').hidden=true;}
  function openForm(item=null){
    editing=item?.id??null;
    for(const key of CATALOG_FIELDS) $(`catalog_${key}`).value=item?.[key]??'';
    $('catalogEditTitle').textContent=item?'Modifica scheda manuale':'Nuova scheda manuale';
    $('catalogFormWrap').hidden=false;$('catalogFormWrap').scrollIntoView({behavior:'smooth',block:'start'});
  }
  $('catalogSearch').addEventListener('input',render);
  $('catalogProductFilter').addEventListener('change',render);
  $('catalogAddButton').addEventListener('click',()=>openForm());
  $('catalogCancelButton').addEventListener('click',clearForm);
  $('catalogEntryForm').addEventListener('submit',event=>{
    event.preventDefault();if(!store){notify('Archivio catalogo non disponibile.',true);return;}
    try{
      const entry=Object.fromEntries(CATALOG_FIELDS.map(k=>[k,$(`catalog_${k}`).value]));
      if(editing)entry.id=editing;
      store.save(entry);clearForm();render();notify('Scheda manuale salvata sul dispositivo (non verificata).');
    }catch(e){notify(e.message,true);}
  });
  $('catalogList').addEventListener('click',event=>{
    const btn=event.target.closest('button[data-catalog-action]');if(!btn||!store)return;
    const item=store.manual().find(x=>x.id===btn.dataset.id);if(!item)return;
    if(btn.dataset.catalogAction==='edit'){openForm(item);return;}
    if(btn.dataset.catalogAction==='delete'&&confirm('Eliminare questa scheda manuale? Le schede scanner non verranno toccate.')){
      try{store.remove(item.id);render();notify('Scheda manuale eliminata.');}catch(e){notify(e.message,true);}
    }
  });
  $('catalogExportButton').addEventListener('click',()=>{
    try{if(!store)throw new Error('Archivio non disponibile.');downloadJson(store.exportJson());notify('Backup del catalogo manuale esportato.');}catch(e){notify(e.message,true);}
  });
  $('catalogImportInput').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';if(!file||!store)return;
    try{
      if(file.size>2_000_000)throw new Error('File troppo grande (massimo 2 MB).');
      const raw=await file.text();
      // Validate without mutating if not confirmed.
      const payload=JSON.parse(raw);
      if(payload?.app!=='DISMAT Steel Scan'||payload?.type!=='catalog-manual'||payload?.schemaVersion!==1||!Array.isArray(payload.entries))throw new Error('Backup catalogo non compatibile.');
      if(!confirm(`Importare ${payload.entries.length} schede manuali? Quelle con lo stesso ID verranno sostituite; le scansioni restano intatte.`))return;
      const count=store.importJson(raw);render();notify(`${count} schede manuali importate.`);
    }catch(e){notify(e.message||'Importazione catalogo non riuscita.',true);}
  });
  render();
  return {
    render,
    searchCode(code){
      const normalized=normalizeMark(code);
      $('catalogSearch').value=normalized||'';
      $('catalogProductFilter').value='barre';
      render();
      if(normalized)notify('Corrispondenze documentali da verificare sull’attestato originale.');
    }
  };
}

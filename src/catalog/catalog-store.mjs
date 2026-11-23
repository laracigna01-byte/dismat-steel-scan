/** Local catalogue entries (separate from scans IndexedDB and scan backups). */
import {CATALOG_STORAGE_KEY,validateManualEntry} from './catalog-model.mjs';
import {OFFICIAL_CATALOG} from './catalog-data.mjs';

export function createCatalogStore(storage=globalThis.localStorage) {
  function readManual() {
    const raw=storage.getItem(CATALOG_STORAGE_KEY);
    if(!raw)return [];
    let data;
    try{data=JSON.parse(raw);}catch{throw new Error('Archivio catalogo non leggibile: esporta una copia prima di modificarlo.');}
    if(!Array.isArray(data))throw new Error('Archivio catalogo danneggiato.');
    return data.map(validateManualEntry);
  }
  function writeManual(records){storage.setItem(CATALOG_STORAGE_KEY,JSON.stringify(records));}
  return {
    all(){return [...OFFICIAL_CATALOG,...readManual()];},
    manual(){return readManual();},
    save(input){
      const record=validateManualEntry(input);
      const records=readManual();
      const idx=records.findIndex(x=>x.id===record.id);
      if(idx>=0)records[idx]=record;else records.push(record);
      writeManual(records);
      return record;
    },
    remove(id){
      if(!String(id).startsWith('manual-'))throw new Error('Le schede documentali di riferimento non sono modificabili.');
      const records=readManual();const next=records.filter(x=>x.id!==id);
      if(next.length===records.length)throw new Error('Voce non trovata.');
      writeManual(next);
    },
    exportJson(){return JSON.stringify({app:'DISMAT Steel Scan',type:'catalog-manual',schemaVersion:1,exportedAt:new Date().toISOString(),entries:readManual()},null,2);},
    importJson(raw){
      if(typeof raw!=='string'||raw.length>2000000)throw new Error('File catalogo troppo grande.');
      let payload;try{payload=JSON.parse(raw);}catch{throw new Error('JSON non valido.');}
      if(payload?.app!=='DISMAT Steel Scan'||payload?.type!=='catalog-manual'||payload?.schemaVersion!==1||!Array.isArray(payload.entries)||payload.entries.length>500)
        throw new Error('Formato non compatibile con il backup del catalogo.');
      const imported=payload.entries.map(validateManualEntry);
      if(new Set(imported.map(x=>x.id)).size!==imported.length)throw new Error('Identificativi duplicati nel file.');
      const merged=new Map(readManual().map(x=>[x.id,x]));
      for(const entry of imported)merged.set(entry.id,entry);
      writeManual([...merged.values()]);
      return imported.length;
    }
  };
}

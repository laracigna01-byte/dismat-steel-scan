/** Independent catalogue domain model: no browser or persistence dependencies. */
export const CATALOG_FIELDS = Object.freeze(['producer','plant','markCode','steel','product','diameters','certificate','validFrom','validUntil','sourceUrl','notes']);
export const CATALOG_STORAGE_KEY = 'dismat-steel-scan-custom-catalog-v1';

export function normalizeMark(value) {
  const normalized=String(value??'').trim().replace(/[\s·,;–—_/]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  return /^\d+(?:-\d+){1,7}$/.test(normalized) ? normalized : '';
}
export function catalogueSearch(records, query) {
  const q=String(query??'').trim().toLocaleLowerCase('it');
  const mark=normalizeMark(q);
  if(!q)return [...records];
  return records.filter(r=>{
    const text=[r.producer,r.plant,r.steel,r.product,r.diameters,r.certificate,r.markCode].join(' ').toLocaleLowerCase('it');
    return text.includes(q) || (mark && normalizeMark(r.markCode)===mark);
  });
}
export function documentDateState(item, date='2026-11-23') {
  if(!item.validUntil)return 'unknown';
  if(item.validFrom && date < item.validFrom)return 'not-yet-valid';
  return date > item.validUntil ? 'expired-by-date' : 'within-document-dates';
}
export function validateManualEntry(value) {
  if(!value || typeof value!=='object')throw new Error('Voce del catalogo non valida.');
  const entry={};
  for(const key of CATALOG_FIELDS) {
    const field=value[key]??'';
    if(typeof field!=='string'&&typeof field!=='number')throw new Error('Campo catalogo non valido: '+key);
    entry[key]=String(field).trim().slice(0,key==='notes'?1000:300);
  }
  if(!entry.producer || entry.producer.length<2)throw new Error('Inserisci il produttore.');
  if(entry.markCode && !normalizeMark(entry.markCode))throw new Error('Codice marchio non valido: usa es. 0-4-2-6.');
  entry.markCode=normalizeMark(entry.markCode);
  for(const key of ['validFrom','validUntil']) {
    if(entry[key] && (!/^\d{4}-\d\d-\d\d$/.test(entry[key]) || Number.isNaN(Date.parse(entry[key]))))throw new Error('Data non valida: '+key);
  }
  if(entry.validFrom && entry.validUntil && entry.validFrom>entry.validUntil)throw new Error('Scadenza precedente all’inizio della validita.');
  if(entry.sourceUrl && !/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(entry.sourceUrl))throw new Error('Usa un collegamento HTTPS valido.');
  const id=typeof value.id==='string'&&/^manual-[a-z\d-]{5,120}$/i.test(value.id)?value.id:`manual-${globalThis.crypto?.randomUUID?.()??Date.now().toString(36)}`;
  return {...entry,id,origin:'manual',sourceLabel:'Inserimento manuale · non verificato'};
}

/** Exact scan matches on bar attestations within the document date range only.
 * This does NOT check the current STC registry. */
export function exactScannerMatches(records,code,date=new Date().toISOString().slice(0,10)) {
  const mark=normalizeMark(code);
  if(!mark)return [];
  return records.filter(item=>item.origin==='published-document' && item.productKind==='barre' && normalizeMark(item.markCode)===mark && documentDateState(item,date)==='within-document-dates');
}

/** Archive markup: view layer only, receives already filtered records. */
import { html } from './html.mjs';
import { validPhotoUrl } from '../domain/scan-model.mjs';
export function archiveMarkup(scans, q='') {
  if(!scans.length){return `<div class="archive-empty"><strong>${q?'Nessun risultato':'Archivio vuoto'}</strong>${q?'Prova a modificare la ricerca.':'Le schede salvate appariranno qui.'}</div>`;return;}
  return scans.map(s=>{
    const f=s.fields||{};const date=f.date?html(f.date.split('-').reverse().join('/')):'Data non indicata';const safeSrc=validPhotoUrl(s.photo)?s.photo:'';
    return `<article class="archive-item"><img class="archive-thumb" src="${safeSrc}" alt="Fotografia del tondino"><div class="archive-info"><h3>${html(f.site||'Cantiere non indicato')}</h3><div class="archive-meta">${date} &nbsp;·&nbsp; ${html(f.location||'Posizione non indicata')}<br>Codice: <span class="archive-code">${html(s.code||'da leggere')}</span> &nbsp;·&nbsp; ${html(f.outcome||'Da verificare')}</div></div><div class="archive-actions"><button class="button button-outline" data-action="open" data-id="${html(s.id)}">Apri</button><button class="button button-outline" data-action="print" data-id="${html(s.id)}">PDF</button><button class="button button-danger" data-action="delete" data-id="${html(s.id)}">Elimina</button></div></article>`;
  }).join('');
}

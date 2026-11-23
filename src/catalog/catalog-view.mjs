/** Safe, compact catalogue cards. The source documents remain authoritative. */
import {html} from '../views/html.mjs';
import {catalogueSearch,documentDateState} from './catalog-model.mjs';

export function catalogMarkup(records,query,date=new Date().toISOString().slice(0,10)) {
  const matches=catalogueSearch(records,query);
  if(!matches.length)return '<div class="archive-empty"><strong>Nessuna corrispondenza</strong>Prova un altro codice, produttore o numero di attestato. Nessuna identificazione viene dedotta automaticamente.</div>';
  return matches.map(item=>{
    const documented=item.origin==='published-document';
    const dateState=documentDateState(item,date);
    const dateNote=dateState==='expired-by-date'?'Scaduto secondo la data del documento':dateState==='within-document-dates'?'Entro le date riportate nel documento':dateState==='not-yet-valid'?'Non ancora nel periodo riportato':'Validita non verificata';
    const safeUrl=typeof item.sourceUrl==='string'&&/^https:\/\/[^\s]+$/i.test(item.sourceUrl)?item.sourceUrl:'';
    return `<article class="catalog-card">
      <div class="catalog-card-top"><span class="catalog-origin ${documented?'documented':'manual'}">${documented?'DOCUMENTO STC':'INSERIMENTO MANUALE · NON VERIFICATO'}</span><span class="catalog-code">${html(item.markCode||'Marchio non indicato')}</span></div>
      <h3>${html(item.producer)}</h3>
      <p class="catalog-plant">${html(item.plant||'Stabilimento da inserire')}</p>
      <div class="catalog-facts"><span><strong>Prodotto</strong>${html(item.steel||'—')} · ${html(item.product||'Non indicato')}</span><span><strong>Diametri</strong>${html(item.diameters||'—')}</span><span><strong>Attestato</strong>${html(item.certificate||'Non inserito')}</span><span><strong>Termine documento</strong>${html(item.validUntil||'Non indicato')}</span></div>
      <p class="catalog-date ${dateState==='expired-by-date'?'expired':''}">${html(dateNote)}. Non equivale a una verifica STC in tempo reale.</p>
      <p class="catalog-notes">${html(item.notes||'')}</p>
      <div class="catalog-actions">${safeUrl?`<a class="button button-outline" target="_blank" rel="noopener noreferrer" href="${html(safeUrl)}">↗ Fonte originale</a>`:''}
      ${documented?`<span class="catalog-checked">Fonte letta il ${html(item.checkedOn)} · da ricontrollare</span>`:`<button class="button button-outline" data-catalog-action="edit" data-id="${html(item.id)}">Modifica</button><button class="button button-danger" data-catalog-action="delete" data-id="${html(item.id)}">Elimina</button>`}</div>
    </article>`;
  }).join('');
}

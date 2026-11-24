/** Safe, compact catalogue cards. The source documents remain authoritative. */
import {html} from '../views/html.mjs';
import {catalogueSearch,documentDateState} from './catalog-model.mjs';

export function catalogMarkup(records,query,date=new Date().toISOString().slice(0,10)) {
  const matches=catalogueSearch(records,query);
  if(!matches.length)return '<div class="archive-empty"><strong>Nessuna corrispondenza</strong>Prova un altro codice, produttore o numero di attestato. Nessuna identificazione viene dedotta automaticamente.</div>';
  return matches.map(item=>{
    const documented=item.origin==='published-document';
    const technical=item.origin==='technical-sheet';
    const historical=item.origin==='historical-document';
    const curated=documented||technical||historical;
    const dateState=documentDateState(item,date);
    const dateNote=historical?'Documento storico scaduto: non valido per comprovare la qualificazione attuale':technical?'Scheda tecnica: non dimostra la validità STC':dateState==='expired-by-date'?'Scaduto secondo la data del documento':dateState==='within-document-dates'?'Entro le date riportate nel documento':dateState==='not-yet-valid'?'Non ancora nel periodo riportato':'Validita non verificata';
    const safeUrl=typeof item.sourceUrl==='string'&&/^https:\/\/[^\s]+$/i.test(item.sourceUrl)?item.sourceUrl:'';
    return `<article class="catalog-card">
      <div class="catalog-card-top"><span class="catalog-origin ${historical?'historic':documented?'documented':technical?'technical':'manual'}">${historical?'ATTESTATO STORICO · SCADUTO':documented?'ATTESTATO STC · VERIFICA DOCUMENTALE':technical?'SCHEDA TECNICA · NON È ATTESTATO STC':'INSERIMENTO MANUALE · NON VERIFICATO'}</span><span class="catalog-code">${html(item.markCode||'Non numerico / n.d.')}</span></div>
      <h3>${html(item.producer)}</h3><span class="catalog-kind">${html(({barre:'Barre',rotoli:'Rotoli',filo:'Filo',reti:'Reti elettrosaldate',tralicci:'Tralicci'})[item.productKind]||'Tipologia non specificata')}</span>
      <p class="catalog-plant">${html(item.plant||'Stabilimento da inserire')}</p>
      <div class="catalog-facts"><span><strong>Prodotto</strong>${html(item.steel||'—')} · ${html(item.product||'Non indicato')}</span><span><strong>Diametri</strong>${html(item.diameters||'—')}</span><span><strong>Attestato STC</strong>${html(item.certificate|| (technical?'Non presente in questa fonte':'Non inserito'))}</span><span><strong>Termine documento</strong>${html(item.validUntil||'Non indicato')}</span></div>
      <p class="catalog-date ${historical||dateState==='expired-by-date'?'expired':''}">${html(dateNote)}. Non equivale a una verifica STC in tempo reale.</p>
      <p class="catalog-notes">${html(item.notes||'')}</p>
      <div class="catalog-actions">${safeUrl?`<a class="button button-outline" target="_blank" rel="noopener noreferrer" href="${html(safeUrl)}">↗ Fonte originale</a>`:''}
      ${curated?`<span class="catalog-checked">${html(item.sourceLabel||'Documento del produttore')} · consultato il ${html(item.checkedOn||'—')}</span>`:`<button class="button button-outline" data-catalog-action="edit" data-id="${html(item.id)}">Modifica</button><button class="button button-danger" data-catalog-action="delete" data-id="${html(item.id)}">Elimina</button>`}</div>
    </article>`;
  }).join('');
}

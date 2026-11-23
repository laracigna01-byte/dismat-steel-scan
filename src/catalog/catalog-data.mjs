/**
 * Curated offline reference: source documents published by steel producers.
 * The date range reflects the document, NOT a live STC registry lookup.
 * Only bar attestations with a readable rolling mark are listed here.
 */
export const CATALOG_REVISION = '2026-11-23';
export const OFFICIAL_CATALOG = Object.freeze([
  Object.freeze({
    id: 'stc-alfa-029-24', origin: 'published-document',
    producer: 'ALFA ACCIAI S.p.A.', plant: 'San Polo (BS), Via S. Polo 152',
    markCode: '0-4-2-6', steel: 'B450C', product: 'Barre laminate a caldo',
    diameters: '8-32 mm', certificate: '029/24-CA',
    validFrom: '2024-07-11', validUntil: '2028-12-03',
    sourceUrl: 'https://cms.alfaacciai.it/uploads/029_24_Attestato_ALFA_ACCIAI_barre_signed_0cb72f297b.pdf',
    sourceLabel: 'Attestato STC pubblicato da Alfa Acciai', checkedOn: '2026-11-23',
    notes: 'Il documento annulla 037/23. La validita puo cessare prima del termine per modifiche delle condizioni produttive.'
  }),
  Object.freeze({
    id: 'stc-valsabbia-036-23', origin: 'published-document',
    producer: 'FERRIERA VALSABBIA S.p.A.', plant: 'Odolo (BS), Via Marconi 13/15',
    markCode: '0-4-1-9', steel: 'B450C', product: 'Barre laminate a caldo',
    diameters: '8-40 mm', certificate: '036/23-CA',
    validFrom: '2023-12-04', validUntil: '2028-12-03',
    sourceUrl: 'https://www.ferriera-valsabbia.com/wp-content/uploads/2024/09/I-att-valsabbia-signed-2023-28.pdf',
    sourceLabel: 'Attestato STC pubblicato da Ferriera Valsabbia', checkedOn: '2026-11-23',
    notes: 'Il documento rinnova 042/18-CA. La validita puo cessare prima del termine per modifiche delle condizioni produttive.'
  })
]);

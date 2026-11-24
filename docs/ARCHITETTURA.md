# Architettura e principi DISMAT Steel Scan

## Obiettivo
PWA leggera e offline-first, isolata dalle altre app DISMAT, sviluppata con codice originale. Prima release: lettura assistita manuale, CRUD scansioni, backup JSON, scheda PDF. La lettura NON è identificazione ufficiale del produttore e NON certifica la conformità.

## Moduli MVC
- **Model** `src/domain/`: regole, normalizzazione e algoritmo di lettura. Nessuna dipendenza dal DOM o da IndexedDB.
- **Data** `src/data/`: repository CRUD, unica interfaccia con IndexedDB. Schema persistente `dismat-steel-scan-v1`, store `scans`, versione 1.
- **Service** `src/services/`: formato del backup, validazioni e regole di importazione.
- **View** `src/views/`: canvas, archivio HTML, stampa PDF, escaping del testo.
- **Controller** `src/controllers/`: collega gli eventi, le viste e i modelli, gestisce i flussi utente. `app.js` è solo il punto d'ingresso.

## Regole
1. **MVP**: funzionalità essenziali e verificabili prima dell'IA.
2. **DRY**: regole di validazione e modello dati in un solo punto, niente duplicazioni.
3. **CRUD**: creare, leggere, modificare, eliminare schede, con conferma sulle operazioni distruttive.
4. **Offline-first**: nessun server obbligatorio, ma HTTPS o localhost per PWA/IndexedDB.
5. **Dati**: nessuna telemetria o invio di fotografie; l'archivio è locale per dispositivo. Backup manuale periodico; non confondere GitHub con un sistema di sincronizzazione dei dati.
6. **Retrocompatibilità**: mantenere nome DB/store e schema del backup finché non è implementata una migrazione testata. Non eliminare mai dati in automatico durante update.
7. **Tecnica**: una sequenza di intervalli non è da sola la prova dell'identità dell'acciaieria; qualsiasi codice è 'da confermare' con fonti originali e personale tecnico competente.
8. **Controllo qualità**: eseguire `npm test`, smoke test scanner/CRUD/import-export/PDF e verifiche Android/iPhone prima di rilasciare.
9. **Protezione**: repository aziendale privato. Nessun dato personale, fotografia di cantiere, credenziale o backup reale nel repository.

## Roadmap breve
- MVP manuale: foto, marcatori, CRUD, backup JSON, stampa PDF.
- Catalogo STC: fonti, provenienza e data aggiornamento, verifica documentale.
- Scanner assistito: prove su fotografie reali, misure di errore, controllo operatore prima di applicare la rilevazione automatica.

## Catalogo STC v0.3
- `src/catalog/catalog-data.mjs`: soli documenti pubblici di produttori verificati, versionati con il codice.
- `src/catalog/catalog-model.mjs`: normalizzazione delle sequenze, ricerca e validazione dei dati senza DOM.
- `src/catalog/catalog-store.mjs`: CRUD delle voci manuali in `localStorage` separato da IndexedDB scansioni; backup JSON indipendente.
- `src/catalog/catalog-view.mjs`: escape HTML, schede e stato della data del documento.
- `src/catalog/catalog-controller.mjs`: ricerca e gestione interfaccia senza intaccare i controller delle scansioni.
- Una corrispondenza del marchio indica solo un possibile documento da esaminare. Nessuna compilazione automatica di produttore o esito.
- L’aggiornamento dei documenti integrati richiede una modifica versionata del catalogo e una nuova pubblicazione, senza cancellare le schede locali.

## Ampliamento documentale v0.4
Il catalogo comprende diverse tipologie di prodotto, ciascuna con un proprio attestato. `productKind` separa `barre`, `rotoli`, `filo`, `reti`, `tralicci`. Quando la ricerca parte dalla lettura delle nervature della barra, la vista si limita a `barre`; per consultazione documentale si puo filtrare qualsiasi categoria. I codici numerici sono valorizzati soltanto se presenti nel PDF originale. Data di scadenza documentale NON equivale a validita effettiva: il controllo presso il Servizio Tecnico Centrale resta esterno. La UI non importa archivi commerciali di terze parti. Ogni voce possiede URL della fonte primaria e descrizione sintetica originale.

## Provenienza delle fonti v0.5
`origin='published-document'` individua una scheda trascritta da un attestato STC pubblicato; `origin='technical-sheet'` una scheda tecnica pubblica del produttore (senza numero/data STC dedotti); `origin='manual'` le schede dell'utente (non verificate). Il controller e la vista distinguono le 3 origini; le schede curate non espongono CRUD manuale. Quando la ricerca parte dalla lettura del marchio dello scanner, vengono mostrati soltanto record `published-document` con `productKind='barre'`. I record tecnici restano ricercabili per consultazione manuale. La modifica al catalogo non cambia schema né chiavi delle scansioni IndexedDB e non altera i backup JSON.

## Fonte STC storica (v0.6)
La nuova tipologia `origin='historical-document'` si usa per attestati STC chiaramente scaduti senza prova della sostituzione corrente. Il renderer li distingue visivamente con stato rosso, descrizione storica e nessun CRUD manuale; la ricerca dallo scanner mostra soltanto `origin='published-document'` e `productKind='barre'`, quindi esclude storici, reti e tralicci. La consultazione manuale resta disponibile per ricerca retrospettiva. Nessun cambiamento a IndexedDB, JSON delle scansioni o chiavi storage.

## Preparazione modello IA (v0.7)
Il flusso di scansione, interpretazione, PDF e backup JSON (schemaVersion 1) resta invariato. src/views/training-photo.mjs produce l'immagine JPEG allineata alle coordinate visualizzate, senza marcatori sovrapposti; src/services/training-sample.mjs valida un formato dedicato dismat-rib-training-example con soli marcatori e immagine, separato dalle schede operative. Il controller esporta soltanto su click, previa conferma di diritti e annotazioni; nessuna trasmissione né modello di inferenza. training/prepare-dataset.mjs estrae immagini ed etichette in cartelle train/val/test, evitando duplicati SHA-256 e sovrascrittura di dataset. I dati rimangono sul computer dell'operatore e non sono sincronizzati tra tecnici. L'eventuale training futuro sarà svolto fuori dalla PWA dopo controllo qualità, licenza ed evaluation indipendente.

## Vision assist v0.8 (pre-model)
src/vision/rib-assist.mjs: analisi pure-JS del profilo di luminosita lungo i tratti delimitati dai marcatori 'large', filtraggio di massimi/minimi, eliminazione dei duplicati e proposta di marcatori 'normal'. Nessuna classificazione automatica dei riferimenti e nessuna inferenza di produttore. src/vision/vision-image.mjs: conversione e rotazione dell'immagine original JPEG in RGBA per analisi locale, senza usare il canvas contenente marcatori e senza fare upload. Il controller applica una proposta solo dopo confirm dell'operatore, consente annullamento batch e preserva i marcatori manuali. In caso di fallimento la marcatura manuale continua a funzionare. Il modello ML/ONNX futuro dipendera da un dataset reale e non e ancora integrato. Test: tests/vision.test.mjs e tests/vision-integration.test.mjs.

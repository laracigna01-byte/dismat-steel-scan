# DISMAT Steel Scan

PWA **offline-first** per rilievo manuale assistito delle marcature sulle barre d'armatura, con archivio fotografico e stampa di schede PDF. Versione studio **0.3 (architettura MVC)**, uso interno DISMAT.

## Funzionalità della versione studio
- Fotocamera / caricamento foto, zoom, contrasto, rotazione e marcatura manuale delle nervature.
- Conteggio manuale assistito degli intervalli lungo barre inclinate (non è un riconoscitore IA).
- Archiviazione CRUD in IndexedDB, backup e ripristino JSON, stampa PDF via browser.
- PWA utilizzabile offline dopo il primo caricamento HTTPS/localhost.

**Disponibile**: piccolo catalogo offline di attestati pubblicati dai produttori, con confronto testuale per sequenza di marcatura, ricerca per produttore o numero di attestato, e CRUD/import/export JSON di schede manuali separato dalle scansioni. Fonti revisionate il 23/11/2026.

**Non disponibile**: identificazione automatica affidabile del produttore, banca dati ufficiale STC in tempo reale, riconoscimento fotografico IA e certificazione di conformità. Una corrispondenza non certifica l’identita della barra. L'operatore deve verificare ogni risultato.

## Esecuzione
Su Windows estrarre i file ed eseguire `AVVIA_WINDOWS.bat` (serve Python). Oppure `python -m http.server 8767` dalla cartella progetto; aprire `http://localhost:8767`.

Test senza installare dipendenze JavaScript: `npm test` (Node.js 22+).

## Struttura
- `src/domain` modelli e regole di lettura
- `src/data` CRUD IndexedDB
- `src/services` backup e importazione
- `src/views` canvas, archivio, stampa
- `src/controllers` interazione utente
- `docs/ARCHITETTURA.md` principi MVC, MVP, DRY e vincoli di manutenzione
- `tests` controlli automatizzati

## Dati e sicurezza
Archivio locale per browser e dispositivo. GitHub **non** sincronizza le schede dei tecnici. Conservare i backup aziendali in modo sicuro e non caricare foto di cantiere nel repository. Il formato JSON di backup resta `schemaVersion: 1`; lo schema IndexedDB resta invariato.

Non copiare codice, immagini o database proprietari da applicazioni commerciali.

## Catalogo documentale (versione studio 0.3)
Le prime 2 voci documentate sono ALFA ACCIAI 029/24-CA (codice 0-4-2-6) e FERRIERA VALSABBIA 036/23-CA (0-4-1-9), con collegamento al PDF del produttore. Le scadenze sono quelle dei PDF: non attestano lo stato in tempo reale. Nuove voci manuali restano esplicitamente NON VERIFICATE. Aggiornare le fonti curate tramite revisioni Git, mai sovrascrivere l’archivio delle prove.

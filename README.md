# DISMAT Steel Scan

PWA **offline-first** per rilievo manuale assistito delle marcature sulle barre d'armatura, con archivio fotografico e stampa di schede PDF. Versione studio **0.2 (architettura MVC)**, uso interno DISMAT.

## Funzionalità della versione studio
- Fotocamera / caricamento foto, zoom, contrasto, rotazione e marcatura manuale delle nervature.
- Conteggio manuale assistito degli intervalli lungo barre inclinate (non è un riconoscitore IA).
- Archiviazione CRUD in IndexedDB, backup e ripristino JSON, stampa PDF via browser.
- PWA utilizzabile offline dopo il primo caricamento HTTPS/localhost.

**Non disponibile**: identificazione automatica del produttore, database ufficiale verificato di attestati STC, riconoscimento fotografico IA e certificazione di conformità. L'operatore deve verificare ogni risultato.

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

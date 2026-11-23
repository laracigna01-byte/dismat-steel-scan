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

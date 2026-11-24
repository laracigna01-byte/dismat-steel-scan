# DISMAT Steel Scan

PWA **offline-first** per rilievo manuale assistito delle marcature sulle barre d'armatura, con archivio fotografico e stampa di schede PDF. Versione studio **0.8 (architettura MVC)**, uso interno DISMAT.

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

## Catalogo documentale (versione studio 0.5)
Le prime 2 voci documentate sono ALFA ACCIAI 029/24-CA (codice 0-4-2-6) e FERRIERA VALSABBIA 036/23-CA (0-4-1-9), con collegamento al PDF del produttore. Le scadenze sono quelle dei PDF: non attestano lo stato in tempo reale. Nuove voci manuali restano esplicitamente NON VERIFICATE. Aggiornare le fonti curate tramite revisioni Git, mai sovrascrivere l’archivio delle prove.

## Aggiornamento documentale 23-11-2026
La versione v0.6 include 13 attestati pubblici trascritti autonomamente da 4 produttori (Alfa Acciai, Acciaierie di Sicilia, Ferriera Valsabbia, Sider Sipe), classificati per prodotto (barre, rotoli, fili, reti, tralicci), con numero, impianto, date, classe, diametri, collegamento alla fonte originale e marchio **solo quando il codice numerico e documentato**. Le voci con punzonatura/cartellino non hanno un codice di nervature inventato. I dati non costituiscono banca dati completa STC, né controllo di validita in tempo reale. Vedere docs/FONTI_CATALOGO.md.

## Aggiornamento B450C barre — 23 novembre 2026 (v0.5)
Ulteriori **3 attestati STC per barre**: Feralpi Siderurgica 030/23-CA (Italia); ITON–Seine 009/23-CA (Francia, qualificata STC per il mercato italiano); ALPA 008/23-CA (Francia, qualificata STC per il mercato italiano). Inoltre **2 schede tecniche del produttore**, non attestati: Ferriere Nord SPF201 rev.15 e Siderpotenza SPB308 rev.1.

Totale: **18 schede documentali** = **16 attestati STC** + **2 schede tecniche**. Di queste, **8 riguardano barre** (6 attestati STC + 2 schede tecniche). Lo scanner confronta la sequenza soltanto con gli **attestati STC**, non con le schede tecniche. Nessuna verifica STC in tempo reale; nessun cambiamento all'archivio delle scansioni. Il marchio non leggibile in modo affidabile resta vuoto.

## Aggiornamento 24 novembre 2026 (v0.6)
Aggiunto UNIFER S.p.A., **attestato STC 044/24-CA**, per tralicci B450C (non barre), impianto Villanova sull'Arda, marchio presente sul disegno 0-4-1-7. Aggiunto in una sezione chiaramente contrassegnata **storica/scaduta** il documento IRO S.p.A. **023/18-CA**, barre B450C, marchio 0-4-2-3, scaduto il 03/12/2023. Quest'ultimo non viene restituito dalla ricerca dello scanner, che propone esclusivamente documenti STC non storici relativi alle barre. Totale **20** schede: **17** attestati STC non storici, **1** attestato storico scaduto, **2** schede tecniche. La versione non determina revoche né sostituzioni correnti: occorre sempre consultare il documento e l'eventuale aggiornamento sul registro ufficiale.

## Preparazione all'IA offline (v0.7)
La versione v0.7 **non contiene ancora un modello IA addestrato** e non riconosce automaticamente le nervature. Permette invece di creare **esempi di addestramento privati e volontari**: fotografia ruotata come nello scanner, marcatori normali/ingrossati controllati a mano e sequenza numerica. Dopo aver completato almeno tre nervature ingrossate, il pulsante **Esporta esempio per IA** salva un file JSON locale; nessun caricamento online, nessun campo del cantiere/commessa, nessun nome cliente o DDT. È richiesta la conferma dell'operatore sui diritti della foto e sulla correttezza dei marcatori. Il normale backup delle scansioni rimane immutato.

Per assemblare più esempi in un dataset separato train/val/test senza servizi a pagamento, usare Node.js 22+:

    node training/prepare-dataset.mjs ./esempi-ia ./dataset-ia

Le cartelle di fotografie ed esempi vanno mantenute **fuori dal repository GitHub pubblico**. Dataset pubblici e limiti in training/DATASETS.md.

## Suggerimento locale di nervature normali (v0.8, sperimentale)
Dopo avere caricato una fotografia e segnato almeno due nervature **ingrossate**, il pulsante **Suggerisci nervature normali** analizza localmente il contrasto del tratto compreso fra i punti di riferimento, suggerendo possibili nervature normali. L'operatore conferma il gruppo prima di aggiungerlo e puo **Annullare suggerimenti** in un solo click, mantenendo i marcatori inseriti manualmente. Se la fotografia non offre sufficiente contrasto, non aggiunge nulla e consente il metodo manuale. I suggerimenti NON assegnano il produttore ne verificano l'attestato STC.

**Non e un modello IA addestrato:** e un primo assistente di visione a soglia adattativa, senza API, rete o costi. L'attuale percorso di annotazione per un futuro modello IA resta disponibile e invariato. Sono stati aggiunti test sintetici (nervature scure, chiare, inclinate, rumore, duplicati, foto senza nervature). Restano indispensabili collaudo su fotografie reali e conferma umana. Non modificati database IndexedDB, formato backup, stampa PDF, marcatura manuale e catalogo fonti.

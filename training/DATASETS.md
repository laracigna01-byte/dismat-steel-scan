# Dataset pubblici esaminati per DISMAT Steel Scan

Revisione 24/11/2026. Non è stato importato né copiato alcun dataset di terzi nel repository.

## Fonti pubbliche e diritti

- **NTUCERB – Rebars_detection**: https://universe.roboflow.com/ntucerb/rebars_detection
  - La pagina indica licenza **CC BY 4.0**.
  - Le etichette riguardano la classe "rebar": localizzano barre intere, **non** nervature normali/ingrossate o marchi italiani.
  - Eventuale utilizzo: primo modello separato per isolare il tondino nella fotografia, con attribuzione all'autore.
- **hof – Rebar**: https://universe.roboflow.com/hof/rebar
  - La pagina indica licenza **CC BY 4.0**; 250 immagini.
  - Anche qui non sono presenti classi per "nervatura normale" e "nervatura ingrossata".
  - Eventuale utilizzo: sole prove di localizzazione preliminare, previa verifica dei file e della licenza associata a ogni versione.
- **RebarCountDataset**: https://github.com/linghugoogle/RebarCountDataset
  - 250 immagini con annotazioni per il CONTEGGIO DELLE BARRE, non per il conteggio delle nervature.
  - Non inserire le immagini nei nostri dataset senza una licenza esplicita accertata.

**Regola:** la pubblicità di una fotografia sul web non concede automaticamente il permesso di addestrarci un modello. Conservare URL di provenienza, autore, licenza e versione del dataset; rispettare condizioni di attribuzione e eventuali restrizioni. Niente copia dal database di Nervix.

## Obiettivo del nostro modello

INPUT: una foto ravvicinata del singolo marchio, preferibilmente con il tondino centrato.

LABELS: posizioni normalizzate [0,1] delle nervature e due classi:
- **large**: nervatura ingrossata / di riferimento
- **normal**: nervatura normale

OUTPUT atteso futuro: punti suggeriti sulla fotografia, con possibilità di correzione umana. Solo dopo la conferma si applica la ricerca documentale esatta nel catalogo STC.

Per addestrare queste due classi, i dataset delle barre intere **non bastano**. Sono necessari esempi di nervature annotati specificamente, ricavati da fotografie pubbliche con licenza compatibile e/o da proprie fotografie autorizzate.

## Esportazione sicura dalla PWA

1. Fotografa una barra, ruotala se necessario.
2. Marca tutte le nervature normali/ingrossate per il tratto da leggere; verifica i punti.
3. Premi **Esporta esempio per IA**, conferma di possedere il permesso per l'uso nell'addestramento.
4. Il browser salva un JSON contenente solo **JPEG ruotato, coordinate/tipo dei punti, codice letto, consenso e data di esportazione**. Nessun nome cantiere, commessa, cliente o DDT.
5. Nessun upload a servizi online. L'operatore decide dove archiviare i file.

Il JSON contiene la foto e può comunque rivelare dettagli visibili dell'ambiente: non condividerlo senza autorizzazione.

### Costruire localmente il dataset

Su Windows con Node.js 22+ dal repository:

    node training/prepare-dataset.mjs ./esempi-ia ./dataset-ia

Il comando genera cartelle train/val/test con JPEG e annotazioni JSON indipendenti, raggruppate tramite hash SHA-256 per evitare fotografie duplicate tra gruppi. L'output deve essere una cartella vuota; rieseguire in una cartella diversa per evitare sovrascritture.

**Non mettere queste cartelle su GitHub pubblico.** Sono ignorate da .gitignore. Conservare solo il codice e la documentazione del formato sul repository.

## Soglie qualitative prima di un vero addestramento

- Serve un insieme consistente di immagini di marchi italiani **con annotazioni specifiche** per entrambe le classi, da più produttori, diametri, angoli di scatto, materiali puliti e ossidati.
- Separare fotografie di sessioni/cantieri diversi tra addestramento e test; l'hash impedisce solo duplicati identici, non immagini quasi uguali.
- Annotazioni controllate da un secondo operatore quando possibile.
- Valutazione su foto mai viste, contando nervature mancate/sbagliate e codice finale corretto.
- Un modello insufficiente va disabilitato e non deve mai assegnare automaticamente produttori o giudizi di conformità.

**Stato v0.7:** raccolta dati e preparazione dataset pronte; **nessun modello di riconoscimento delle nervature addestrato né integrato**.

# Collaudo Steel Scan v0.8 - lettura assistita

Versione sperimentale. NON è un modello IA addestrato e non assegna produttori.

## Prove già automatizzate
- Profilo con nervature scure e chiare;
- riferimento con barra inclinata e immagine con disturbo;
- eliminazione di duplicati rispetto alle nervature normali segnate manualmente;
- nessun suggerimento senza almeno due riferimenti ingrossati;
- nessuna modifica al conteggio originario e ai riferimenti ingrossati;
- controlli statici di pulsanti, import e cache offline.

## Verifica in browser / telefono (ancora necessaria)
1. Aprire l'anteprima, usare **Fotocamera** o **Carica foto**.
2. Indicare almeno **due nervature ingrossate** e verificare l'abilitazione di **Suggerisci nervature normali**.
3. Premere **Suggerisci**. Se l'immagine non offre contrasto sufficiente, il risultato può essere vuoto: si deve sempre poter marcare manualmente.
4. Se la funzione propone punti, confermare. Controllare visivamente **ogni** marcatore normale; rimuovere o aggiungere quelli errati.
5. Premere **Annulla suggerimenti** e verificare che le nervature ingrossate, aggiunte manualmente, rimangano.
6. Ripetere, ruotare la foto di 90 gradi e verificare che il gruppo resti annullabile.
7. Salvare una scheda nell'**Archivio**, ricaricarla, aprire **Stampa PDF** e fare un backup JSON.
8. Verificare che **Esporta esempio per IA** continui a produrre il JSON delle annotazioni dopo la conferma.
9. Testare senza connessione di rete dopo il primo caricamento dell'app HTTPS.

## Criteri prima di pubblicare in produzione
- Almeno fotografie autorizzate di diversi diametri, luce, angolazioni, ossidazione e nervature.
- Confrontare punti suggeriti e punti corretti a mano. Senza errori macroscopici nei test.
- Nessun crash su Android/Windows e nessuna perdita di schede archiviate.
- Rilevamento automatico sempre opzionale, con conferma umana.
- Nessun caricamento di foto a Vercel, GitHub o servizi esterni.

## Limiti
È un rilevamento di variazioni di contrasto lungo il tratto definito da **due marcatori ingrossati**. Non sa classificare automaticamente le nervature ingrossate e non sostituisce il modello ONNX futuro; non riconosce da solo il produttore. Una foto con riflessi, ossidazione, prospettiva forte o luce insufficiente può restituire punti errati o nessun suggerimento.

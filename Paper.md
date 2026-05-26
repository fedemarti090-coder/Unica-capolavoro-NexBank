# NexBank project paper

Questo paper descrive in modo dettagliato l’architettura di **NexBank**.

## Struttura

NexBank è un’app scritta in **Node.js** e utilizza **HTML/CSS** e **JavaScript vanilla** per l’interfaccia grafica.

È composta da due sezioni:

### App principale

È l’app che interfaccia l’utente con il server. Qui vengono caricate le pagine/schede HTML di tutte le sezioni e vengono inviate le richieste al server.

### Server

È il cuore della banca: qui avvengono le operazioni interne, tra cui gestione delle richieste di login e registrazione, transazioni, conversioni di valuta, ecc.

## Sicurezza

La sicurezza dell’app è a scopo didattico (non a livello professionale). La connessione tra **server** e **app** avviene tramite **HTTPS** (HTTP su TLS) con certificati autofirmati.

Inoltre, i dati salvati sul server nei database (**SQLite**) sono criptati tramite:

- funzioni di **hash** (per dati non reversibili)
- **AES-256-GCM** (per cifratura reversibile)

Esempi: username, password, token, dati delle carte di credito, ecc.

## Autenticazione

Il login non è un semplice controllo di username e password: è una serie di processi tramite i quali l’app riceve un **JWT (JSON Web Token)** firmato dal server, che abilita l’app a comunicare con il server.

Il JWT è valido per **15 minuti**; allo scadere viene mostrata una schermata per riavviare la sessione. Il token viene usato in tutte le azioni effettuate dall’app.

## Carte elettroniche e pagamenti

Le carte sono salvate con un **token univoco** e associate a uno specifico username in un database dedicato e criptato, dal quale l’app può recuperarle.

I pagamenti seguono un processo che include:

1. conversione della valuta (se necessaria)
2. finalizzazione della transazione con addebito e incasso del valore sulla carta di mittente e destinatario
3. e aggiunta della transazione nella cronologia dei due utenti interessati
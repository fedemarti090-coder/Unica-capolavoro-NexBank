import express from 'express';
const paymentSystemRouter = express.Router();

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token ,logged_database, card_database} = cfg;


function add_to_cronology(username, ente, ammonto, token, valute) {
    let card = sampleSQL.checkDatabase(card_database, "token", token);
    let data = new Date().toISOString().split("T")[0];

    let payment = {
        ente: ente,
        ammonto: ammonto,
        date: data,
        card: (card.cod_carta).slice(-4),
        valute: valute
    }
    let row = sampleSQL.checkDatabase(logged_database, "username", username);
    let cronology = JSON.parse(row.movimenti);
    cronology.unshift(payment);
    sampleSQL.set_cell(logged_database, { username: username }, { movimenti: JSON.stringify(cronology) });
}


paymentSystemRouter.post('/pay', (req, res) => {
    let { ammount, ente, token, username, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }
    try {
        let row = sampleSQL.checkDatabase(card_database, "token", token);
        if (ammount < 0) {
            return res.status(500).json({ ans: false, message: "importo non valido" });
        }
        if (row.balance - ammount < 0) {
            return res.status(500).json({ ans: false, message: "saldo non sufficiente" });
        }
        sampleSQL.set_cell(card_database, { token: token }, { balance: row.balance - ammount });


        add_to_cronology(crypting.hash_from_str(username), ente, ammount * -1, token, row.valute);
        res.json({ ans: true, message: "Azione andata a buon fine" });
    } catch (err) {
        console.error("ERRORE BACKEND /pay:", err);
        return res.status(500).json({ ans: false, message: err.message });
    }
})

function refresh_popup(username, dati) {
    let row_sender;
    try {
        row_sender = sampleSQL.checkDatabase(logged_database, "username", username);
    } catch (err) {
        return false;
    }
    let popup = JSON.parse(row_sender.popup);
    popup.push(dati);
    sampleSQL.set_cell(logged_database, { username: username }, { popup: JSON.stringify(popup) })
    return true;

}

paymentSystemRouter.post('/send', (req, res) => {
    let { ammount, destinatario, token, username, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }
    try {
        let row = sampleSQL.checkDatabase(card_database, "token", token);
        if (ammount < 0) {
            return res.status(500).json({ ans: false, message: "importo non valido" });
        }
        if (row.balance - ammount < 0) {
            return res.status(500).json({ ans: false, message: "saldo non sufficiente" });
        }
        if (!refresh_popup(crypting.hash_from_str(destinatario), { sender: crypting.encrypt(username), ammount: ammount, id: crypting.generateToken(5), valute: row.valute })) {
            return res.status(500).json({ ans: false, message: "Destinatario non trovato" });

        }

        sampleSQL.set_cell(card_database, { token: token }, { balance: row.balance - ammount });


        add_to_cronology(crypting.hash_from_str(username), destinatario, ammount * -1, token, row.valute);
        res.json({ ans: true, message: "invio eseguito", valute: row.valute });

    } catch (err) {
        console.error("ERRORE BACKEND /send:", err);
        return res.status(500).json({ ans: false, message: err.message });
    }
});

paymentSystemRouter.post('/check_popup', (req, res) => {
    let { username, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }
    try {
        let row = sampleSQL.checkDatabase(logged_database, "username", crypting.hash_from_str(username));
        let ans = JSON.parse(row.popup);
        if (!ans) {
            res.json({ ans: false, message: "L'utente non ha notifiche", popup: ans });
        } else {
            for (let mex of ans) {
                try {
                    if (mex.sender && mex.sender.iv && mex.sender.content && mex.sender.tag) {
                        mex.sender = crypting.decrypt(mex.sender);
                    }
                } catch (e) {
                    console.log("Errore decrypt:", e.message);
                    mex.sender = "ERRORE_DECRYPT";
                }
            }
            res.json({ ans: true, message: "invio eseguito", popup: ans });
        }

    } catch (err) {
        console.error("ERRORE BACKEND /check_popup:", err);
        return res.status(500).json({ ans: false, message: err.message });
    }
})

paymentSystemRouter.post('/check_movement', (req, res) => {
    let { username, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }
    try {
        let row = sampleSQL.checkDatabase(logged_database, "username", crypting.hash_from_str(username));
        let ans = JSON.parse(row.movimenti);
        if (!ans) {
            res.json({ ans: false, message: "L'utente non ha effettuato movimenti", popup: ans });
        } else {
            res.json({ ans: true, message: "Movimenti trovati", movimenti: ans })
        }
    } catch (err) {
        console.error("ERRORE BACKEND /check_popup:", err);
        return res.status(500).json({ ans: false, message: err.message });
    }
});

paymentSystemRouter.post('/del_popup', (req, res) => {
    let { id, username, token, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }
    if (!id || !username || !token) {
        return res.status(400).json({ ans: false, message: 'ID, USERNAME o TOKEN mancanti' });
    }

    try {
        const userHash = crypting.hash_from_str(username);

        let row = sampleSQL.checkDatabase(logged_database, "username", userHash);
        if (!row) return res.status(404).json({ ans: false, message: "Utente non trovato" });

        let movement = JSON.parse(row.popup || '[]');

        const elementoDaRimuovere = movement.find(item => item.id === id);

        if (!elementoDaRimuovere) {
            return res.status(404).json({ ans: false, message: "Elemento con questo ID non trovato" });
        }

        const nuovoMovement = movement.filter(item => item.id !== id);

        sampleSQL.set_cell(logged_database, { username: userHash }, { popup: JSON.stringify(nuovoMovement) });

        let row2 = sampleSQL.checkDatabase(card_database, "token", token);
        let valoreDaAggiungere;

        if (row2) {
            valoreDaAggiungere = parseFloat(elementoDaRimuovere.ammount);
            valoreDaAggiungere = change.change_valute(valoreDaAggiungere, elementoDaRimuovere.valute, row2.valute);
            const nuovoBilancio = parseFloat(row2.balance) + valoreDaAggiungere;

            sampleSQL.set_cell(card_database, { token: token }, { balance: nuovoBilancio });
            add_to_cronology(crypting.hash_from_str(username), crypting.decrypt(elementoDaRimuovere.sender), valoreDaAggiungere, token, elementoDaRimuovere.valute);
        } else {
            return res.status(404).json({ ans: false, message: "Carta associata al token non trovata" });
        }

        res.json({
            ans: true,
            message: "Elemento rimosso e saldo aggiornato",
            credit: {
                real_ammount: valoreDaAggiungere,
                real_valute: row2.valute
            }
        });

    } catch (err) {
        console.error("ERRORE BACKEND /del_popup:", err);
        res.status(500).json({ ans: false, message: err.message });
    }
});

export default paymentSystemRouter;
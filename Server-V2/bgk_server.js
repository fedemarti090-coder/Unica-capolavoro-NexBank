import https from 'https';
import fs from 'fs';
import express from 'express';

import * as sampleSQL from './_sqllite_lib.js';
import * as crypting from './_crypt_function.js';
import * as luhn from './luhn_method.js';
import * as gataway from './provider/bank.js';
import * as change from './_valute_change.js';

const app = express();
app.use(express.json());

const options = {
    key: fs.readFileSync('key/server.key'),
    cert: fs.readFileSync('key/server.cert')
};

/*

server.post('/type', (req, res) => {
    const { var1, var2 } = req.body;
    res.json({ ans });
    res.status(401).json({ message: 'Credenziali errate' });
});

*/

const logged_database = sampleSQL.buildDatabase("database/user_logged.db");
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function gen_JWT_token(payload) {
    return jwt.sign(
        payload,
        process.env.JWT_key,
        { expiresIn: "15m" }
    )
}

function verify_JWT_token(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        return true;
    } catch {
        return false;
    }

}

app.post('/register', (req, res) => {
    let { username, password } = req.body;
    username = crypting.hash_from_str(username);
    password = crypting.hash_from_str(password);
    let card_token = "[]";
    let popup = "[]";
    let movimenti = "[]";

    if (sampleSQL.exists(logged_database, "username", username)) {
        return res.status(401).json({ message: 'Username già attivo' });
    }

    sampleSQL.addElement(logged_database, { username, password, card_token, popup, movimenti });

    let jwt = gen_JWT_token({ username: username, password: password });
    res.json({ message: `Utente ${username} registrato correttamente`, jwt: jwt });
});

app.post('/login', (req, res) => {
    let { username, password } = req.body;
    username = crypting.hash_from_str(username);
    password = crypting.hash_from_str(password);
    if (sampleSQL.verify_double(logged_database, "username", username, "password", password)) {

        let jwt = gen_JWT_token({ username: username, password: password });
        res.json({ ans: true, message: `Utente ${username} loggato correttamente`, jwt: jwt });
    } else {
        return res.status(401).json({ ans: false, message: 'Username non trovato' });
    }

});

const card_database = sampleSQL.buildDatabase("database/card.db");
app.post('/new_card', (req, res) => {
    let { jwt, numero_carta, scadenza_carta, intestatario, saldo, username, src, valute } = req.body;

    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }

    if (saldo < 0 || saldo > 1000000) { // Ho corretto il limite a 1M
        return res.status(400).json({ ans: false, message: 'Saldo non valido' });
    }

    try {
        const cardToken = crypting.generateToken(16);

        sampleSQL.addElement(card_database, {
            cod_carta: crypting.hash_from_str(numero_carta.slice(-4)) + numero_carta.slice(-4),
            expiry: scadenza_carta,
            cardholder: JSON.stringify(crypting.encrypt(intestatario)),
            balance: saldo,
            token: cardToken,
            emittente: src,
            valute: valute
        });

        const userData = sampleSQL.checkDatabase(logged_database, "username", crypting.hash_from_str(username));
        if (!userData) {
            return res.status(404).json({ ans: false, message: 'Utente non trovato nel database sessioni' });
        }

        let tokenList = [];

        if (userData.card_token) {
            tokenList = JSON.parse(userData.card_token);
        }

        tokenList.push(cardToken);

        sampleSQL.set_cell(
            logged_database,
            { username: crypting.hash_from_str(username) },
            { card_token: JSON.stringify(tokenList) }
        );

        res.json({
            ans: true,
            message: `Carta creata correttamente`,
            cvv: gataway.generaCvv(numero_carta, scadenza_carta)
        });

    } catch (err) {
        console.error("Errore SQL:", err);
        return res.status(500).json({ ans: false, message: 'Errore interno nel salvataggio carta' });
    }
});



app.post('/gen_card_number', (req, res) => {
    res.json({ ans: true, message: luhn.generateLuhnNumber(16) });
});


app.post('/get_user_card_data', (req, res) => {
    let { token, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }

    try {
        let row = sampleSQL.checkDatabase(card_database, "token", token);
        if (!row) {
            return res.status(404).json({
                ans: false,
                message: "Carta non trovata per il token fornito"
            });
        }
        res.json({
            ans: true,
            message: {
                numero_carta: (row.cod_carta).slice(-4),
                scadenza_carta: row.expiry,
                intestatario: crypting.decrypt(JSON.parse(row.cardholder)),
                saldo: row.balance,
                src: row.emittente,
                valute: row.valute
            }
        })
    } catch (err) {
        console.error("ERRORE BACKEND /get_user_card_data:", err);
        return res.status(500).json({ ans: false, message: err.message });
    }
})

app.post('/get_user_card', (req, res) => {
    let { username, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }
    try {
        let row = sampleSQL.checkDatabase(logged_database, "username", crypting.hash_from_str(username));
        if (!row) {
            return res.status(404).json({
                ans: false,
                message: "L'utente non ha carte"
            });
        }
        res.json({
            ans: true,
            message: JSON.parse(row.card_token)
        })
    } catch (err) {
        console.error("ERRORE BACKEND /get_user_card:", err);
        return res.status(500).json({ ans: false, message: err.message });
    }
})

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

app.post('/pay', (req, res) => {
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

app.post('/send', (req, res) => {
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

app.post('/check_popup', (req, res) => {
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

app.post('/check_movement', (req, res) => {
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

app.post('/del_popup', (req, res) => {
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

app.post('/del_card', (req, res) => {
    let { token, username, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }
    if (!token || !username) {
        return res.status(400).json({ ans: false, message: "Token o username mancanti" });
    }

    try {
        sampleSQL.removeElement(card_database, "token", token);

        const userHash = crypting.hash_from_str(username);
        const row = sampleSQL.checkDatabase(logged_database, "username", userHash);

        if (!row) return res.status(404).json({ ans: false, message: "Utente non trovato" });

        let tokens = JSON.parse(row.card_token || '[]');
        tokens = tokens.filter(t => t !== token);

        sampleSQL.set_cell(logged_database, { username: userHash }, { card_token: JSON.stringify(tokens) });

        res.json({
            ans: true,
            message: "Carta eliminata e lista token aggiornata",
        });

    } catch (err) {
        console.error("ERRORE BACKEND /del_card:", err);
        res.status(500).json({ ans: false, message: err.message });
    }
});

https.createServer(options, app).listen(3000, () => {
    console.log('Server HTTPS su https://localhost:3000');
});

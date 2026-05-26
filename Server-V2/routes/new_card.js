import express from 'express';
const newCardRouter = express.Router();

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token ,logged_database, card_database} = cfg;

newCardRouter.post('/new_card', (req, res) => {
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

export default newCardRouter;
import express from 'express';
const getUserCardDataRouter = express.Router();

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token ,logged_database, card_database} = cfg;

getUserCardDataRouter.post('/get_user_card_data', (req, res) => {
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

export default getUserCardDataRouter;
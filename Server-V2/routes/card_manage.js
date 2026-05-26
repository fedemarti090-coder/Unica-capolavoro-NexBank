import express from 'express';
const cardManageRouter = express.Router();

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token ,logged_database, card_database} = cfg;

cardManageRouter.post('/gen_card_number', (req, res) => {
    res.json({ ans: true, message: luhn.generateLuhnNumber(16) });
});

cardManageRouter.post('/del_card', (req, res) => {
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

export default cardManageRouter;
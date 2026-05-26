import express from 'express';
const changepasswordRouter = express.Router();

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token, logged_database, card_database } = cfg;

changepasswordRouter.post('/change_password', (req, res) => {
    let { old, new0, username, jwt } = req.body;

    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }

    const hashed_username = crypting.hash_from_str(username);
    const password_old_hashed = crypting.hash_from_str(old);
    const password_new_hashed = crypting.hash_from_str(new0);

    const isOldPasswordCorrect = sampleSQL.verify_double(
        logged_database,
        "username", hashed_username,
        "password", password_old_hashed
    );

    if (!isOldPasswordCorrect) {
        return res.status(400).json({ ans: false, message: 'Password vecchia errata' });
    }

    try {
        const risultato = sampleSQL.set_cell(
            logged_database,
            { username: hashed_username },
            { password: password_new_hashed }
        );

        if (risultato.changes > 0) {
            res.json({
                ans: true,
                message: "Password aggiornata con successo"
            });
        } else {
            return res.status(400).json({ ans: false, message: "Errore nel database" });
        }
    } catch (err) {
        return res.status(400).json({ ans: false, message: "Errore server" });
    }
});

export default changepasswordRouter
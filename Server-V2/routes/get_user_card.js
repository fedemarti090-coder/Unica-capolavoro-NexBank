import express from 'express';
const getUserCardRouter = express.Router();

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token ,logged_database, card_database} = cfg;

getUserCardRouter.post('/get_user_card', (req, res) => {
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

export default getUserCardRouter;
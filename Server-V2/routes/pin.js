import express from 'express';
const pinRouter = express.Router();

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token, logged_database, card_database } = cfg;


pinRouter.post('/set_pin', async (req, res) => {
    let { username, new_pin, jwt } = req.body;

    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }
    try {
        await sampleSQL.set_cell(logged_database, { username: crypting.hash_from_str(username) }, { pin: crypting.hash_from_str(new_pin) });

    } catch (err) {
        console.log(err);
    }
    res.json({
        ans: true,
        message: "PIN aggiornata con successo"
    });

});

export default pinRouter;
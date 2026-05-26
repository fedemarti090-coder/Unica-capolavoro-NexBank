import express from 'express';
const registerRouter = express.Router();


import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token ,logged_database, card_database} = cfg;

registerRouter.post('/register', (req, res) => {
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
    console.log(`Registrazione effettuata (username criptato): ${username}`);
    res.json({ message: `Utente ${username} registrato correttamente`, jwt: jwt });
});

export default registerRouter;
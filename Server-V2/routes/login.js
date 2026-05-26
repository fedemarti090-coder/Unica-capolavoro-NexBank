import express from 'express';
const loginRouter = express.Router();

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token, logged_database, card_database } = cfg;

loginRouter.post('/login', (req, res) => {
    let { username, password, pin } = req.body;

    const hashedUser = crypting.hash_from_str(username);
    let userRow;
    let jwt;

    if (pin) {
        const hashedPin = crypting.hash_from_str(pin);
        const query = logged_database.prepare(`SELECT * FROM MAIN WHERE username = ? AND pin = ? LIMIT 1`);
        userRow = query.get(hashedUser, hashedPin);
        
    } else {
        const hashedPassword = crypting.hash_from_str(password);
        const query = logged_database.prepare(`SELECT * FROM MAIN WHERE username = ? AND password = ? LIMIT 1`);
        userRow = query.get(hashedUser, hashedPassword);
        
    }


    if (userRow) {
        if(pin){
            jwt = gen_JWT_token({ username: hashedUser, password: userRow.password });
        }else{
            jwt = gen_JWT_token({ username: hashedUser, password: userRow.password });
        }
        

        let userMail = null;

        if (userRow.email) {
            try {
                const emailParsed = JSON.parse(userRow.email);
                userMail = crypting.decrypt(emailParsed);
            } catch (e) {
                console.error("Errore decriptazione mail:", e);
                userMail = "Errore recupero mail";
            }
        }
        console.log(`Login effetuato (username criptato): ${hashedUser}`);
        return res.json({
            ans: true,
            message: `Utente loggato correttamente`,
            jwt: jwt,
            mail: userMail
        });
    } else {
        return res.status(401).json({ ans: false, message: 'Username o password errati' });
    }
});
export default loginRouter;
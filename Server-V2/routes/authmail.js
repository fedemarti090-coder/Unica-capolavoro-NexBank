import express from 'express';
const authmailRouter = express.Router();

import nodemailer from 'nodemailer';
import crypto from 'crypto';

import * as cfg from './_config.js';
const { sampleSQL, crypting, change, luhn, gataway, gen_JWT_token, verify_JWT_token, logged_database, card_database } = cfg;



authmailRouter.post('/auth_mail', async (req, res) => {
    let { mail, username, jwt } = req.body;
    if (!verify_JWT_token(jwt)) {
        return res.status(400).json({ ans: false, message: 'JWT non valido' });
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));


    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "nexbank.authmail@gmail.com",
            pass: "ckpt rzdl vrjr uoje"
        }
    });


    const htmlTemplate = `
    <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'SF Pro Display', Arial, sans-serif; text-align: center; border-radius: 20px;">
        <h1 style="color: #22c55e; font-size: 24px; margin-bottom: 20px;">NexBank</h1>
        <p style="font-size: 16px; color: #ccc;">Benvenuto! Usa il codice qui sotto per confermare la tua identità e attivare l'account.</p>
        
        <div style="margin: 30px 0; padding: 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fff;">${otpCode}</span>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 30px;">
            Se non hai richiesto tu questo codice, ignora questa mail.<br>
            Il codice scadrà tra 10 minuti.
        </p>
    </div>
    `;

    try {
        
        let info = await transporter.sendMail({
            from: '"NexBank Support" <support@nexbank.it>',
            to: mail,
            subject: `Codice di verifica: ${otpCode}`,
            text: `Il tuo codice di verifica NexBank è: ${otpCode}`,
            html: htmlTemplate,
        });
        

        
        notifiche_in_push = notifiche_in_push.filter(item => item.username !== username);
        notifiche_in_push.push({
            username: username,
            code: otpCode,
            mail: mail,
            createdAt: Date.now()
        })
        
        console.log(notifiche_in_push);
        res.status(200).json({
            ans: true,
            message: "Mail inviata correttamente",

        });

    } catch (error) {
        console.error("Errore invio mail:", error);
        res.status(500).json({ success: false, message: "Errore nell'invio della mail" });
    }
});

let notifiche_in_push = [];

authmailRouter.post('/otpcode', (req, res) => {
    let { username, code, jwt } = req.body;

    const scadenza = 10 * 60 * 1000;
    let adesso = Date.now();

    notifiche_in_push = notifiche_in_push.filter(item => (adesso - item.createdAt) < scadenza);

    const index = notifiche_in_push.findIndex(item => item.username === username);

    if (index === -1) {
        return res.status(401).json({ ans: false, message: "accesso non valido" });
    }

    const item = notifiche_in_push[index];

    if (item.code === code) {
        notifiche_in_push.splice(index, 1);
        sampleSQL.set_cell(logged_database, {username: crypting.hash_from_str(username)}, {email: JSON.stringify(crypting.encrypt(item.mail))})
        return res.json({
            ans: true,
            message: "Email correttamente inserita ",
        });
    } else {
        return res.status(401).json({ ans: false, message: "codice non valido" });
    }
});

export default authmailRouter;
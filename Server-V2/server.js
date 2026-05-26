import 'dotenv/config'; 
import https from 'https';
import fs from 'fs';
import express from 'express';


import * as sampleSQL from './utility/sqllite_lib.js';
import * as crypting from './utility/crypt_function.js';
import * as change from './utility/valute_change.js';
import * as luhn from './utility/luhn_method.js';
import * as gataway from './provider/bank.js';
import * as verifymodules from './middleware/jwt_system.js';


const app = express();
app.use(express.json());



const logged_database = sampleSQL.buildDatabase("database/user_logged.db");
const card_database = sampleSQL.buildDatabase("database/card.db");


import testRouter from './routes/test.js';
import cardManageRouter from './routes/card_manage.js';
import getUserCardRouter from './routes/get_user_card.js';
import getUserCardDataRouter from './routes/get_user_card_data.js';
import newCardRouter from './routes/new_card.js';
import paymentSystemRouter from './routes/payment_system.js';
import registerRouter from './routes/register.js';
import loginRouter from './routes/login.js';
import changepasswordRouter from './routes/change_password.js';
import authmailRouter from './routes/authmail.js';
import pinRouter from './routes/pin.js';


app.use(testRouter);
app.use(loginRouter);
app.use(cardManageRouter);
app.use(getUserCardRouter);
app.use(getUserCardDataRouter);
app.use(newCardRouter);
app.use(paymentSystemRouter);
app.use(registerRouter);
app.use(changepasswordRouter);
app.use(authmailRouter);
app.use(pinRouter);


const options = {
    key: fs.readFileSync('key/server.key'),
    cert: fs.readFileSync('key/server.cert')
};

https.createServer(options, app).listen(3000, () => {
    console.log('✅ Server HTTPS attivo su https:');
});
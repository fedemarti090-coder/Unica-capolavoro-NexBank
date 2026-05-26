
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const https = require('https');
const QRCode = require('qrcode');
const fs = require('fs');
const nodemailer = require('nodemailer');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 400,
        height: 780,
        icon: path.join(__dirname, 'img', 'logo.png'),
        autoHideMenuBar: true,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile(path.join(__dirname, 'public', 'login-section', 'index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
function resetObject(obj) {
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            obj[key] = [];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
            obj[key] = resetObject(obj[key]); // ricorsivo
        } else if (typeof obj[key] === "boolean") {
            obj[key] = false;
        } else {
            obj[key] = "";
        }
    }
    return obj;
}

async function clear_global_var() {
    try {
        let obj = await loadBridge();
        if (!obj) return;
        obj = resetObject(obj);
        await writeBridge(obj);
    } catch (e) {
        console.error("Errore resettando global_var:", e);
    }
}

let globalVarResetDone = false;

app.on('before-quit', async (event) => {
    if (globalVarResetDone) return;

    event.preventDefault();
    await clear_global_var();
    globalVarResetDone = true;
    app.quit();
});

const bridgePath = path.join(__dirname, 'bridge.json');

function writeBridge(data) {
    try {
        fs.writeFileSync(bridgePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("Errore scrivendo bridge.json", err);
    }
}

function loadBridge() {
    try {
        const raw = fs.readFileSync(bridgePath, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error("Errore leggendo bridge.json", err);
        return null;
    }
}

ipcMain.handle('test-server', async () => {
    try {
        const res = await axios.post(
            'https://localhost:3000/test',
            {},
            { httpsAgent: agent }
        );
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
});



ipcMain.handle('write_global_var', async (event, data) => {
    writeBridge(data);
    return true;
});

ipcMain.handle('load_global_var', async (event) => {
    return loadBridge();
});


const agent = new https.Agent({ rejectUnauthorized: false });
let jwt_mykey = null;


let timerEnd = null;

async function startTimer() {
    timerEnd = null;
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    timerEnd = now + fifteenMinutes;

    return {
        message: "Timer avviato",
        endTime: new Date(timerEnd)
    };
}

async function getRemainingTime() {
    if (!timerEnd) {
        return {
            active: false,
            message: "Timer non avviato",
            formatted: "00:00"
        };
    }

    const now = Date.now();
    const remaining = timerEnd - now;

    if (remaining <= 0) {
        return {
            active: false,
            remaining: 0,
            message: "Tempo scaduto",
            formatted: "00:00"
        };
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return {
        active: true,
        remainingMs: remaining,
        formatted: `${minutes}m ${seconds}s`
    };
}


ipcMain.handle('login', async (event, username, password, pin) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/login',
            { username, password, pin },
            { httpsAgent: agent }
        );

        jwt_mykey = res.data.jwt;
        startTimer();
        return { ans: true, mail: res.data.mail };


    } catch (err) {
        return { ans: false };
    }
})


ipcMain.handle('registrati', async (event, username, password) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/register',
            { username, password },
            { httpsAgent: agent }
        );
        jwt_mykey = res.data.jwt;
        startTimer();
        return { ans: true, mail: res.data.mail };
    } catch (err) {
        console.log(err);
        return { ans: false };
    }
});


ipcMain.handle("loadhtml", (event, html) => {
    if (html == 'login') {
        jwt_mykey = null;
        timerEnd = null;
        clear_global_var();
    }

    win.loadFile(path.join(__dirname, 'public', html + '-section', 'index.html'));
})

const { LocalStorage } = require('node-localstorage');


ipcMain.handle('crea-carta', async (event, numero_carta, scadenza_carta, intestatario, saldo, username, src, valute) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/new_card',
            {
                jwt: jwt_mykey,
                numero_carta,
                scadenza_carta,
                intestatario,
                saldo,
                username,
                src: src,
                valute
            },
            { httpsAgent: agent }
        )
        return res.data;
    } catch (err) {
        console.error('Errore generazione carta:', err.message);
        return { ans: false, message: err.response?.data?.message || err.message };
    }
})

ipcMain.handle('get-tempo', async (event) => {
    return getRemainingTime();
})

ipcMain.handle('gen-cod-carta', async (event) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/gen_card_number',
            {},
            { httpsAgent: agent }
        )
        return res.data;
    } catch (err) {
        console.error('Errore generazione carta:', err.response?.data || err.message);
        return { ans: false, message: err.message };
    }
})

ipcMain.handle('decrypt-token', async (event, token) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/get_user_card_data',
            {
                token: token,
                jwt: jwt_mykey
            },
            { httpsAgent: agent }
        )
        return res.data;
    } catch (err) {
        console.error('Errore generazione carta:', err.response?.data || err.message);
        return { ans: false, message: err.message };
    }
});

ipcMain.handle('get-token-list', async (event, username) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/get_user_card',
            {
                username: username,
                jwt: jwt_mykey
            },
            { httpsAgent: agent }
        )
        if (res.data.ans) {
            return res.data;
        } else {
            return { ans: false, message: [] };
        }
    } catch (err) {
        console.error('Errore lista token:', err.response?.data || err.message);
        return { ans: false, message: err.message };
    }
})


ipcMain.handle('azione', async (event, ammount, ente, token, username) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/pay',
            {
                ammount: ammount,
                ente: ente,
                token: token,
                username: username,
                jwt: jwt_mykey
            },
            { httpsAgent: agent }
        )
        if (res.data.ans) {
            return res.data;
        } else {
            return { ans: false, message: [] };
        }
    } catch (err) {
        console.error('Errore azione:', err.response?.data);
        return { ans: false, message: err.response?.data };
    }
})

ipcMain.handle('send', async (event, ammount, destinatario, token, username) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/send',
            {
                ammount: ammount,
                destinatario: destinatario,
                token: token,
                username: username,
                jwt: jwt_mykey
            },
            { httpsAgent: agent }
        )
        if (res.data.ans) {
            return res.data;
        } else {
            return { ans: false, message: [] };
        }
    } catch (err) {
        console.error('Errore azione:', err.response?.data);
        return { ans: false, message: err.response?.data };
    }
})

ipcMain.handle('get-popup', async (event, username) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/check_popup',
            {
                username: username,
                jwt: jwt_mykey
            },
            { httpsAgent: agent }
        )
        if (res.data.ans) {
            return res.data;
        } else {
            return { ans: false, message: [] };
        }
    } catch (err) {
        console.error('Errore azione:', err.response?.data);
        return { ans: false, message: err.response?.data };
    }
})


ipcMain.handle('get-movement', async (event, username) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/check_movement',
            {
                username: username,
                jwt: jwt_mykey
            },
            { httpsAgent: agent }
        )
        if (res.data.ans) {
            return res.data;
        } else {
            return { ans: false, message: [] };
        }
    } catch (err) {
        console.error('Errore azione:', err.response?.data);
        return { ans: false, message: err.response?.data };
    }
})

ipcMain.handle('del-id', async (event, id, username, token) => {
    if (!id || !username) {
        console.error('del-id chiamato con parametri mancanti', { id, username });
        return { ans: false, message: 'Parametri mancanti' };
    }

    try {
        const res = await axios.post(
            'https://localhost:3000/del_popup',
            { id, username, token, jwt: jwt_mykey },
            { httpsAgent: agent }
        );

        return res.data.ans ? res.data : { ans: false, message: res.data.message || [] };
    } catch (err) {
        console.error('Errore azione del-id:', err.response?.data || err.message);
        return { ans: false, message: err.response?.data || err.message };
    }
});

ipcMain.handle('del-card', async (event, token, username) => {

    try {
        const res = await axios.post(
            'https://localhost:3000/del_card',
            { token, username, jwt: jwt_mykey },
            { httpsAgent: agent }
        );

        return res.data.ans ? res.data : { ans: false, message: res.data.message || [] };
    } catch (err) {
        console.error('Errore azione del-id:', err.response?.data || err.message);
        return { ans: false, message: err.response?.data || err.message };
    }
});

ipcMain.handle('change-password', async (event, old, new0, username) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/change_password',
            { old, new0, username, jwt: jwt_mykey },
            { httpsAgent: agent }
        );

        return res.data.ans ? res.data : { ans: false, message: res.data.message || [] };
    } catch (err) {
        console.error('Errore cambio password:', err.response?.data || err.message);
        return { ans: false, message: err.response?.data || err.message };
    }
})

ipcMain.handle('auth-mail', async (event, mail, username) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/auth_mail',
            { mail, username, jwt: jwt_mykey },
            { httpsAgent: agent }
        );

        return res.data.ans ? res.data : { ans: false, message: res.data.message || [] };
    } catch (err) {
        console.error('Errore mail auth:', err.response?.data || err.message);
        return { ans: false, message: err.response?.data || err.message };
    }
})

ipcMain.handle('otpcode-check', async (event, username, code) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/otpcode',
            { username, code, jwt: jwt_mykey },
            { httpsAgent: agent }
        );

        return res.data.ans ? res.data : { ans: false, message: res.data.message || [] };
    } catch (err) {
        console.error('Errore mail auth:', err.response?.data || err.message);
        return { ans: false, message: err.response?.data || err.message };
    }
});

ipcMain.handle('set-pin', async (event, username, new_pin) => {
    try {
        const res = await axios.post(
            'https://localhost:3000/set_pin',
            { username, new_pin, jwt: jwt_mykey },
            { httpsAgent: agent }
        );

        return res.data.ans ? res.data : { ans: false, message: res.data.message || [] };
    } catch (err) {
        console.error('Errore mail auth:', err.response?.data || err.message);
        return { ans: false, message: err.response?.data || err.message };
    }
});


ipcMain.handle('build-qrcode', async (event, link) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(link, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        return {qr: qrCodeDataUrl}
    } catch (err) {
        console.error("Errore nella generazione del QR:", err);
    }
})

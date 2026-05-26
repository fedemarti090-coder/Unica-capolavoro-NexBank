
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

    esegui_login: (nome_utete, password, pin) => ipcRenderer.invoke('login', nome_utete, password, pin),
    esegui_registrazione: (nome_utete, password) => ipcRenderer.invoke('registrati', nome_utete, password),

    carica_html: (html) => ipcRenderer.invoke('loadhtml', html),


    WriteVar: async (value) => ipcRenderer.invoke('write_global_var', value),
    loadVar: async () => ipcRenderer.invoke('load_global_var'),


    genera_carta: async (numero_carta, scadenza_carta, intestatario, saldo, username, src, valute) => ipcRenderer.invoke('crea-carta', numero_carta, scadenza_carta, intestatario, saldo, username, src, valute),

    get_remaining_time: async () => ipcRenderer.invoke('get-tempo'),
    crea_cod_carta: async () => ipcRenderer.invoke('gen-cod-carta'),
    decrypt_token: async (token) => ipcRenderer.invoke('decrypt-token', token),

    get_token_list: async (username) => ipcRenderer.invoke('get-token-list', username),

    effettua_pagamento: async (ammount, ente, token, username) => ipcRenderer.invoke('azione', ammount, ente, token, username),
    invia_soldi: async (ammount, destinatario, token, username) => ipcRenderer.invoke('send', ammount, destinatario, token, username),

    check_popup: async (username) => ipcRenderer.invoke('get-popup', username),
    check_movimenti: async (username) => ipcRenderer.invoke('get-movement', username),

    remove_popup: async (id, username, token) => ipcRenderer.invoke('del-id', id, username, token),
    remove_card: async (token, username) => ipcRenderer.invoke('del-card', token, username),

    change_password: async (old, new0, username) => ipcRenderer.invoke('change-password', old, new0, username),

    testServer: async () => ipcRenderer.invoke('test-server'),

    send_ath_mail: async (mail, username) => ipcRenderer.invoke('auth-mail', mail, username),
    check_otpcode: async (username, code) => ipcRenderer.invoke('otpcode-check', username, code),
    set_pin: async (username, pin) => ipcRenderer.invoke('set-pin', username, pin),

    build_qrcode: async (link) => ipcRenderer.invoke('build-qrcode', link)
});


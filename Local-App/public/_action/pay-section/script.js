let global_var = {};

async function save_global_var() {
    await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
    global_var = await window.electronAPI.loadVar();
}

async function init() {
    await load_global_var();
    let info = await window.electronAPI.decrypt_token(global_var.main);
    info = info.message;
    console.log(info)
    document.getElementById("card-number").textContent = "**** **** **** " + info.numero_carta
    document.getElementById("intestatario").textContent = info.intestatario
    document.getElementById("main-card").src = `../../../img/carte/${info.src}.png`
    document.getElementById("balance").textContent = codiceToSimbolo(info.valute) + (info.saldo).toFixed(2)
    document.getElementById("currency").textContent = codiceToSimbolo(info.valute);
}

window.addEventListener('DOMContentLoaded', init);



async function pay() {
    let ammount = document.getElementById("importo").value;
    let ente = document.getElementById("ente").value;
    if (!verify_data(["importo", "ente"])) return;
    let token = global_var.main;

    let recive = await window.electronAPI.effettua_pagamento(ammount, ente, token, global_var.username);
    if (recive.ans) {
        show_success_message("Azione andata a buon fine", `Pagamento di ${ammount}€ per l'ente: ${ente} eseguito con successo`, "ok", "window.electronAPI.carica_html('_action/pay')")
    } else {
        show_error_message("Azione bloccata", `Pagamento di ${ammount}€ per l'ente: ${ente} bloccato causa ${recive.message.message}`, "ok",)
    }
}

const nfcImg = document.getElementById('nfc-img');
if (nfcImg) {
    nfcImg.addEventListener('click', function (e) {
        e.stopPropagation();
        nfcImg.style.transform = 'scale(1.2)';
        setTimeout(() => nfcImg.style.transform = '', 150);
        if (!verify_data(["importo", "ente"])) return;
        global_var.lastAccess = "_action/pay";
        global_var.action_info = {
            main_title: ` Paga a ${document.getElementById("ente").value}`,
            ammount: document.getElementById("importo").value + document.getElementById("currency").textContent
        }
        save_global_var();

        window.electronAPI.carica_html('contactless')
    });
}
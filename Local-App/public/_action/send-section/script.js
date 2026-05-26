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



async function send() {
    let ammount = document.getElementById("importo").value;
    let destinatario = document.getElementById("ente").value;
    const prefix = "NexBank://account?destinatario=";
    if (destinatario.includes(prefix)) {
        destinatario = destinatario.split(prefix)[1];
    }

    if (!verify_data(["importo", "ente"])) return;
    let token = global_var.main;
    let recive = await window.electronAPI.invia_soldi(ammount, destinatario, token, global_var.username);
    if (recive.ans) {
        show_success_message("Azione andata a buon fine", `Hai inviato ${ammount} ${codiceToSimbolo(recive.valute)} a ${destinatario}`, "ok", "window.electronAPI.carica_html('_action/send')")
    } else {
        show_error_message("Azione bloccata", `Invio di ${ammount}€ per l'utente: ${destinatario} bloccato causa ${recive.message.message}`, "ok",)
    }
}


const nfcImg = document.getElementById('nfc-img');
if (nfcImg) {
    nfcImg.addEventListener('click', function (e) {
        e.stopPropagation();
        nfcImg.style.transform = 'scale(1.2)';
        setTimeout(() => nfcImg.style.transform = '', 150);
        if (!verify_data()) return;
        global_var.lastAccess = "_action/send"
        global_var.action_info = {
            main_title: ` Invia a ${document.getElementById("ente").value}`,
            ammount: document.getElementById("importo").value + document.getElementById("currency").textContent
        }
        save_global_var();
        window.electronAPI.carica_html('contactless')
    });
}
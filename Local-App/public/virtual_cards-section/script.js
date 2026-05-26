let global_var = {};
let card_builded = false;

const numero_carta = document.getElementById("numero_carta");
const scadenza_carta = document.getElementById("scadenza_carta");
const cvv = document.getElementById("cvv");
const generaBtn = document.getElementById("genera-cvv-btn");

async function save_global_var() {
    global_var.numero = numero_carta.value;
    global_var.scadenza = scadenza_carta.value;
    await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
    global_var = await window.electronAPI.loadVar();
}

async function init() {
    await load_global_var();
    let info = await window.electronAPI.decrypt_token(global_var.main);
    info = info.message;
    document.getElementById("card-number").textContent = "**** **** **** " + info.numero_carta
    document.getElementById("intestatario").textContent = info.intestatario
    document.getElementById("main-card").src = `../../img/carte/${info.src}.png`
    document.getElementById("balance").textContent = codiceToSimbolo(info.valute) + (info.saldo).toFixed(2)
}

window.addEventListener('DOMContentLoaded', init);

numero_carta.addEventListener("input", () => {
    let val = numero_carta.value.replace(/\D/g, '');
    val = val.match(/.{1,4}/g)?.join('-') || '';
    numero_carta.value = val.slice(0, 19);
    save_global_var();
});

scadenza_carta.addEventListener("input", () => {
    let val = scadenza_carta.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    scadenza_carta.value = val;
    save_global_var();
});



let cvvLoaded = null;

async function generate_card() {
    let ok = true;
    const inputAmmonto = document.getElementById("ammonto");
    const inputIntestatario = document.getElementById("intestatario");
    const copyBtn = document.getElementById("copy-btn");


    await save_global_var();


    if (!card_builded) {

        copyBtn.style.border = '1px solid #e74c3c';
        copyBtn.classList.add('shake');

        setTimeout(() => {
            copyBtn.classList.remove('shake');
        }, 400);
        ok = false;
    } else {
        copyBtn.style.border = '';
    }


    if (!verify_data(["intestatario", "ammonto"])) return;

    const ammontoValue = inputAmmonto.value.trim();




    if (!ok) return;


    cvvLoaded = await window.electronAPI.genera_carta(
        global_var.numero,
        global_var.scadenza,
        global_var.intestatario,
        inputAmmonto.value,
        global_var.username,
        global_var.card_data.name,
        valute[index_value].codice
    );

    if (cvvLoaded.ans) {
        drawCard();
        card_builded = false;
        if (cvvLoaded?.cvv) {
            flipCard(true);
        }
    } else {
        show_error_message("Errore generazione carta", cvvLoaded.message, "Riprova", "");
    }
}
async function handleCreaCarta() {
    let data = await window.electronAPI.crea_cod_carta();
    document.getElementById('numero_carta').value = data.message;

    const today = new Date();
    const expiryMonth = String(today.getMonth() + 1).padStart(2, '0');
    const expiryYear = String((today.getFullYear() + 5) % 100).padStart(2, '0');
    document.getElementById('scadenza_carta').value = `${expiryMonth}/${expiryYear}`;
    drawCard();
    save_global_var();
}

let index_value = 0;


function switch_valute() {
    index_value = (index_value + 1) % valute.length;
    document.getElementById("euro-icon").textContent = valute[index_value].simbolo;
    document.getElementById("saldo-text").textContent = `Saldo ( ${valute[index_value].nome} )`;
}

let time_flash_card = ["15m", "30m", "1h", "1g", "10g"];
let index = 1;

document.getElementById("durata").addEventListener("click", () => {
    index = (index + 1) % time_flash_card.length;
    document.getElementById("durata").value = time_flash_card[index];

});

async function genera_flash_card() {

    let ans = await window.electronAPI.genera_flash_card(numero_carta, scadenza_carta, time, saldo, username, valute, card_default);
}
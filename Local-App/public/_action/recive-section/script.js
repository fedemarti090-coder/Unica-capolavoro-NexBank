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



    document.getElementById("card-number").textContent = "**** **** **** " + info.numero_carta;
    document.getElementById("intestatario").textContent = info.intestatario;
    document.getElementById("main-card").src = `../../../img/carte/${info.src}.png`;
    document.getElementById("balance").textContent = codiceToSimbolo(info.valute) + (info.saldo).toFixed(2)
    let qr;
    const qr_img = document.getElementById("qr-canvas")
    const qr_box = document.getElementById("qr-box");
    const qr_title = document.getElementById("qr-text");
    const link = `NexBank://account?destinatario=${global_var.username}`;
    try {
        await navigator.clipboard.writeText(link);
        qr = await window.electronAPI.build_qrcode(link);
        qr_box.dataset.linkPagamento = link;
        qr_box.addEventListener("click", () => {
            console.log(qr_box.dataset.linkPagamento);
            qr_title.textContent = "QR code copiato !"
            qr_box.style.borderColor = "1px solid #34C759";
            qr_box.style.boxShadow = "0 0 8px #2ca74b";
            qr_title.style.color = "#34C759"
            setTimeout(() => {
                qr_title.textContent = "Ricevi tramite QR code";
                qr_box.style.border = "";
                qr_box.style.boxShadow = "";
                qr_title.style.color = "";
            }, 3000);
        })
    } catch (err) {
        console.log(err);
    }
    qr_img.src = qr.qr;
    load_popup1();
}

window.addEventListener("DOMContentLoaded", init);

function build_popup_message(id, user, amount, valute) {
    return `
        <div class="popup" >
            <div>${user}</div>
            <div>${amount} ${valute}</div>
            <button id="popup${id}">Ritira</button>
        </div>
    `;
}

const popup_box = document.getElementById("box-popup");



function load_popup(notifiche) {
    popup_box.innerHTML = "";

    if (!notifiche || notifiche.length === 0) {
        popup_box.innerHTML = `<div class="no-notifications" style="user-select: none">Nessuna notifica</div>`;
        return;
    }

    notifiche.forEach((message, i) => {
        popup_box.insertAdjacentHTML(
            "beforeend",
            build_popup_message(i, message.sender, message.ammount, codiceToSimbolo(message.valute))
        );

        document.getElementById(`popup${i}`).addEventListener("click", async function () {
            const notifElem = this.parentElement;

            notifElem.classList.add("slide-out");
            console.log(message.id, global_var.username);

            let ans = await window.electronAPI.remove_popup(message.id, global_var.username, global_var.main);
            console.log(ans);

            if (ans.ans) {
                // 1. Dati in entrata (quelli inviati dal mittente)
                const importoInviato = message.ammount;
                const valutaInviata = codiceToSimbolo(message.valute);

                // 2. Dati elaborati (convertiti sulla carta dal server)
                // Usiamo toFixed(2) per evitare sbrodolate di decimali dopo la conversione
                const importoConvertito = Number(ans.credit.real_ammount).toFixed(2);
                const valutaCarta = codiceToSimbolo(ans.credit.real_valute);
                const mittente = message.sender;

                // 3. Costruiamo la stringa esatta: valore inviato + valuta -> valore convertito + valuta carta
                const stringaConversione = `${importoInviato} ${valutaInviata} convertiti in ${importoConvertito} ${valutaCarta} correttamente incassati da ${mittente}`;

                // 4. Mostriamo il messaggio
                show_success_message(
                    `Hai ricevuto ${importoInviato} ${valutaInviata}`,
                    stringaConversione,
                    "ok",
                    "window.electronAPI.carica_html('_action/recive')"
                );
            }

            setTimeout(() => {
                // Fai attenzione qui: "popup" deve essere il nome dell'array globale che contiene le notifiche
                popup = popup.filter((_, index) => index !== i);
                load_popup(popup);
            }, 300);
        });
    });
}

let popup;
async function load_popup1() {
    popup = ((await window.electronAPI.check_popup(global_var.username)).popup).reverse();
    load_popup(popup);
}


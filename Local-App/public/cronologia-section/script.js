
let global_var = {};

async function save_global_var() {
    await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
    global_var = await window.electronAPI.loadVar();
}

async function init() {
    await load_global_var();

    let status = await open_cronologia();
    if (!status) {
        document.getElementById("error-section").classList.remove("hidden");
        document.getElementById("main-area-content").classList.add("hidden");
        document.getElementById("wallet-content-show").classList.add("hidden");
        
    } else {
        renderPayments();
        initScrollbar();
    }
}

window.addEventListener('DOMContentLoaded', init);


let payments;
async function open_cronologia() {


    if (global_var.numero == "") {
        return false;
    }

    try {

        let ans = await window.electronAPI.effettua_azione(
            global_var.numero.replace(/-/g, " "),
            global_var.scadenza,
            global_var.cvv,
            global_var.intestatario,
            0,
            true
        );
        console.log(ans)
        if (!ans.answer) {
            console.log("err")
            return false;
        }
        document.getElementById("balance").textContent = ans.val + "€";
        payments = ans.movimenti.reverse();
;
        return true;

    } catch (err) {
        console.log(err)
        return false;
    }
}




function renderPayments() {
    const container = document.getElementById("payments-list");
    container.innerHTML = ""; // pulisce eventuali vecchi contenuti

    if (!payments || payments.length === 0) {
        const emptyMsg = document.createElement("div");
        emptyMsg.classList.add("payment-row", "empty-message");
        emptyMsg.style.userSelect = 'none';
        emptyMsg.textContent = "Ancora nessun movimento";
        container.appendChild(emptyMsg);
        return;
    }

    payments.forEach(p => {
        const row = document.createElement("div");
        row.classList.add("payment-row");

        const iconWrapper = document.createElement("div");
        iconWrapper.classList.add("payment-icon");

        iconWrapper.innerHTML = p.amount >= 0
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C46A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
             </svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
             </svg>`;

        const date = document.createElement("div");
        date.classList.add("payment-date");
        date.textContent = p.date;

        const amount = document.createElement("div");
        amount.classList.add("payment-amount");
        amount.classList.add(p.amount >= 0 ? "positive" : "negative");
        amount.textContent = (p.amount >= 0 ? "+" : "") + p.amount + "€";

        row.appendChild(iconWrapper);
        row.appendChild(date);
        row.appendChild(amount);
        container.appendChild(row);
    });
}



function initScrollbar() {
    const wrapper = document.querySelector(".wallet-scroll-wrapper");
    const thumb = document.getElementById("scroll-thumb");

    if (!thumb) return;

    function updateThumb() {
        const ratio = wrapper.clientHeight / wrapper.scrollHeight;
        thumb.style.height = Math.max(ratio * wrapper.clientHeight, 40) + "px";
        thumb.style.top = (wrapper.scrollTop / wrapper.scrollHeight) * wrapper.clientHeight + "px";
    }

    wrapper.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);

    updateThumb();
}



const scrollWrapper = document.querySelector(".wallet-scroll-wrapper");
const balanceBox = document.getElementById("balance-box");

scrollWrapper.addEventListener("scroll", () => {
    if (scrollWrapper.scrollTop > 60) {
        balanceBox.classList.add("compact");
    } else {
        balanceBox.classList.remove("compact");
    }
});
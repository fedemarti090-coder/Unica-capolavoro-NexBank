let global_var = {};

async function save_global_var() {
  await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
  global_var = await window.electronAPI.loadVar();
}

async function init() {
  await load_global_var();
  if (global_var.register) {
    let text = "Benvenuto";
    if (global_var.gender == "F") {
      text = "Benvenuta";
    }
    show_success_message(`${text} ${global_var.username}!`, "La creazione del tuo account è andata a buon fine", "Iniziamo", "window.electronAPI.carica_html('card');")

  }

  const token_list = await window.electronAPI.get_token_list(global_var.username);

  global_var.token_card = token_list.message;
  if (!global_var.boot) {
    global_var.main = (token_list.message)[0];
    global_var.boot = true;
    save_global_var();
  }


  save_global_var();




  let info = await window.electronAPI.decrypt_token(global_var.main);
  info = info.message;
  document.getElementById("saldo").textContent = codiceToSimbolo(info.valute) + " " + (info.saldo).toFixed(2);
  document.getElementById("main-card").src = `../../img/carte/${info.src}.png`
  init_popup();
  load_movimenti();
}

window.addEventListener('DOMContentLoaded', init);




const cronology_section = document.getElementById("cronology-section");

function build_cronologia(cronology) {
  if (cronology.length == 0) {
    cronology_section.innerHTML += `
      <div class="tx">
        <div>
          <strong>Ancora nessun movimento</strong>
        </div>
      </div>
      `
  }

  for (let el of cronology) {
    let sign = "pos"
    if (el.ammonto < 0) {
      sign = "neg";
    }
    cronology_section.innerHTML += `
        <div class="tx">
        <div>
          <strong>${el.ente}</strong>
          <p>${el.date} | **** **** **** ${el.card}</p>
        </div>
        <span class="${sign}">${Number(el.ammonto || 0).toFixed(2)} ${codiceToSimbolo(el.valute)}</span>
      </div>
        `
  }
}




async function init_popup() {
  let ans = await window.electronAPI.check_popup(global_var.username);
  popup = ans.popup;

  if (popup.length > 0) {
    document.getElementById("notification-badge").classList.remove('hidden');
    document.getElementById("notification-badge").textContent = popup.length
  } else {
    document.getElementById("notification-badge").classList.add('hidden')
  }

}

async function load_movimenti() {
  let movimenti = await window.electronAPI.check_movimenti(global_var.username);
  build_cronologia(movimenti.movimenti);
}

let isGhostMode = false;

function toggleGhostMode() {
  isGhostMode = !isGhostMode;

  const saldo = document.getElementById("saldo");
  const icon = document.getElementById("ghost-icon");
  const amounts = document.querySelectorAll(".tx-amount");

  if (isGhostMode) {
    saldo.classList.add("privacy-blur");
    amounts.forEach(a => a.classList.add("privacy-blur"));

    icon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
  } else {
    saldo.classList.remove("privacy-blur");
    amounts.forEach(a => a.classList.remove("privacy-blur"));

    icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
  }
}

let open_menu = false;

function toggleOptions() {
  open_menu = !open_menu;

  const sidebar = document.getElementById("section-bar");
  const overlay = document.getElementById("black-overlay");

  if (open_menu) {
    // Apertura
    sidebar.classList.add("open");
    overlay.classList.add("visible");
    // Blocca lo scroll del body
    document.body.style.overflow = "hidden";
  } else {
    // Chiusura
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
    // Sblocca lo scroll del body
    document.body.style.overflow = "auto";
  }
}
// Funzione logout
function logout() {
  window.electronAPI.carica_html('login');
}



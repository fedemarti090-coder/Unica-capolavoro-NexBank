let global_var = {};
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};


async function save_global_var() {
  await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
  global_var = await window.electronAPI.loadVar();
}

async function init() {
  await load_global_var();

  const userMailInput = document.getElementById("user-mail");
  if (userMailInput) {
    userMailInput.value = global_var.mail || 'Imposta una mail';
  }

  if (global_var.mail) {
    mail_founded();
  }

  document.getElementById("account-username").value = global_var.username || '';

  const passField = document.getElementById("account-password");
  if (passField) {
    if (global_var.password && global_var.password.length > 0) {
      passField.value = "•".repeat(global_var.password.length);
    } else {
      passField.value = "Password non sincronizzata";
      passField.type = "text";
    }
  }

  setInterval(set_time, 1000);
}

async function set_time() {
  let time = await window.electronAPI.get_remaining_time();
  try {
    document.getElementById("account-last-login").value = time.formatted;

  } catch (err) { }
}


init()

function ripristina_vista_account(whereToExit) {
  document.getElementById("main-title").textContent = "Account";

  carica_html_box([main_info, second_info]);

  fill_main_info();

  document.getElementById("actions-exit").onclick = function () {
    window.electronAPI.carica_html(whereToExit || 'home');
  };
}

async function disconnetti() {
  global_var.username = "";
  global_var.password = "";
  global_var.lastAccess = "";

  const usernameInput = document.getElementById("account-username");
  const passwordInput = document.getElementById("account-password");
  const lastLoginInput = document.getElementById("account-last-login");

  if (usernameInput) usernameInput.value = "";
  if (passwordInput) passwordInput.value = "";
  if (lastLoginInput) lastLoginInput.value = "";

  await save_global_var();

  window.electronAPI.carica_html('login');
}

function carica_html_box(element) {
  const main_box = document.getElementById("wallet-content");
  if (!main_box) return; // Protezione se l'elemento non esiste

  main_box.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "animate-slide-up";
  wrapper.style.width = "100%";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";

  // Inserisce gli elementi HTML forniti
  for (let el of element) {
    wrapper.innerHTML += el;
  }

  main_box.appendChild(wrapper);

  // Aggiornamento campi dati (se presenti nell'HTML appena iniettato)
  try {
    const userField = document.getElementById("account-username");
    const passField = document.getElementById("account-password");
    const mailField = document.getElementById("user-mail");

    if (userField) {
      userField.value = global_var.username || '';
    }

    if (passField) {
      if (global_var.password && global_var.password.length > 0) {
        passField.value = "•".repeat(global_var.password.length);
        passField.type = "password";
      } else {
        passField.value = "Password non sincronizzata";
        passField.type = "text";
      }
    }

    if (mailField) {
      mailField.value = global_var.mail || 'Imposta una mail';
    }

    if (global_var.mail) {
      mail_founded();
    }
  } catch (err) {
    console.error("Errore nel riempimento campi dopo il caricamento box:", err);
  }
}


const main_info = `
<div class="card-details" style="user-select: none;">
      <div class="detail-row">
        <label>Username</label>
        <input type="text" id="account-username" readonly>
      </div>

      <div class="detail-row">
        <label>Password</label>
        <div class="input-wrapper">
          <input type="password" id="account-password" value="********" readonly>
          <div class="edit-icon" onclick="set_password()" title="Cambia password">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
        </div>
      </div>

     <div class="detail-row">
  <label>Mail</label>
  <div class="input-wrapper" id="mail-button">
    <input id="user-mail" readonly>
      <div class="edit-icon" onclick="set_mail()" title="Imposta mail">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      </div>
  </div>
</div>
<div class="detail-row">
        <label>PIN</label>
        <div class="input-wrapper">
          <input type="password" id="account-pin" readonly value="000000"> 
          <div class="edit-icon" onclick="set_pin()" title="Aggiungi PIN">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="detail-row">
        <label>Tempo rimanente alla sessione</label>
        <input type="text" id="account-last-login" readonly>
      </div>

      <div class="button-run">
        <span class="logout" id="logout-btn" onclick="disconnetti()">Disconnetti</span>
      </div>
    </div>
`

const second_info = `
    <div class="wallet-content">
    <div class="card-details">
      <div class="detail-row">
        <label>Connessione</label>
        <input type="text" value="HTTPS" readonly>
      </div>
      <div class="detail-row">
        <label>Crpting</label>
        <input type="text" value="ASF" readonly>
      </div>
      <div class="detail-row">
        <label>CVV cript</label>
        <input type="text" value="#Hash" readonly>
      </div>
      <div class="detail-row">
        <label>Indirizzo IP</label>
        <input type="text" value="192.168.47.129" readonly>
      </div>
    </div>
  </div>
  <label class="final-el">Licenza NexBank ® Riservata</label>
  <div style="height: 10px; width: 100%;"></div>
`

carica_html_box([main_info, second_info])

const pin_section = `
<div class="card-details" style="user-select: none;">
  <div class="detail-row" id="psold-container">
    <label>Password account</label>
    <input type="password" id="psold" placeholder="Inserisci password per procedere">
  </div>
  
  <div class="detail-row" style="justify-content: center; margin-top: 20px">
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; margin-bottom: 10px;">
        <label id="pin-title" style="margin-bottom: 0;">Crea nuovo PIN</label>
        <div class="info-icon" title="Il PIN deve essere composto da 6 cifre numeriche e servirà per accedere più rapide." style="cursor: help; display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        </div>
    </div>
    
    <div style="display: flex; gap: 10px; justify-content: center;">
      <input type="text" maxlength="1" class="otp-box" id="otp-1" inputmode="numeric" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-2" inputmode="numeric" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-3" inputmode="numeric" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-4" inputmode="numeric" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-5" inputmode="numeric" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-6" inputmode="numeric" style="width: 40px; text-align: center; font-size: 1.5rem;" />
    </div>
    <button class="pay-button green" style="margin: 20px auto 0 auto; display: block;" onclick="procedi_pin()" id="pin-button-main">Conferma</button>
  </div>
</div>
`;

const pin_button = `
  <button class="pay-button green" onclick="mail_sended()">
    Imposta PIN
</button>
`

let temp_pin = "";

function set_pin() {
  carica_html_box([pin_section]);
  
  document.getElementById("main-title").textContent = "Imposta PIN";
  
  document.getElementById("actions-exit").onclick = function() {
    ripristina_vista_account("home");
  };

  temp_pin = "";
  setTimeout(setupOtpInputs, 100);
}

async function procedi_pin() {
  const psoldInput = document.getElementById("psold");
  const psold = psoldInput ? psoldInput.value : "";
  const pin_attuale = leggi_pin();
  const username = global_var.username;


  if (pin_attuale.length < 6) {
    for (let i = 1; i <= 6; i++) {
      const el = document.getElementById('otp-' + i);
      if (el && !el.value) {
        el.classList.add('otp-error', 'shake');
        setTimeout(() => {
          el.classList.remove('shake', 'otp-error');
        }, 500);
      }
    }
    return;
  }


  if (temp_pin === "") {

    if (!verify_data(["psold"])) return;

    try {

      let ans = await window.electronAPI.esegui_login(username, psold, null);

      if (ans && ans.ans) {

        temp_pin = pin_attuale;


        document.getElementById("psold").readOnly = true;
        document.getElementById("pin-title").textContent = "Conferma il nuovo PIN";
        document.getElementById("pin-button-main").textContent = "Imposta PIN definitivo";

        resetOtpInputs();
        document.getElementById('otp-1').focus();
      } else {

        show_error_message("Errore Login", "La password attuale non è corretta.", "Riprova");


      }
    } catch (err) {
      console.error("Errore durante il login:", err);
    }
  }


  else {
    if (pin_attuale === temp_pin) {
      try {

        let ans = await window.electronAPI.set_pin(username, pin_attuale);

        show_success_message(
          "PIN impostato",
          "Il tuo PIN è stato aggiornato con successo.",
          "Ok",
          "window.electronAPI.carica_html('account')"
        );
      } catch (err) {
        console.error("Errore impostazione PIN:", err);
      }
    } else {

      gestisciErrorePin();
    }
  }
}



function resetOtpInputs() {
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('otp-' + i);
    if (el) el.value = '';
  }
}


function gestisciErrorePin() {
  const title = document.getElementById("pin-title");
  const vecchiaLabel = "Conferma il nuovo PIN";

  title.textContent = "I PIN non combaciano!";
  title.style.color = '#e74c3c';


  resetOtpInputs();
  document.getElementById('otp-1').focus();


  setTimeout(() => {
    title.textContent = vecchiaLabel;
    title.style.color = '';
  }, 2000);
}

function setupOtpInputs() {
  const inputs = Array.from(document.querySelectorAll('.otp-box'));
  inputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      input.classList.remove('otp-error', 'shake');
    });
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      if (/[^0-9]/.test(value)) {
        e.target.value = '';
        return;
      }
      if (value.length === 1 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });
}





function leggi_pin() {
  let codice = '';
  for (let i = 1; i <= 6; i++) {
    const val = document.getElementById('otp-' + i).value;
    codice += val ? val : '';
  }
  return codice;
}
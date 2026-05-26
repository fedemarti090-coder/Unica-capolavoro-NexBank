const mail_setting = `
<div class="card-details" style="user-select: none;">
  <div class="detail-row">
    <label>Inserisci la tua mail</label>
    <input id="mail">
  </div>

  </div>
`

const mail_setting_fase1 = `
<div class="card-details" style="user-select: none;">
  <div class="detail-row">
    <label>Inserisci la tua mail</label>
    <div class="input-group">
      <input type="email" id="mail" placeholder="esempio@mail.com">
      <div class="generate-icon" onclick="mail_sended()" title="Reinvia mail">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 4v6h-6"></path>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </div>
    </div>
  </div>
</div>
`;
const confirm_button = `
<button class="pay-button green" onclick="confirm_change_password()">
    Conferma Modifica
</button>
`

const mail_button = `
<button class="pay-button green" onclick="mail_sended()">
    Invia Mail
</button>

`

const mail_confirm = `
<div class="card-details" style="user-select: none; margin-top: 20px">
  <div class="detail-row" style="justify-content: center;">
    <label style="width: 100%; text-align: center; margin-bottom: 10px;">Inserisci il codice di verifica inviato alla tua mail</label>
    <div style="display: flex; gap: 10px; justify-content: center;">
      <input type="text" maxlength="1" class="otp-box" id="otp-1" inputmode="numeric" autocomplete="one-time-code" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-2" inputmode="numeric" autocomplete="one-time-code" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-3" inputmode="numeric" autocomplete="one-time-code" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-4" inputmode="numeric" autocomplete="one-time-code" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-5" inputmode="numeric" autocomplete="one-time-code" style="width: 40px; text-align: center; font-size: 1.5rem;" />
      <input type="text" maxlength="1" class="otp-box" id="otp-6" inputmode="numeric" autocomplete="one-time-code" style="width: 40px; text-align: center; font-size: 1.5rem;" />
    </div>
    <button class="pay-button green" style="margin: 20px auto 0 auto; display: block;" onclick="mail_confirm_server()">Conferma Codice</button>
  </div>
</div>
`;

function fill_main_info() {
  const userField = document.getElementById("account-username");
  const passField = document.getElementById("account-password");

  if (userField) userField.value = global_var.username || '';

  if (passField) {
    if (global_var.password && global_var.password.length > 0) {
      passField.value = "•".repeat(global_var.password.length);
      passField.type = "password";
    } else {
      passField.value = "Password non sincronizzata";
      passField.type = "text";
    }
  }
}



function set_mail() {
  document.getElementById("main-title").textContent = "Aggiungi Mail";

  carica_html_box([mail_setting, mail_button]);

  document.getElementById("actions-exit").onclick = function () {
    ripristina_vista_account('home');
  };
}

let isSendingMail = false;

async function mail_sended() {
  if (isSendingMail) return;
  if (!verify_data(["mail"])) return;

  const mailInput = document.getElementById("mail");
  const mail = mailInput.value;

  isSendingMail = true;
  mailInput.disabled = true;

  try {
    let sended = await window.electronAPI.send_ath_mail(mail, global_var.username);

    if (sended.ans) {
      carica_html_box([mail_setting_fase1, mail_confirm]);

      document.getElementById("mail").value = mail;
      document.getElementById("mail").readOnly = true;
      setTimeout(setupOtpInputs, 100);
    } else {
      show_error_message("Errore", "Impossibile inviare la mail", "Ok", "set_mail();");
      isSendingMail = false;
      mailInput.disabled = false;
    }
  } catch (error) {
    console.error(error);
    isSendingMail = false;
  } finally {
    isSendingMail = false;
  }
}

async function mail_confirm_server() {
  let ans = await window.electronAPI.check_otpcode(global_var.username, conferma_codice_mail())

  if (ans.ans) {
    show_success_message("Email impostata", `La tua email ${document.getElementById("mail").value} è stata correttamente associata all'utente ${global_var.username}`, "Ok", "window.electronAPI.carica_html('account')")
    let new_data = await window.electronAPI.esegui_login(global_var.username, global_var.password)
    console.log(new_data);
    global_var.mail = new_data.mail;
    save_global_var();
    document.getElementById("user-mail").value = new_data.mail;
  } else {
    show_error_message("Errore associazione", `Non siamo riuscita a associare la tua mail causa ${ans.message}`);
  }
}

function mail_founded() {
  const mailButtonContainer = document.getElementById("mail-button");

  if (!mailButtonContainer) return;

  const new_button = `
        <input id="user-mail" readonly>

    <div class="edit-icon" onclick="set_mail()" title="Modifica mail">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" 
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    </div>`;

  mailButtonContainer.innerHTML = new_button;
  const userMailInput = document.getElementById("user-mail");
  userMailInput.value = global_var.mail || 'Imposta una mail';


}
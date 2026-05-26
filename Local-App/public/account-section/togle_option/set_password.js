const set_password_info = `
<div class="card-details" style="user-select: none;">
  <div class="detail-row">
    <label>Vecchia password</label>
    <input type="password" id="vps">
  </div>

  <div class="detail-row">
    <label>Nuova password</label>
    <div class="input-group">
      <input type="password" id="nps0">
      <div class="generate-icon" onclick="generateSecurePassword()" title="Genera password sicura">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
      </div>
    </div>
  </div>

  <div class="detail-row">
    <label>Conferma nuova password</label>
    <input type="password" id="nps1">
  </div>

  <div class="strength-container">
    <div class="strength-header">
      <span id="strength-label" class="status-weak">Debole</span>
    </div>
    
    <div class="strength-bars">
      <div class="bar active-red"></div> 
      <div class="bar"></div>
      <div class="bar"></div>
    </div>

    <div class="requirements-list">
      <div class="req-item" id="req-len">
        <span class="req-icon">✕</span>
        <label>Almeno 8 caratteri</label>
      </div>
      <div class="req-item" id="req-up">
        <span class="req-icon">✕</span>
        <label>Almeno una maiuscola (A-Z)</label>
      </div>
      <div class="req-item" id="req-spec">
        <span class="req-icon">✕</span>
        <label>Almeno un carattere speciale</label>
      </div>
    </div>
  </div>
</div>
`;

function set_password() {

  ripristina_vista_account("account");
  document.getElementById("main-title").textContent = "Cambia password";
  carica_html_box([set_password_info, confirm_button]);


  const nps0 = document.getElementById("nps0");
  const nps1 = document.getElementById("nps1");


  const checkLive = () => {
    const p1 = nps0.value;
    const p2 = nps1.value;
    check_streng_password();
    if (p2 === "") {
      nps0.style.borderColor = "transparent";
      nps1.style.borderColor = "transparent";
      return;
    }
    if (p1 === p2) {
      nps0.style.borderColor = "#22c55e";
      nps1.style.borderColor = "#22c55e";
    } else {
      nps0.style.borderColor = "#e74c3c";
      nps1.style.borderColor = "#e74c3c";
    }

  };


  nps0.addEventListener("input", checkLive);
  nps1.addEventListener("input", checkLive);



}

function confirm_change_password() {

  const old_password = document.getElementById("vps");
  const new_password0 = document.getElementById("nps0");
  const new_password1 = document.getElementById("nps1");
  if (!verify_data(["vps", "nps0", "nps1"])) return;
  if (new_password0.value != new_password1.value) return;
  console.log("start")
  send_change_password(old_password.value, new_password0.value);
  console.log("finish")
}

function checkPasswordStrength(password) {
  const isLengthOk = password.length >= 8;

  const hasUpper = /[A-Z]/.test(password);

  const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', ';', ':', ',', '.', '?', '/'];
  const hasSpecial = specialChars.some(char => password.includes(char));

  let score = 0;
  if (isLengthOk) score++;
  if (hasUpper) score++;
  if (hasSpecial) score++;

  return {
    length: isLengthOk,
    upper: hasUpper,
    special: hasSpecial,
    score: score
  };
}

function check_streng_password(password) {
  const result = checkPasswordStrength(nps0.value);
  document.getElementById("req-len").classList.toggle("valid", result.length);
  document.getElementById("req-up").classList.toggle("valid", result.upper);
  document.getElementById("req-spec").classList.toggle("valid", result.special);

  const bars = document.querySelectorAll('.bar');
  const label = document.getElementById('strength-label');

  bars.forEach(b => b.className = 'bar');

  if (result.score === 1) {
    bars[0].classList.add('active-red');
    label.textContent = "Debole";
    label.className = "status-weak";
  } else if (result.score === 2) {
    bars[0].classList.add('active-orange');
    bars[1].classList.add('active-orange');
    label.textContent = "Media";
    label.className = "status-medium";
  } else if (result.score === 3) {
    bars.forEach(b => b.classList.add('active-green'));
    label.textContent = "Forte";
    label.className = "status-strong";
  }
}

async function send_change_password(old_val, new_val) {
  try {
    let ans = await window.electronAPI.change_password(old_val, new_val, global_var.username);


    if (ans.ans) {
      show_success_message("Password aggiornata", "La tua password è stata reimpostata correttamente, è consigliato rieffettuare l'accesso", "Ok", "window.electronAPI.carica_html('account')");
    } else {
      show_error_message("Password non reimpostata", `Tentativo di reimpostaggio password bloccato causa ${ans.message.message} `, "Ok", "");
    }
  } catch (error) {
    console.error("Errore nella connessione IPC:", error);
  }
}

function generateSecurePassword() {
  const sets = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    number: "0123456789",
    special: "!@#$%*&^"
  };


  let password = "";
  password += sets.upper.charAt(Math.floor(Math.random() * sets.upper.length));
  password += sets.special.charAt(Math.floor(Math.random() * sets.special.length));
  password += sets.number.charAt(Math.floor(Math.random() * sets.number.length));


  const allChars = sets.upper + sets.lower + sets.number + sets.special;
  for (let i = password.length; i < 12; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }


  password = password.split('').sort(() => 0.5 - Math.random()).join('');


  const nps0 = document.getElementById("nps0");
  const nps1 = document.getElementById("nps1");
  if (nps0) {
    nps0.value = password;
    nps0.type = "text";
    nps1.value = password;
    nps1.type = "text";

    check_streng_password(password);


  }
}

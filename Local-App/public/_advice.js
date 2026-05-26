function gen_error_message(error_title, error_message, error_button, action) {
  return `
        <div class="wallet-content error-section" id="error-section">
      <div class="error-box" style="user-select: none;">

        <div class="error-icon">
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ff3b30" stroke-width="2" />
            <line x1="15" y1="9" x2="9" y2="15" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" />
            <line x1="9" y1="9" x2="15" y2="15" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>

        <div class="error-title">${error_title}</div>

        <div class="error-message" id="error-message-text">
          ${error_message}
        </div>

        <button class="error-btn" onclick="${action}; close_message();" id="error-btn">
          ${error_button}
        </button>

      </div>

    </div>
    `
}

function gen_corret_message(succes_title, succes_message, succes_button, action) {
  return `
        <div class="wallet-content success-section" id="success-section">
      <div class="success-box" style="user-select: none;">

        <div class="success-icon">
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#34C759" stroke-width="2" />
            <path d="M7 13l3 3 7-7" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <div class="success-title" id="seccuess-section-h1">${succes_title}</div>

        <div class="success-message" id="success-section-text">
          ${succes_message}
        </div>

        <button class="success-btn" onclick="${action}; close_message();" id="start-button">
          ${succes_button}
        </button>

      </div>
    </div>
    `
}

function gen_session_message(session_title, session_message, session_button, action) {
  return `
    <div class="wallet-content session-expired-section" id="session-expired-section">
      <div class="session-expired-box" style="user-select: none;">

        <div class="session-expired-icon">
          <!-- Icona orologio azzurra -->
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#1E90FF" stroke-width="2" />
            <line x1="12" y1="6" x2="12" y2="12" stroke="#1E90FF" stroke-width="2" stroke-linecap="round" />
            <line x1="12" y1="12" x2="16" y2="14" stroke="#1E90FF" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>

        <div class="session-expired-title">${session_title}</div>

        <div class="session-expired-message">
          ${session_message}
        </div>

        <button class="session-expired-btn" onclick="${action}; close_message();" id="session-expired-btn">
          ${session_button}
        </button>

      </div>
    </div>
    `
}

function add_style_to_css() {
  

  const cssContent = `

.wallet-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}


#message-store {
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 9999;
  display: none;
  background: rgba(0, 0, 0);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  overflow: hidden;
  pointer-events: none;
}

#message-store.active {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}


.error-section {
  margin-top: 120px;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.error-box {
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 22px;
  padding: 35px 25px;
  width: 100%;
  max-width: 350px;
  text-align: center;
  animation: fadeInError 0.4s ease;
}

.error-icon {
  margin-bottom: 20px;
  animation: pulseError 1.6s infinite ease-in-out;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff3b30;
  margin-bottom: 12px;
}

.error-message {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 25px;
}

.error-btn {
  background: #ff3b30;
  border: none;
  border-radius: 14px;
  padding: 12px 20px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
}

.error-btn:hover {
  background: #ff453a;
  transform: translateY(-2px);
}

.error-btn:active {
  transform: scale(0.98);
}


.success-section {
  margin-top: 120px;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.success-box {
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 22px;
  padding: 35px 25px;
  width: 100%;
  max-width: 350px;
  text-align: center;
  animation: fadeInSuccess 0.4s ease;
}

.success-icon {
  margin-bottom: 20px;
  animation: pulseSuccess 1.6s infinite ease-in-out;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #34C759;
  margin-bottom: 12px;
}

.success-message {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 25px;
}

.success-btn {
  background: #34C759;
  border: none;
  border-radius: 14px;
  padding: 12px 20px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
}

.success-btn:hover {
  background: #28a745;
  transform: translateY(-2px);
}

.success-btn:active {
  transform: scale(0.98);
}


.session-expired-section {
  margin-top: 120px;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.session-expired-box {
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 22px;
  padding: 35px 25px;
  width: 100%;
  max-width: 350px;
  text-align: center;
  animation: fadeInSession 0.4s ease;
}

.session-expired-icon {
  margin-bottom: 20px;
  animation: pulseSession 1.6s infinite ease-in-out;
}

.session-expired-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1E90FF;
  margin-bottom: 12px;
}

.session-expired-message {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 25px;
}

.session-expired-btn {
  background: #1E90FF;
  border: none;
  border-radius: 14px;
  padding: 12px 20px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
}

.session-expired-btn:hover {
  background: #187bcd;
  transform: translateY(-2px);
}

.session-expired-btn:active {
  transform: scale(0.98);
}


.hidden {
  display: none !important;
}


@keyframes fadeInError {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseError {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeInSuccess {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseSuccess {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeInSession {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseSession {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

.error-404-section {
  margin-top: 120px;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.error-404-box {
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 22px;
  padding: 35px 25px;
  width: 100%;
  max-width: 350px;
  text-align: center;
  animation: fadeIn404 0.4s ease;
}

.error-404-icon {
  margin-bottom: 20px;
}

.error-404-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 25px;
}

.error-404-btn {
  background: #3d3d3d; /* Stesso rosso dell'errore standard */
  border: none;
  border-radius: 14px;
  padding: 12px 20px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
}

.error-404-btn:hover {
  background: #4b4b4b;
  transform: translateY(-2px);
}

@keyframes fadeIn404 {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
    `;

  const styleTag = document.createElement('style');
  styleTag.id = 'advice-styles';
  styleTag.textContent = cssContent;

  const existingStyle = document.getElementById('advice-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  document.head.appendChild(styleTag);
}



function show_error_message(error_title, error_message, error_button, action) {
  add_style_to_css(); 

  const messageStore = document.getElementById("message-store");
  messageStore.style.pointerEvents = "auto";
  if (!messageStore) return;

  messageStore.innerHTML = gen_error_message(error_title, error_message, error_button, action);
  messageStore.classList.add("active"); 

  const errorSection = document.getElementById("error-section");
  if (errorSection) {
    errorSection.classList.remove("hidden"); 
  }
}

function show_success_message(success_title, success_message, success_button, action) {
  add_style_to_css(); 

  const messageStore = document.getElementById("message-store");
  messageStore.style.pointerEvents = "auto";
  if (!messageStore) return;

  messageStore.innerHTML = gen_corret_message(success_title, success_message, success_button, action);
  messageStore.classList.add("active"); 

  const successSection = document.getElementById("success-section");
  if (successSection) {
    successSection.classList.remove("hidden"); 
  }
}

function show_session_expired(session_title, session_message, session_button, action) {
  add_style_to_css(); 

  const messageStore = document.getElementById("message-store");
  messageStore.style.pointerEvents = "auto";
  if (!messageStore) return;

  messageStore.innerHTML = gen_session_message(session_title, session_message, session_button, action);
  messageStore.classList.add("active"); 

  const sessionSection = document.getElementById("session-expired-section");
  if (sessionSection) {
    sessionSection.classList.remove("hidden");
  }
}



function close_message() {
  const messageStore = document.getElementById("message-store");
  if (!messageStore) return;

  messageStore.classList.remove("active"); 
  messageStore.innerHTML = ""; 

}

setInterval(async () => {
  try {
    await load_global_var();
    const time = await window.electronAPI.get_remaining_time();

    const folder = window.location.pathname.split("/").slice(-2, -1)[0];

    if (!time.active && folder !== "login-section") {
      show_session_expired(
        "Sessione terminata",
        "Timer 15m terminato rieffettua l'accesso per iniziare una nuova sessione",
        "Accedi",
        "window.electronAPI.carica_html('login');"
      )
    }
  } catch (err) {
    console.error("Errore:", err);
  }
}, 60000);

const valute = [
  { nome: "Euro", codice: "EUR", simbolo: "€" },
  { nome: "Dollaro statunitense", codice: "USD", simbolo: "$" },
  { nome: "Sterlina britannica", codice: "GBP", simbolo: "£" },
  { nome: "Yen giapponese", codice: "JPY", simbolo: "¥" },
  { nome: "Franco svizzero", codice: "CHF", simbolo: "₣" },
  { nome: "Rublo russo", codice: "RUB", simbolo: "₽" },
  { nome: "Rupia indiana", codice: "INR", simbolo: "₹" },
  { nome: "Won sudcoreano", codice: "KRW", simbolo: "₩" },
  { nome: "Lira turca", codice: "TRY", simbolo: "₺" },
  { nome: "Real brasiliano", codice: "BRL", simbolo: "R$" },
  { nome: "Dollaro australiano", codice: "AUD", simbolo: "A$" },
  { nome: "Dollaro canadese", codice: "CAD", simbolo: "C$" },
  { nome: "Dong vietnamita", codice: "VND", simbolo: "₫" },
  { nome: "Shekel israeliano", codice: "ILS", simbolo: "₪" },
  { nome: "Naira nigeriana", codice: "NGN", simbolo: "₦" }

];

function codiceToSimbolo(codice) {
  const valuta = valute.find(v => v.codice === codice);
  return valuta ? valuta.simbolo : "?";
}

function verify_data(id_lista) {
    let ok = true;

    id_lista.forEach(id => {
        const elemento = document.getElementById(id);
        
        if (elemento && elemento.value.trim() === "") {
            elemento.style.border = '1px solid #e74c3c';
            elemento.style.boxShadow = '0 0 8px rgba(255, 77, 77, 0.4)';
            elemento.classList.add('shake');
            
            setTimeout(() => {
                elemento.classList.remove('shake');
            }, 400);

            ok = false;
        } else if (elemento) {
            elemento.style.border = '';
            elemento.style.boxShadow = '';
            elemento.classList.remove('shake');
        }
    });

    return ok;
}

function gen_404_message(error_title, error_button, action) {
  return `
    <div class="wallet-content error-404-section" id="error-404-section">
      <div class="error-404-box" style="user-select: none;">
        
        <div class="error-404-gif-container">
          <img src="../img/error.gif" alt="Error" class="error-404-gif">
        </div>

        <div class="error-404-title">${error_title}</div>

        <button class="error-404-btn" onclick="${action}; close_message();">
          <span class="btn-text">${error_button}</span>
        </button>

      </div>
    </div>
  `;
}

function gen_404_message(error_title, error_button, action) {
  return `
    <div class="wallet-content error-404-section" id="error-404-section">
      <div class="error-404-box" style="user-select: none;">

        <div class="error-404-icon">
          <img src="../../img/error.gif" alt="Error" style="width: 90%; height: auto;" draggable="false">
        </div>

        <div class="error-404-title">${error_title}</div>

        <button class="error-404-btn" onclick="${action}; close_message();" id="error-404-btn">
          ${error_button}
        </button>

      </div>
    </div>
    `
}

function show_404_error(action = "window.electronAPI.carica_html('login')") {
  add_style_to_css(); 

  const messageStore = document.getElementById("message-store");
  if (!messageStore) return;
  
  messageStore.style.pointerEvents = "auto";
  messageStore.innerHTML = gen_404_message(
    "Errore connessione al server", 
    "Riprova", 
    action
  );
  messageStore.classList.add("active"); 

  const section404 = document.getElementById("error-404-section");
  if (section404) {
    section404.classList.remove("hidden"); 
  }
}
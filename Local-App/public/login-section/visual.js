// Gestione input fluido PIN e shake errore
function setupOtpInputsLogin() {
    const inputs = Array.from(document.querySelectorAll('.otp-box'));
    inputs.forEach((input, idx) => {
        input.addEventListener('input', (e) => {
            input.classList.remove('otp-error', 'shake');
            const value = e.target.value;
            if (/[^0-9]/.test(value)) {
                e.target.value = '';
                return;
            }
            if (value.length === 1 && idx < inputs.length - 1) {
                inputs[idx + 1].focus();
            }
            if(get_pin_code().length == 6){
                
                login();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && idx > 0) {
                inputs[idx - 1].focus();
            }
        });
    });
}

// Funzione da chiamare per shakerare i box vuoti in caso di errore
function shakeOtpInputsLogin() {
    for (let i = 1; i <= 6; i++) {
        const el = document.getElementById('otp-' + i);
        if (el && !el.value) {
            el.classList.add('otp-error', 'shake');
            setTimeout(() => {
                el.classList.remove('otp-error', 'shake');
            }, 1500);
        }
    }
}
let global_var = {};

async function save_global_var() {
    await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
    global_var = await window.electronAPI.loadVar();
}

async function init() {
    await load_global_var();


    use_password();
}

window.addEventListener('DOMContentLoaded', init);


const CARD_DISTANCE = 60;
const SCROLL_SPEED = 0.4;
const FADE_START = 500;
const FADE_END = 700;

let offset = 0;
let totalHeight;

function ref_password() {
    const input = document.getElementById("password");
    const eyeOpen = document.getElementById("eye-open");
    const eyeClosed = document.getElementById("eye-closed");

    if (input.type === "password") {
        input.type = "text";
        eyeOpen.classList.add("hidden");
        eyeClosed.classList.remove("hidden");
    } else {
        input.type = "password";
        eyeOpen.classList.remove("hidden");
        eyeClosed.classList.add("hidden");
    }
}



function creaCarta(carta, y) {
    const container = document.getElementById("cards-bg");

    const img = document.createElement("img");
    img.src = `../../img/carte/${carta}.png`;
    img.style.position = "absolute";
    img.style.width = "320px";
    img.style.height = "200px";
    img.style.left = `calc(50% - 160px)`;
    img.style.top = `${y}px`;
    img.classList.add("bg-card");
    container.appendChild(img);
}

const nomiCarte = [
    { name: "american-express-gold", color: "gold" },
    { name: "Banca_Stabiese_world elite", color: "black" },
    { name: "bancawidiba", color: "blue" },
    { name: "bbva", color: "blue" },
    { name: "carta", color: "green" },
    { name: "Carta-Credito-Business-Corporate_rid", color: "green" },
    { name: "carta-xme-credit-card-visa", color: "green" },
    { name: "deutscheBank", color: "silver" },
    { name: "FlexiaClassic_430x243_CardDesign_2404", color: "red" },
    { name: "nexi", color: "blue" },
    { name: "PayCash", color: "black" },
    { name: "privati_credito_bianca", color: "white" },
    { name: "revoult", color: "blue" },
    { name: "SoFi", color: "blue" }
];

function generaVettoreCarte(lunghezzaTarget = 16) {
    let risultato = [];


    let pool = [];
    for (let i = 0; i < lunghezzaTarget; i++) {
        pool.push(nomiCarte[i % nomiCarte.length]);
    }


    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };


    let tentativi = 0;
    let valida = false;

    while (!valida && tentativi < 100) {
        shuffle(pool);
        valida = true;
        for (let i = 0; i < pool.length - 1; i++) {
            if (pool[i].color === pool[i + 1].color) {
                valida = false;
                break;
            }
        }
        tentativi++;
    }


    return pool.map(c => c.name);
}


let carte_png = generaVettoreCarte(32);



function crea_frame_carte() {

    let carte_png = generaVettoreCarte(16);
    totalHeight = CARD_DISTANCE * carte_png.length;
    carte_png.forEach((carta, i) => {
        creaCarta(carta, 15 + i * CARD_DISTANCE);
    });
}


function animaCarte() {
    offset += SCROLL_SPEED;

    const container = document.getElementById("cards-bg");
    const cards = container.querySelectorAll(".bg-card");

    cards.forEach((card, i) => {
        let y = (15 + i * CARD_DISTANCE + offset) % (container.offsetHeight + 200);
        card.style.top = `${y - 200}px`;

        let opacity = 1;

        if (y >= FADE_START) {
            opacity = 1 - (y - FADE_START) / (FADE_END - FADE_START);
            if (opacity < 0) opacity = 0;
        }

        card.style.opacity = opacity;
        card.style.zIndex = Math.floor(y);

    });

    requestAnimationFrame(animaCarte);
}

window.addEventListener("DOMContentLoaded", () => {
    crea_frame_carte();
    animaCarte();
});


let gender = true;

function swith_gender() {
    gender = !gender;
    if (gender) {
        document.getElementById("gender").textContent = 'M';
    } else {
        document.getElementById("gender").textContent = 'F';
    }
    global_var.gender = document.getElementById("gender").textContent;
    save_global_var();
}

document.getElementById("username").addEventListener("input", () => {
    if (document.getElementById("username").value.at(-1) == "a") {
        gender = true;

    } else {
        gender = false;
    }
    swith_gender();
})

let pin = false;

function use_password() {
    const pannel_password = `
        <div class="auth-label-container" style="display: flex; align-items: center; gap: 5px; margin-bottom: 8px; user-select: none; font-family: sans-serif; font-size: 14px;">
            <span id="btn-password" onclick="use_password()" style="cursor: pointer; transition: 0.3s; color: #fff; border-bottom: 2px solid #fff; font-size: 0.75rem;">Password</span>
            <span style="color: rgba(255, 255, 255, 0.4);">/</span>
            <span id="btn-pin" onclick="use_pin()" style="cursor: pointer; transition: 0.3s; color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">PIN</span>
        </div>
        <div class="input-wrapper" style="width: 100%;">
          <input type="password" id="password" style="width: 100%; box-sizing: border-box; background: rgba(255, 255, 255, 0.08); border: none; border-radius: 14px; padding: 12px; color: #fff; font-size: 0.95rem; outline: none;">
          <span class="suffix" onclick="ref_password();" id="pass_viwe" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%);">
            <svg id="eye-open" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg id="eye-closed" class="hidden" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-5.94" />
              <path d="M1 1l22 22" />
              <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-4.23 5.05" />
              <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
            </svg>
          </span>
        </div>
    `;

    document.getElementById("password-id").innerHTML = pannel_password;
    pin = false;
}

function use_pin() {

    const pannel_pin = `
            <div class="auth-label-container" style="display: flex; align-items: center; gap: 5px; margin-bottom: 8px; user-select: none; font-family: sans-serif; font-size: 14px;">
                <span id="btn-password" onclick="use_password()" style="cursor: pointer; transition: 0.3s; color: rgba(255, 255, 255, 0.6); border-bottom: 2px solid transparent; font-size: 0.75rem;">Password</span>
                <span style="color: rgba(255, 255, 255, 0.4);">/</span>
                <span id="btn-pin" onclick="use_pin()" style="cursor: pointer; transition: 0.3s; color: #fff; border-bottom: 2px solid #fff; font-size: 0.75rem;">PIN</span>
            </div>
            <div class="otp-wrapper" style="display: flex; gap: 8px; justify-content: space-between; width: 100%; box-sizing: border-box; margin-top: 2px;">
                <input type="text" maxlength="1" class="otp-box detail-row-input" id="otp-1" inputmode="numeric" style="width: 100%; height: 15px; text-align: center; font-size: 1.2rem; background: rgba(255,255,255,0.08); border-radius: 14px; border: none; color: #fff; outline: none;" />
                <input type="text" maxlength="1" class="otp-box detail-row-input" id="otp-2" inputmode="numeric" style="width: 100%; height: 15px; text-align: center; font-size: 1.2rem; background: rgba(255,255,255,0.08); border-radius: 14px; border: none; color: #fff; outline: none;" />
                <input type="text" maxlength="1" class="otp-box detail-row-input" id="otp-3" inputmode="numeric" style="width: 100%; height: 15px; text-align: center; font-size: 1.2rem; background: rgba(255,255,255,0.08); border-radius: 14px; border: none; color: #fff; outline: none;" />
                <input type="text" maxlength="1" class="otp-box detail-row-input" id="otp-4" inputmode="numeric" style="width: 100%; height: 15px; text-align: center; font-size: 1.2rem; background: rgba(255,255,255,0.08); border-radius: 14px; border: none; color: #fff; outline: none;" />
                <input type="text" maxlength="1" class="otp-box detail-row-input" id="otp-5" inputmode="numeric" style="width: 100%; height: 15px; text-align: center; font-size: 1.2rem; background: rgba(255,255,255,0.08); border-radius: 14px; border: none; color: #fff; outline: none;" />
                <input type="text" maxlength="1" class="otp-box detail-row-input" id="otp-6" inputmode="numeric" style="width: 100%; height: 15px; text-align: center; font-size: 1.2rem; background: rgba(255,255,255,0.08); border-radius: 14px; border: none; color: #fff; outline: none;" />
            </div>
        `;
    document.getElementById("remember").checked = false;
    document.getElementById("password-id").innerHTML = pannel_pin;
    document.getElementById("gender").classList.add("hidden");
    document.getElementById("testoM").textContent = "Login";
    document.getElementById("start-button").textContent = "Accedi";
    register = false;
    
    pin = true;
    setTimeout(() => {
        setupOtpInputsLogin(); 
        const firstInput = document.getElementById('otp-1');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}


function validateAndShakePin() {
    const inputs = document.querySelectorAll('.otp-box');
    let isComplete = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isComplete = false;
            input.classList.add('otp-error', 'shake');

            setTimeout(() => {
                input.classList.remove('shake');
            }, 400);
        } else {
            input.classList.remove('otp-error', 'shake');
        }
    });

    return isComplete;
}

function resetOtpInputs() {
    for (let i = 1; i <= 6; i++) {
        const el = document.getElementById('otp-' + i);
        if (el) el.value = '';
    }
}

function get_pin_code() {
    let code = "";
    for (let i = 1; i <= 6; i++) {
        const el = document.getElementById('otp-' + i);
        if (el) {
            code += el.value;
        }
    }
    return code;
}
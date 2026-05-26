// Funzione per testare se il server è attivo
async function test_server() {
    return await window.electronAPI.testServer();
}
let register = false;

async function login() {
    let server_status = await window.electronAPI.testServer();
    if (!server_status) {
        show_404_error();
        return;
    }
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    if (!pin) {
        if (!verify_data(["username", "password"])) return;
        global_var.password = password.value;
    } else {
        let ok = true
        if (!verify_data(["username"])) { ok = false };
        if (!validateAndShakePin()) { ok = false };
        if (!ok) return;

    }
    global_var.username = username.value;


    let ans;
    if (!register) {
        if (!pin) {
            ans = await window.electronAPI.esegui_login(username.value, password.value, null);
        } else {
            ans = await window.electronAPI.esegui_login(username.value, null, get_pin_code());

        }
    } else {

        ans = await window.electronAPI.esegui_registrazione(username.value, password.value);
    }
    global_var.mail = ans.mail;
    save_global_var();

    if (!ans.ans) {

        if (register) {
            show_error_message("Errore Registrazione", `Errore nella registrazione dell'account: ${username.value} username gia in uso`, "Ok");
        } else {
            if (pin) {
                resetOtpInputs();
                shakeOtpInputsLogin();
                document.getElementById('otp-1').focus();
            } else {
                show_error_message("Errore nel Login", `Errore nell login dell'account: ${username.value} ricontrollare le credenziali`, "Ok");

            }
        }

    } else {
        global_var.register = register;
        save_global_var();
        window.electronAPI.carica_html('home');
    }
}


const registrati = document.getElementById("remember");
try {
    registrati.addEventListener("click", () => {
        if (registrati.checked) {
            document.getElementById("gender").classList.remove("hidden");
            document.getElementById("testoM").textContent = "Register";
            document.getElementById("start-button").textContent = "Registrati";
            register = true;
            use_password();
        } else {
            document.getElementById("gender").classList.add("hidden");
            document.getElementById("testoM").textContent = "Login";
            document.getElementById("start-button").textContent = "Accedi";
            register = false;
        }
    })

} catch (err) { };


document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        login();
    }
});
document.addEventListener("DOMContentLoaded", async () => {
    await init();
    const container = document.getElementById("particle-container");
    const payButton = document.getElementById("pay-button");
    const statusText = document.getElementById("status-text");

    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        const posX = Math.random() * 100;
        const posY = Math.random() * 60;

        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 2 + 1.5;
        const delay = Math.random() * 2;

        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--duration', `${duration}s`);
        particle.style.animationDelay = `${delay}s`;

        particle.style.opacity = Math.random() * 0.8 + 0.2;

        container.appendChild(particle);
    }

    let isPaid = false;

    payButton.addEventListener("click", () => {
        if (isPaid) return;

        isPaid = true;
        global_var.lastAccess = "home";
        save_global_var();
        document.body.classList.add("success-mode");

        payButton.style.transform = "scale(0.95)";
        setTimeout(() => {
            payButton.style.transform = "scale(1)";
        }, 150);

        statusText.style.opacity = 0;

        setTimeout(() => {
            statusText.textContent = "Pagamento completato";
            statusText.style.color = "#22c55e";
            statusText.style.fontWeight = "600";
            statusText.style.opacity = 1;
        }, 300);
    });
});

let global_var = {};

async function save_global_var() {
    await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
    global_var = await window.electronAPI.loadVar();
}

async function init() {
    await load_global_var();
    let action_info = global_var.action_info;
    document.getElementById("merchant-name").textContent = action_info.main_title;
    document.getElementById("ammount").textContent = action_info.ammount;
}
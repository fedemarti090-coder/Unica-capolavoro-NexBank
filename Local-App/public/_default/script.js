const filiali = [
    { nome: "NexBank Bergamo Camozzi", indirizzo: "Via G. Camozzi, 27", stato: "Aperta" },
    { nome: "NexBank Bergamo Centro", indirizzo: "Via S. Bernardino, 72", stato: "Aperta" },
    { nome: "NexBank ATM Moroni", indirizzo: "Via G. Moroni, 314", stato: "24h" }
];

function caricaFiliali() {
    const list = document.getElementById("branch-list");
    list.innerHTML = "";

    filiali.forEach(f => {
        const item = document.createElement("div");
        item.className = "branch-item animate-slide-up";
        item.innerHTML = `
            <div class="branch-details">
                <p>${f.nome}</p>
                <span>${f.indirizzo}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.7rem; color: #22c55e;">${f.stato}</span>
                <div class="status-dot"></div>
            </div>
        `;
        
        // Al click potremmo simulare lo spostamento della mappa
        item.onclick = () => console.log("Selezionata:", f.nome);
        
        list.appendChild(item);
    });
}

// Inizializza la pagina
document.addEventListener("DOMContentLoaded", () => {
    caricaFiliali();
});
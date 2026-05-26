let global_var = {};

async function save_global_var() {
  await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
  global_var = await window.electronAPI.loadVar();
}

async function init() {
  await load_global_var();
  createCards();
  updateCards();

}

window.addEventListener('DOMContentLoaded', init);


const cardsData = [
  {
    name: "american-express-gold",
    title: "American Express Gold",
    emittente: "AEXP"
  },
  {
    name: "Banca_Stabiese_world elite",
    title: "Banca Sella",
    emittente: "MSC"
  },
  {
    name: "bancawidiba",
    title: "Banca Widiba",
    emittente: "VISA"
  },
  {
    name: "bbva",
    title: "BBVA",
    emittente: "MSC"
  },
  {
    name: "carta",
    title: "Postepay Green",
    emittente: "VISA"
  },
  {
    name: "Carta-Credito-Business-Corporate_rid",
    title: "BPER",
    emittente: "MSC"
  },
  {
    name: "carta-xme-credit-card-visa",
    title: "Intesa San Paolo",
    emittente: "VISA"
  },
  {
    name: "deutscheBank",
    title: "Deutsche Bank",
    emittente: "VISA"
  },
  {
    name: "FlexiaClassic_430x243_CardDesign_2404",
    title: "Unicredit",
    emittente: "MSC"
  },
  {
    name: "nexi",
    title: "Nexi",
    emittente: "VISA"
  },
  {
    name: "PayCash",
    title: "PayCash",
    emittente: "APPLE"
  },
  {
    name: "privati_credito_bianca",
    title: "Mastercard",
    emittente: "MSC"
  },
  {
    name: "revoult",
    title: "Revolut",
    emittente: "VISA"
  },
  {
    name: "SoFi",
    title: "SoFi",
    emittente: "MSC"
  }
];

const stack = document.getElementById("cards-stack");
const title = document.getElementById("card-title");
const description = document.getElementById("card-description");

let selectedIndex = 0;

function createCards() {
  cardsData.forEach((card, i) => {
    const img = document.createElement("img");
    img.src = `../../img/carte/${card.name}.png`;
    img.classList.add("card-item");
    stack.appendChild(img);
  });
}

function updateCards() {
  const cards = document.querySelectorAll(".card-item");

  cards.forEach((card, i) => {

    const distance = i - selectedIndex;
    const absDistance = Math.abs(distance);

    const scale = distance === 0 ? 1.1 : 0.85 - absDistance * 0.05;
    const opacity = absDistance > 4 ? 0 : 1 - absDistance * 0.2;
    const y = distance * 70;

    card.style.transform = `
      translate(-50%, ${y}px)
      scale(${scale})
    `;

    card.style.opacity = opacity;
    card.style.zIndex = 100 - absDistance;
  });

  title.textContent = cardsData[selectedIndex].title;
  description.textContent = `Carta selezionata pronta per l'utilizzo. (${cardsData[selectedIndex].emittente})`;
}

function handleScroll(e) {
  if (e.deltaY > 0) {
    selectedIndex++;
  } else {
    selectedIndex--;
  }

  if (selectedIndex < 0) selectedIndex = 0;
  if (selectedIndex >= cardsData.length) selectedIndex = cardsData.length - 1;

  updateCards();
}

window.addEventListener("wheel", handleScroll);

window.addEventListener("DOMContentLoaded", () => {

});

function seleziona_carta() {
  global_var.card_data = cardsData[selectedIndex];
  save_global_var();
  window.electronAPI.carica_html('build');
}

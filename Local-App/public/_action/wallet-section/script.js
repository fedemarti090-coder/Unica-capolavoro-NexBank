let global_var = {};

async function save_global_var() {
  await window.electronAPI.WriteVar(global_var);
}

async function load_global_var() {
  global_var = await window.electronAPI.loadVar();
}

let card_box = document.getElementById("card-box");

async function init() {
  await load_global_var();
  
  if (global_var.token_card) {
    
    for (let i = 0; i < global_var.token_card.length; i++) {
      const token = global_var.token_card[i];
      let info = await window.electronAPI.decrypt_token(token);
      info = info.message;
      
      card_box.insertAdjacentHTML('beforeend', build_object(i, info.numero_carta, info.intestatario, info.src + ".png", token, info.valute));
      
      const element = document.getElementById(`element${i}`);
      const tokenDiv = element.querySelector(".token");

      element.addEventListener("click", (e) => {
        
        if(e.target.classList.contains('delete-icon')) return;
        
        global_var.main = tokenDiv.innerHTML;
        save_global_var();
        window.electronAPI.carica_html(global_var.back_html);
      });
    }
  }

  attachDeleteHandlers();

  
  Sortable.create(card_box, {
    animation: 150,      
    ghostClass: 'sortable-ghost',  
    chosenClass: 'sortable-chosen', 
    dragClass: 'sortable-drag',     
    
    
    onEnd: async function () {
      updateCardsOrder();
    },
  });
}


async function updateCardsOrder() {
  const currentCards = card_box.querySelectorAll('.card-section');
  const newTokenArray = [];

  currentCards.forEach(card => {
    const token = card.querySelector('.token').innerHTML;
    newTokenArray.push(token);
  });

  
  global_var.token_card = newTokenArray;
  
  
  await save_global_var();
  console.log("Nuovo ordine salvato:", global_var.token_card);
}

window.addEventListener('DOMContentLoaded', init);



function build_object(id, cod_carta, cardholder, src, token, valute) {
  return `
    <div class="card-section" style="cursor: pointer;" id="element${id}">

      <div class="card-columns">
        <img src="../../../img/carte/${src}" class="payment-card" draggable="false" alt="Carta">

        <div class="card-info-box">
          <span class="card-number">**** **** **** ${cod_carta}</span>
          <div class="card-holder-row">
            <span class="card-holder">${cardholder} ${codiceToSimbolo(valute)}</span>
            <span class="delete-icon">✘</span>
          </div>
        </div>
      </div>

      <div class="token" style="display: none;">${token}</div>
    </div>
  `;
}


function attachDeleteHandlers() {
  const cards = document.querySelectorAll('.card-section');
  cards.forEach((card, i) => {
    const deleteIcon = card.querySelector('.delete-icon');
    const tokenDiv = card.querySelector('.token');

    deleteIcon.addEventListener('click', async (e) => {
      if(global_var.token_card.length == 1 ){
        return;
      }
      e.stopPropagation();
      const token = tokenDiv.innerHTML;
      global_var.token_card = global_var.token_card.filter(t => t !== token);
      save_global_var();
      card.remove();
      await window.electronAPI.remove_card(token, global_var.username);
      if(token == global_var.main){
        global_var.main = "";
        save_global_var();
      }
    });
  });
}


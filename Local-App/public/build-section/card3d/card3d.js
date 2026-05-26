
const card = document.getElementById('card');
const canvas = document.getElementById('cardCanvas');
const ctx = canvas.getContext('2d');

let isFlipped = false;


const frontImg = new Image();
frontImg.src = '../../img/carta-custom/carta-front.png';
const backImg = new Image();
backImg.src = '../../img/carta-custom/carta-back.png';


const numeroInput = document.getElementById('numero_carta');
const nomeInput = document.getElementById('intestatario');
const scadenzaInput = document.getElementById('scadenza_carta');
const cvvInput = document.getElementById('restrizioni');

function flipCard(forceBack = null) {
  if (forceBack === null) {
    isFlipped = !isFlipped;
  } else {
    isFlipped = forceBack;
  }

  const flipRotation = isFlipped ? 180 : 0;
  card.style.transform = `rotateX(0deg) rotateY(${flipRotation}deg)`;
  drawCard();
}

let autoFlipped = false;

function drawCard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isFlipped) {
    if (backImg.complete) ctx.drawImage(backImg, 0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(cvvLoaded?.cvv || '000', canvas.width - 105 - 50, 130);

    ctx.restore();
  } else {
    if (frontImg.complete) ctx.drawImage(frontImg, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    let cod = "**** **** **** "+ (numeroInput.value.slice(-4) || "0000");
    ctx.fillText(cod , 125, 86.5);
    ctx.fillText(nomeInput.value || 'Nome Cognome', 45, 186);
    ctx.fillText(scadenzaInput.value || '00/00', 275, 192);
  }
}


[numeroInput, nomeInput, scadenzaInput, cvvInput].forEach(input => {
  input.addEventListener('input', drawCard);
});


card.addEventListener('mousemove', e => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateY = ((x - centerX) / centerX) * 15;
  const rotateX = -((y - centerY) / centerY) * 15;

  const flipRotation = isFlipped ? 180 : 0;
  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY + flipRotation}deg)`;
});

card.addEventListener('mouseleave', () => {
  const flipRotation = isFlipped ? 180 : 0;
  card.style.transform = `rotateX(0deg) rotateY(${flipRotation}deg)`;
});


card.addEventListener('click', () => {
  isFlipped = !isFlipped;
  const flipRotation = isFlipped ? 180 : 0;
  card.style.transform = `rotateX(0deg) rotateY(${flipRotation}deg)`;
  drawCard();
});


frontImg.onload = drawCard;
backImg.onload = drawCard;
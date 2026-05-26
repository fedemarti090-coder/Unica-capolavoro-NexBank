let leftCenterIndex = 0;
let rightCenterIndex = 0;

function renderScrollFixed(containerId, centerIndex) {
    const container = document.getElementById(containerId);
    const isLeft = (containerId === 'left-scroll');
    container.innerHTML = '';

    for (let offset = -2; offset <= 2; offset++) {
        const div = document.createElement('div');
        div.classList.add('currency');

        
        if (offset === 0) div.classList.add('opacity-10');
        else if (Math.abs(offset) === 1) div.classList.add('opacity-5');
        else div.classList.add('opacity-2');

        let idx = centerIndex + offset;
        
        if (idx < 0 || idx >= valute.length) {
            div.innerHTML = "&nbsp;";
        } else {
            div.textContent = valute[idx].simbolo;
            
            div.onclick = () => {
                if (isLeft) leftCenterIndex = idx;
                else rightCenterIndex = idx;
                renderScrollFixed('left-scroll', leftCenterIndex);
                renderScrollFixed('right-scroll', rightCenterIndex);
            };
        }
        container.appendChild(div);
    }
    updateNames();
    converti();
}

function updateNames() {
    if(valute[leftCenterIndex]) 
        document.getElementById('name-left').textContent = valute[leftCenterIndex].nome;
    if(valute[rightCenterIndex]) 
        document.getElementById('name-right').textContent = valute[rightCenterIndex].nome;
}


function addWheelFixed(containerId, isLeft) {
    const container = document.getElementById(containerId);
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) {
            if (isLeft && leftCenterIndex < valute.length - 1) leftCenterIndex++;
            if (!isLeft && rightCenterIndex < valute.length - 1) rightCenterIndex++;
        } else {
            if (isLeft && leftCenterIndex > 0) leftCenterIndex--;
            if (!isLeft && rightCenterIndex > 0) rightCenterIndex--;
        }
        renderScrollFixed(containerId, isLeft ? leftCenterIndex : rightCenterIndex);
    }, {passive: false});
}

function converti(){
    const input = document.getElementById('input-left').value;
    const rateSorgente = valute[leftCenterIndex].codice;
    const rateDestinazione = valute[rightCenterIndex].codice;
    document.getElementById("input-right").value = (change_valute(parseFloat(input), rateSorgente, rateDestinazione)).toFixed(2);
}

document.getElementById("input-left").addEventListener("input", ()=>{
    converti();
})


renderScrollFixed('left-scroll', leftCenterIndex);
renderScrollFixed('right-scroll', rightCenterIndex);
addWheelFixed('left-scroll', true);
addWheelFixed('right-scroll', false);
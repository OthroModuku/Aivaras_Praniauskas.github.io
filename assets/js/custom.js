document.addEventListener("DOMContentLoaded", function () {

    const forma = document.querySelector('.php-email-form');
    if (forma) {
        const rezultatuText = document.getElementById('rezultatuText');
        const successMessage = document.getElementById('successMessage');
        const submitBtn = forma.querySelector('button[type="submit"]');

        function validateField(input) {
            const errorDiv = input.nextElementSibling;
            let valid = true;
            let message = '';

            if (input.name === 'vardas' || input.name === 'pavarde') {
                if (!input.value.trim()) {
                    valid = false;
                    message = 'Laukas negali būti tuščias.';
                } else if (!/^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s]+$/.test(input.value)) {
                    valid = false;
                    message = 'Galima įvesti tik raides.';
                }
            } else if (input.name === 'email') {
                if (!/^\S+@\S+\.\S+$/.test(input.value.trim())) {
                    valid = false;
                    message = 'Neteisingas el. pašto formatas.';
                }
            } else if (input.name === 'adresas') {
                if (!input.value.trim()) {
                    valid = false;
                    message = 'Laukas negali būti tuščias.';
                }
            }

            if (!valid) {
                input.classList.add('invalid');
                input.classList.remove('valid');
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
            } else {
                input.classList.remove('invalid');
                input.classList.add('valid');
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            }

            updateSubmitState();
            return valid;
        }

        const inputs = forma.querySelectorAll('input[name="vardas"], input[name="pavarde"], input[name="email"], input[name="adresas"]');
        inputs.forEach(input => input.addEventListener('input', () => validateField(input)));

        const phoneInput = forma.querySelector('input[name="telefonas"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', function () {
                let value = phoneInput.value.replace(/\D/g, '');
                if (value.startsWith('370')) value = value.slice(3);
                if (value.startsWith('0')) value = value.slice(1);
                if (!value.startsWith('6') && value.length > 0) value = '';
                value = value.slice(0, 8);

                let formatted = '';
                if (value.length > 0) {
                    formatted = `+370 ${value.slice(0, 3)}`;
                    if (value.length > 3) formatted += ' ' + value.slice(3);
                }

                phoneInput.value = formatted;
                updateSubmitState();
            });
        }

        function updateSubmitState() {
            const invalid = forma.querySelector('.invalid');
            const phoneValid = /^\+370 6\d{2} \d{4,5}$/.test(phoneInput.value);
            submitBtn.disabled = !!invalid || !phoneValid;
        }

        forma.addEventListener('submit', function (e) {
            e.preventDefault();

            let allValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) allValid = false;
            });

            if (!allValid || submitBtn.disabled) return;

            const formData = {
                vardas: forma.querySelector('input[name="vardas"]').value,
                pavarde: forma.querySelector('input[name="pavarde"]').value,
                email: forma.querySelector('input[name="email"]').value,
                telefonas: phoneInput.value,
                adresas: forma.querySelector('input[name="adresas"]').value,
                klausimas1: forma.querySelector('input[name="klausimas1"]').value,
                klausimas2: forma.querySelector('input[name="klausimas2"]').value,
                klausimas3: forma.querySelector('input[name="klausimas3"]').value
            };

            const vidurkis =
                (Number(formData.klausimas1) +
                    Number(formData.klausimas2) +
                    Number(formData.klausimas3)) / 3;

            rezultatuText.textContent = `
Vardas: ${formData.vardas}
Pavardė: ${formData.pavarde}
El. paštas: ${formData.email}
Tel. Numeris: ${formData.telefonas}
Adresas: ${formData.adresas}
Klausimas 1: ${formData.klausimas1}
Klausimas 2: ${formData.klausimas2}
Klausimas 3: ${formData.klausimas3}

${formData.vardas} ${formData.pavarde}: ${vidurkis.toFixed(1)}
            `;

            successMessage.style.display = 'block';
            setTimeout(() => (successMessage.style.display = 'none'), 3000);
        });
    }

    const difficultySelect = document.getElementById("difficulty");
    const gameBoard = document.getElementById("game-board");
    const moveCount = document.getElementById("move-count");
    const matchedPairsCount = document.getElementById("matched-pairs");
    const winMessage = document.getElementById("win-message");
    const startBtn = document.getElementById("start-btn");
    const resetBtn = document.getElementById("reset-btn");

    const bestEasy = document.getElementById("best-easy");
    const bestHard = document.getElementById("best-hard");
    const timerDisplay = document.getElementById("timer");

    const cardsData = ["🍎","🍌","🍇","🍒","🥝","🍍","🍉","🍑","🥭","🍋","🍊","🍐"];
    let gameCards = [], firstCard=null, secondCard=null, lockBoard=false, moves=0, matchedPairs=0, gameStarted=false;
    let timer=null, seconds=0;

    function loadBestScores() {
        const easyScore = localStorage.getItem("best_easy");
        const hardScore = localStorage.getItem("best_hard");
        bestEasy.textContent = easyScore ? easyScore + " ėjimų" : "-";
        bestHard.textContent = hardScore ? hardScore + " ėjimų" : "-";
    }

    function updateBestScore(difficulty, moves) {
        const key = difficulty === "easy" ? "best_easy" : "best_hard";
        const currentBest = localStorage.getItem(key);
        if (!currentBest || moves < Number(currentBest)) {
            localStorage.setItem(key, moves);
            if (difficulty==="easy") bestEasy.textContent = moves + " ėjimų";
            else bestHard.textContent = moves + " ėjimų";
        }
    }

    function startTimer() {
        clearInterval(timer);
        seconds = 0;
        timerDisplay.textContent = formatTime(seconds);
        timer = setInterval(() => {
            seconds++;
            timerDisplay.textContent = formatTime(seconds);
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function formatTime(sec) {
        const m = Math.floor(sec/60);
        const s = sec % 60;
        return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
    }

    function shuffle(array){
        for(let i=array.length-1;i>0;i--){
            const j=Math.floor(Math.random()*(i+1));
            [array[i],array[j]]=[array[j],array[i]];
        }
    }

    function setupBoard(){
        let rows,cols;
        if(difficultySelect.value==="easy"){rows=3; cols=4;}
        else {rows=4; cols=6;}

        const neededPairs = (rows*cols)/2;
        const selectedCards = cardsData.slice(0,neededPairs);
        gameCards = [...selectedCards,...selectedCards];
        shuffle(gameCards);

        gameBoard.innerHTML="";
        gameBoard.style.gridTemplateColumns=`repeat(${cols},1fr)`;

        gameCards.forEach(card=>{
            const cardElement=document.createElement("div");
            cardElement.classList.add("card");
            cardElement.dataset.value=card;
            cardElement.innerHTML=`<span class="card-front">${card}</span><span class="card-back">❓</span>`;
            gameBoard.appendChild(cardElement);
            cardElement.addEventListener("click",flipCard);
        });

        moves=0; matchedPairs=0;
        moveCount.textContent=moves;
        matchedPairsCount.textContent=matchedPairs;
        winMessage.style.display="none";
        firstCard=null; secondCard=null; lockBoard=false;
    }

    function flipCard(){
        if(lockBoard || this===firstCard) return;
        this.classList.add("flipped");
        if(!firstCard){firstCard=this; return;}
        secondCard=this;
        moves++;
        moveCount.textContent=moves;
        checkForMatch();
    }

    function checkForMatch(){
        const isMatch = firstCard.dataset.value===secondCard.dataset.value;
        if(isMatch){
            disableCards();
            matchedPairs++;
            matchedPairsCount.textContent=matchedPairs;
            if(matchedPairs===gameCards.length/2){
                setTimeout(()=>{
                    winMessage.style.display="block";
                    stopTimer();
                    updateBestScore(difficultySelect.value,moves);
                },500);
            }
        } else unflipCards();
    }

    function disableCards(){
        firstCard.removeEventListener("click",flipCard);
        secondCard.removeEventListener("click",flipCard);
        resetBoard();
    }

    function unflipCards(){
        lockBoard=true;
        setTimeout(()=>{
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            resetBoard();
        },1000);
    }

    function resetBoard(){[firstCard,secondCard]=[null,null]; lockBoard=false;}

    startBtn.addEventListener("click",()=>{
        if(!difficultySelect.value){alert("Pasirinkite sunkumą!"); return;}
        gameStarted=true;
        setupBoard();
        startTimer();
    });

    resetBtn.addEventListener("click",()=>{
        if(!gameStarted) return;
        setupBoard();
        startTimer();
    });

    difficultySelect.addEventListener("change",()=>{
        if(gameStarted) setupBoard();
    });

    loadBestScores();
});
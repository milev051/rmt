const socket = io.connect();
let playerID;
let selectedAnswer;

const playerTitleElement = document.getElementById('player');
const answersElement = document.getElementById('answers');
const timerElement = document.getElementById('timer');
const restartButtonElement = document.getElementById('restart');
const questionTextElement = document.getElementById('question');
const answerButtonElements = [
    document.getElementById('answer1'),
    document.getElementById('answer2'),
    document.getElementById('answer3'),
    document.getElementById('answer4'),
];
document.getElementById('restart').addEventListener('click', () => { socket.emit('restart'); });

socket.on('start', handleStart);
socket.on('next', handleNext);
socket.on('end', handleEnd);
socket.on('checkAnswer', handleCheckAnswer);
socket.on('mesta_su_popunjena', handleMestaSuPopunjena);
socket.on('refreshTimer', handlerefreshTimer);

function handleMestaSuPopunjena(data) {
    document.body.innerHTML = '';
    let tekst = document.createTextNode('Sva mesta su popunjena');
    document.body.appendChild(tekst);
}

function handleStart(data) {
    playerID = data.playerID;
    playerTitleElement.innerText = `Player ${playerID + 1}`;
    questionTextElement.style.display = '';
    answersElement.style.display = '';
    restartButtonElement.style.display = 'none';
    questionTextElement.innerText = data.question.questionString;
    answerButtonElements.forEach((answerButtonElement, index) => {
        answerButtonElement.innerText = data.question.answers[index];
        answerButtonElement.disabled = false;
        answerButtonElement.style.backgroundColor = '';
        // Check if the event listener is already added using a custom attribute
        if (!answerButtonElement.getAttribute('data-listener-added')) {
            answerButtonElement.addEventListener('click', () => submitAnswer(index));
            answerButtonElement.setAttribute('data-listener-added', 'true');
        }
    });
}

function handleNext(data) {
    questionTextElement.innerText = data.question.questionString;
    answerButtonElements.forEach((answerButtonElement, index) => {
        answerButtonElement.innerText = data.question.answers[index];
        answerButtonElement.style.backgroundColor = '';
        answerButtonElement.disabled = false;
    });
}

function handleEnd(data) {
    playerTitleElement.innerText = `You: ${data.thisScore}, Opponent: ${data.opponentScore}`;
    questionTextElement.style.display = 'none';
    answersElement.style.display = 'none';
    restartButtonElement.style.display = 'block';
}

function handleCheckAnswer(data) {
    if (data.answerIsCorrect) {
        selectedAnswer.style.backgroundColor = '#00cc84';
    } else {
        selectedAnswer.style.backgroundColor = '#ef114c';
    }
}

function handlerefreshTimer(data) {
    timerElement.innerText = data.elapsedSeconds;
}

function submitAnswer(answer) {
    answerButtonElements.forEach((answerButtonElement) => {
        answerButtonElement.disabled = true;
        answerButtonElement.style.opacity = '';
    });
    answerButtonElements[answer].style.opacity = '1';
    selectedAnswer = answerButtonElements[answer];
    socket.emit('answer', { playerID, answer });
}
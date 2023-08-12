const socket = io.connect();
let playerID;
let opponentPlayerID;
if (playerID == 0) opponentPlayerID = 1; else opponentPlayerID = 0;

const playerTitleElement = document.getElementById('player');
const restartButtonElement = document.getElementById('restart');
const questionTextElement = document.getElementById('question');
const answerButtonElements = [
    document.getElementById('answer1'),
    document.getElementById('answer2'),
    document.getElementById('answer3'),
    document.getElementById('answer4'),
];

socket.on('mesta_su_popunjena', (data) => {
    document.body.innerHTML = '';
    let tekst = document.createTextNode('Sva mesta su popunjna');
    document.body.appendChild(tekst);
});

socket.on('start', (data) => {
    playerID = data.playerID;
    playerTitleElement.innerText = 'Player ' + (parseInt(playerID) + 1);

    questionTextElement.innerText = data.question.questionString;
    answerButtonElements.forEach((answerButtonElement, index) => {
        answerButtonElement.innerText = data.question.answers[index];
        answerButtonElement.className = 'answer';
        answerButtonElement.disabled = false;
        answerButtonElement.addEventListener('click', () => submitAnswer(index));
    });
});

socket.on('next', (data) => {
    questionTextElement.innerText = data.question.questionString;
    answerButtonElements.forEach((answerButtonElement, index) => {
        answerButtonElement.innerText = data.question.answers[index];
        answerButtonElement.disabled = false;
    });
});

socket.on('end', (data) => {
    questionTextElement.style.display = 'none';
    answerButtonElements.forEach(answer => answer.style.display = 'none');
    playerTitleElement.innerText = 'You: ' + data.scores[playerID] + ', Opponent: ' + data.scores[opponentPlayerID];
    restartButtonElement.style.display = 'block';
});

document.getElementById('restart').addEventListener('click', () => { socket.emit('restart'); });

function submitAnswer(answer) {
    answerButtonElements.forEach((answer) => {
        answer.disabled = true;
    });

    socket.emit('answer', { playerID: playerID, answer: answer });
}

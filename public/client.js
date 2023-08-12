const socket = io.connect();
let playerID;
let opponentPlayerID;
if (playerID == 0) opponentPlayerID = 1; else opponentPlayerID = 0;
const questionElement = document.getElementById('question');
const answerElements = [
    document.getElementById('answer1'),
    document.getElementById('answer2'),
    document.getElementById('answer3'),
    document.getElementById('answer4'),
];


socket.on('mesta_su_popunjena', (data) => {
    // Brisanje svih elemenata iz tela (body) HTML dokumenta
    document.body.innerHTML = '';
    // Dodavanje teksta "Sva mesta su popunjna" u telo (body) dokumenta
    let tekst = document.createTextNode('Sva mesta su popunjna');
    document.body.appendChild(tekst);
});

socket.on('start', (data) => {
    playerID = data.playerID;
    document.getElementById('player').innerText = 'Player ' + playerID;
    loadQuestion(data.question);
});

socket.on('next', (data) => {
    loadQuestion(data.question);
});

socket.on('end', (data) => {
    questionElement.style.display = 'none';
    answerElements.forEach(answer => answer.style.display = 'none');
    document.getElementById('player').innerText = 'You: ' + data.playerScores[playerID] + ', Opponent: ' + data.playerScores[opponentPlayerID];
    document.getElementById('restart').style.display = 'block';
});

//kad se klikne na restart dugme soket trazi od servera 'restart'
document.getElementById('restart').addEventListener('click', () => { socket.emit('restart'); });

function loadQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach((answer, index) => {
        const button = answerElements[index];
        button.innerText = answer;
        button.className = 'answer';
        button.disabled = false;
        button.addEventListener('click', () => submitAnswer(index + 1, question.answers.length));
    });
}

function submitAnswer(answer) {
    answerElements.forEach((answer) => {
        answer.disabled = true;
    });

    socket.emit('answer', { playerID: playerID, answer: answer });
}

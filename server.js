const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const opn = require('opn');
const { Socket } = require('dgram');

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = socketIo(server);

let responses = 0;
let players = [];
let scores = [];
let currentQuestionID = 0;
const questions = [
    {
        questionString: 'Ko je napisao "Seobe"?',
        correctAnswer: 2,
        answers: ['Ivo Andrić', 'Miroslav Krleža', 'Miloš Crnjanski', 'Mesha Selimovic']
    },
    {
        questionString: 'Koji je glavni grad Francuske?',
        correctAnswer: 1,
        answers: ['Berlin', 'Pariz', 'Madrid', 'Lisabon']
    },
    {
        questionString: 'Koji vitamin se najviše nalazi u narandži?',
        correctAnswer: 3,
        answers: ['Vitamin A', 'Vitamin D', 'Vitamin B', 'Vitamin C']
    },
    {
        questionString: 'Koji je najveći kontinent po površini?',
        correctAnswer: 0,
        answers: ['Azija', 'Afrika', 'Severna Amerika', 'Antarktik']
    },
    {
        questionString: 'Ko je poznat kao "Oče Nauke"?',
        correctAnswer: 0,
        answers: ['Galileo Galilei', 'Albert Einstein', 'Isaac Newton', 'Nikola Tesla']
    },
];

io.on('connection', handleConnection);
function handleConnection(socket) {
    addNewPlayer(socket);
    startGame();
    socket.on('answer', handleAnswer);
    socket.on('restart', handleRestart);
    socket.on('disconnect', handleDisconnect);
}

function handleAnswer(data) {
    if (questions[currentQuestionID].correctAnswer == data.answer) {
        scores[data.playerID]++;
        players[data.playerID].emit('checkAnswer', { answerIsCorrect: true });
    }
    else {
        scores[data.playerID]--;
        players[data.playerID].emit('checkAnswer', { answerIsCorrect: false });
    }

    responses++;
    if (responses == 2) {
        // proslediIgracimaTajmer(data, 2000);
        setTimeout(() => {
            responses = 0;  // resetujemo brojač za sledeće pitanje
            currentQuestionID++;

            if (currentQuestionID < questions.length) {
                players[0].emit('next', { playerID: 0, question: questions[currentQuestionID] });
                players[1].emit('next', { playerID: 1, question: questions[currentQuestionID] });
            } else {
                players[0].emit('end', { scores });
                players[1].emit('end', { scores });
            }
        }, 2000); // 2 seconds delay
    }
}

function handleRestart() {
    currentQuestionID = 0;
    players[0].emit('start', { playerID: 0, question: questions[currentQuestionID] });
    players[1].emit('start', { playerID: 1, question: questions[currentQuestionID] });
}

function handleDisconnect() {
    socket.on('disconnect', () => { server.close(); }); // Server se iskljucuje ako neki klijent izadje
}

function addNewPlayer(socket) {
    players.push(socket);
    scores.push(0);
}

function startGame() {
    if (players.length === 2) {
        scores = [0, 0];
        players[0].emit('start', { playerID: 0, question: questions[currentQuestionID] });
        players[1].emit('start', { playerID: 1, question: questions[currentQuestionID] });
    }
    if (players.length > 2) {
        for (let index = 2; index < players.length; index++) {
            player = players[index];
            player.emit('mesta_su_popunjena');
        }
    }
}

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
    opn('http://localhost:3000');
    opn('http://localhost:3000');
});

function proslediIgracimaTajmer(data, duration) {
    let elapsedSeconds = duration / 1000;
    let logInterval = setInterval(() => {
        players[data.playerID].emit('refreshTimer', { elapsedSeconds: elapsedSeconds });
        elapsedSeconds--;
    }, 1000);

    // Stop logging after the specified duration
    setTimeout(() => {
        clearInterval(logInterval);
    }, duration);
}

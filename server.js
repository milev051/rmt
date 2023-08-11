const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = socketIo(server);

let playerResponses = 0;
let players = [];
let playerScores = [];
let questionsAsked = 0;
const questions = [
    {
        question: 'Ko je napisao "Seobe"?',
        correctAnswer: 3,
        answers: ['Ivo Andrić', 'Miroslav Krleža', 'Miloš Crnjanski', 'Mesha Selimovic']
    },
    {
        question: 'Koji je glavni grad Francuske?',
        correctAnswer: 2,
        answers: ['Berlin', 'Pariz', 'Madrid', 'Lisabon']
    },
    {
        question: 'Koji vitamin se najviše nalazi u narandži?',
        correctAnswer: 4,
        answers: ['Vitamin A', 'Vitamin D', 'Vitamin B', 'Vitamin C']
    },
    {
        question: 'Koji je najveći kontinent po površini?',
        correctAnswer: 1,
        answers: ['Azija', 'Afrika', 'Severna Amerika', 'Antarktik']
    },
    {
        question: 'Ko je poznat kao "Oče Nauke"?',
        correctAnswer: 1,
        answers: ['Galileo Galilei', 'Albert Einstein', 'Isaac Newton', 'Nikola Tesla']
    },
];

io.on('connection', (socket) => {
    players.push(socket);
    playerScores.push(0);

    StartGame();

    socket.on('answer', (data) => {

        if (questions[data.questionID - 1].correctAnswer === data.answer) {
            playerScores[data.playerID - 1]++;
        } else {
            playerScores[data.playerID - 1]--;
        }

        playerResponses++;
        if (playerResponses == 2) {
            questionsAsked++;
            for (let index = 0; index < 2; index++) {
                player = players[index];
                player.playerID = index;

                if (data.questionID < questions.length) {
                    player.emit('next', { playerID: data.playerID, question: questions[questionsAsked] });
                } else {
                    player.emit('end', { playerID: data.playerID, score: playerScores });
                }
            }
            playerResponses = 0;  // resetujemo brojač za sledeće pitanje
        }
    });

    socket.on('restart', () => { StartGame(); });
});

function StartGame() {
    if (players.length === 2) {
        playerScores = [0, 0];
        players.forEach((player, index) => {
            player.emit('start', { playerID: index + 1, question: questions[0] });
        });
    }
    if (players.length > 2) {
        for (let index = 2; index < players.length; index++) {
            player = players[index];
            player.emit('mesta_su_popunjena');
        }
    }
}

server.listen(3000, () => { console.log('Server is listening on port 3000'); });

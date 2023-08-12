const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const opn = require('opn');


const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = socketIo(server);

let responses = 0;
let players = [];
let scores = [];
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
    AddNewPlayer(socket);
    StartGame();

    socket.on('answer', (data) => {
        if (questions[questionsAsked].correctAnswer == data.answer)
            scores[data.playerID - 1]++;
        else
            scores[data.playerID - 1]--;

        responses++;
        if (responses == 2) {
            responses = 0;  // resetujemo brojač za sledeće pitanje
            questionsAsked++;

            if (questionsAsked < questions.length) {
                players[0].emit('next', { question: questions[questionsAsked] });
                players[1].emit('next', { question: questions[questionsAsked] });
            } else {
                players[0].emit('end', { scores });
                players[1].emit('end', { scores });
            }
        }
    });

    socket.on('restart', () => {
        players[0].emit('start', { playerID: 1, question: questions[0] });
        players[1].emit('start', { playerID: 2, question: questions[0] });
    });

    socket.on('disconnect', () => { server.close(); }); // Server se iskljucuje ako neki klijent izadje
});

function AddNewPlayer(socket) {
    players.push(socket);
    scores.push(0);
}

function StartGame() {
    if (players.length === 2) {
        scores = [0, 0];
        players[0].emit('start', { playerID: 1, question: questions[0] });
        players[1].emit('start', { playerID: 2, question: questions[0] });
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



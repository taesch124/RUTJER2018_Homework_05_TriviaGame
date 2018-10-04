const gameDisplay = document.getElementById('game-display');
const startGameButton = document.getElementById('start-game');
const answerButton = document.getElementsByClassName('answer');

const correctAnswersText = document.getElementById('correct-answers');
const wrongAnswersText = document.getElementById('wrong-answers');
const unansweredQuestionsText = document.getElementById('unanswered-questions');

let questions = [];
let correctAnswers = 0,
wrongAnswers = 0,
questionsUnanswered = 0;
let gameStarted = false;



document.addEventListener("DOMContentLoaded", function() {
    // code...
    startGameButton.addEventListener('click', function() {
        if(!gameStarted) {
            loadQuestionsJson();
            gameStarted = true;
            startGameButton.disabled = true;
        }
    });


});

function loadQuestionsJson() {
    var xhr = new XMLHttpRequest();
    var url = 'https://opentdb.com/api.php?amount=10&type=multiple';

    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                questions = getQuestionsFromJson(xhr.response);
                questionsUnanswered = questions.length;
                unansweredQuestionsText.textContent = questionsUnanswered;
                startGame();
            }
            else if(xhr.status === 400) {
                console.error('failed api request');
            }
        }
    }

    
    xhr.open('GET', url);
    xhr.responseType = "text";
    xhr.send();
}

function getQuestionsFromJson(response) {
    return JSON.parse(response).results;
}

function startGame() {
    gameDisplay.innerHTML = '';
    displayQuestion(questions[0]);
    questions.splice(0,1);

    correctAnswersText.textContent = correctAnswers;
    wrongAnswersText.textContent = wrongAnswers;
}

function answerChosen(answer) {
    questionsUnanswered--;
    unansweredQuestionsText.textContent = questionsUnanswered;
    if (answer.id === 'correct-answer') {
        correctAnswers++;
        correctAnswersText.textContent = correctAnswers;
    }
    else {
        wrongAnswers++;
        wrongAnswersText.textContent = wrongAnswers;
    }

    if(questions[0]) {
        gameDisplay.innerHTML = '';
        displayQuestion(questions[0]);
        questions.splice(0,1);
    } else {
        endGame();
    }
    
}

function endGame() {
    gameDisplay.innerHTML = '<h2>Game Over!</h2>';
    gameDisplay.innerHTML += '<p> You got a score of ' + (correctAnswers/10 * 100) + '%';
    console.log('Game Over');
    gameStarted = false;
    startGameButton.disabled = false;
    correctAnswers = 0;
    wrongAnswers = 0;
}

function displayQuestion(question) {
    let questionDiv = document.createElement('div');
    questionDiv.classList.add('question');

    let questionPrompt  = document.createElement('h3');
    questionPrompt.classList.add('prompt');
    questionPrompt.textContent = question.question;
    questionDiv.appendChild(questionPrompt);

    let possibleQuestions = [];
    for (var i = 0; i <= question.incorrect_answers.length; i++) {
        if (i !== question.incorrect_answers.length) {
            possibleQuestions.push({correct: false, answer: question.incorrect_answers[i]});
        }
        else {
            possibleQuestions.push({correct: true, answer: question.correct_answer});
        }
    }

    while(possibleQuestions.length > 0) {
        let possibleAnswer = document.createElement('p');
        possibleAnswer.classList.add('answer');

        let randomIndex = Math.floor(Math.random() * possibleQuestions.length);
        let randomAnswer = possibleQuestions[randomIndex];
        if(randomAnswer.correct) {
            console.log('correct answer: ' + randomIndex);
            possibleAnswer.setAttribute('id', 'correct-answer');
        }
        possibleQuestions.splice(randomIndex, 1);

        
        possibleAnswer.textContent = randomAnswer.answer;
        possibleAnswer.addEventListener('click', () => {
            answerChosen(possibleAnswer);
        });
        questionDiv.appendChild(possibleAnswer);
    }
    
    gameDisplay.appendChild(questionDiv);
}
const gameDisplay = document.getElementById('game-display');
const startGameButton = document.getElementById('start-game');
const answerButton = document.getElementsByClassName('answer');

const scoreElement = document.getElementById('score');
const correctAnswersText = document.getElementById('correct-answers');
const wrongAnswersText = document.getElementById('wrong-answers');
const questionsUnansweredText = document.getElementById('questions-unanswered');
const questionsLeftText = document.getElementById('questions-left');

let questions = [];
let correctAnswers = 0,
wrongAnswers = 0,
questionsUnanswered = 0,
questionsRemaining = 0;
let gameStarted = false;
let questionTimer;
const questionTime = 20;
let timerDuration = questionTime;



document.addEventListener("DOMContentLoaded", function() {
    // code...
    startGameButton.addEventListener('click', function() {
        if(!gameStarted) {
            loadQuestionsJson();
            gameStarted = true;
            startGameButton.classList.add('hidden');
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
                questionsRemaining = questions.length;
                questionsLeftText.textContent = questionsRemaining;
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
    displayQuestion(questions[0]);
    questions.splice(0,1);

    score.classList.add('hidden');
    correctAnswersText.textContent = correctAnswers;
    wrongAnswersText.textContent = wrongAnswers;
}

function answerChosen(answer) {
    questionsRemaining--;
    questionsLeftText.textContent = questionsRemaining;
    if (answer.id === 'correct-answer') {
        correctAnswers++;
        correctAnswersText.textContent = correctAnswers;
    }
    else {
        wrongAnswers++;
        wrongAnswersText.textContent = wrongAnswers;
    }

    clearTimer();
    
}

function endGame() {
    let endGame = document.createElement('div');

    endGame.innerHTML = '<h2>Game Over!</h2>';
    endGame.innerHTML += '<p> You got a score of ' + (correctAnswers/10 * 100) + '%';
    gameDisplay.removeChild(document.getElementById('question-display'));
    gameDisplay.prepend(endGame);
    gameStarted = false;
    startGameButton.textContent = 'Start Over'
    startGameButton.classList.remove('hidden');
    scoreElement.classList.remove('hidden');
    correctAnswers = 0;
    wrongAnswers = 0;
}

function reduceTimer() {
    const timerText = document.getElementById('timer');
    timerDuration--;
    timerText.textContent = timerDuration;

    if(timerDuration <= 0) {
        questionsRemaining--;
        questionsLeftText.textContent = questionsRemaining;
        questionsUnanswered++;
        questionsUnansweredText.textContent = questionsUnanswered;
        clearTimer();
    }
}

function clearTimer() {
    clearInterval(questionTimer);
    getNextQuestion();
}

function getNextQuestion() {
    if(questions[0]) {
        gameDisplay.removeChild(document.getElementById('question-display'));
        displayQuestion(questions[0]);
        questions.splice(0,1);
    } else {
        endGame();
    }
}

function displayQuestion(question) {
    let questionDiv = document.createElement('div');
    questionDiv.setAttribute('id', 'question-display');

    let timer = document.createElement('p');
    timer.setAttribute('id', 'timer');
    timer.textContent = timerDuration;
    timerDuration = questionTime;
    timer.textContent = timerDuration;
    questionTimer = setInterval(reduceTimer, 1000);
    questionDiv.appendChild(timer);

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

    let correctAnswerTracker = 0;
    while(possibleQuestions.length > 0) {
        let possibleAnswer = document.createElement('p');
        possibleAnswer.classList.add('answer');

        let randomIndex = Math.floor(Math.random() * possibleQuestions.length);
        let randomAnswer = possibleQuestions[randomIndex];
        if(randomAnswer.correct) {
            console.log('correct answer: ' + correctAnswerTracker);
            possibleAnswer.setAttribute('id', 'correct-answer');
        }
        possibleQuestions.splice(randomIndex, 1);

        
        possibleAnswer.textContent = randomAnswer.answer;
        possibleAnswer.addEventListener('click', () => {
            answerChosen(possibleAnswer);
        });
        questionDiv.appendChild(possibleAnswer);
        correctAnswerTracker++;
    }
    
    gameDisplay.appendChild(questionDiv);
}
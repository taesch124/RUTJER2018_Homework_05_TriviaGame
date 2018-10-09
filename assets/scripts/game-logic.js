const gameDisplay = document.getElementById('game-display');
const parameterSelection = document.getElementById('parameter-selection');
const userCorrectDisplay = document.getElementById('user-correct');
const endGameDisplay = document.getElementById('end-game');

const startGameButton = document.getElementById('start-game');
const difficultySelector = document.getElementById('difficulty-select');
const categorySelector = document.getElementById('category-select');
const answerButton = document.getElementsByClassName('answer');

const scoreElement = document.getElementById('score');
const correctAnswersText = document.getElementById('correct-answers');
const wrongAnswersText = document.getElementById('wrong-answers');
const questionsUnansweredText = document.getElementById('questions-unanswered');

let questions = [];
let correctAnswers = 0,
wrongAnswers = 0,
questionsUnanswered = 0,
questionsRemaining = 0;
let currentCorrectAnswer;
let gameStarted = false;
let questionTimer;
const questionTime = 15;
let timerDuration = questionTime;

let sessionToken;



document.addEventListener("DOMContentLoaded", function() {
    // code...
    startGameButton.addEventListener('click', function() {
        if(!gameStarted) {
            parameterSelection.classList.add('hidden');
            endGameDisplay.classList.add('hidden');
            scoreElement.classList.add('hidden'); 
            getQeustions(difficultySelector.value, categorySelector.value);
            gameStarted = true;
        }
    });
});

function getQeustions(difficulty, category) {
    var xhr = new XMLHttpRequest();
    var url = 'https://opentdb.com/api.php?amount=10&type=multiple&difficulty=' + difficulty;

    if(category != 0) {
        url += '&category=' + category;
    }

    if(sessionToken) {
        url += '&token=' + sessionToken;
    }
    console.log(url);

    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if(!sessionToken) getSessionToken();
                questions = getQuestionsFromJson(xhr.response);
                questionsRemaining = questions.length;
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

function getSessionToken() {
    var xhr = new XMLHttpRequest();
    var url = 'https://opentdb.com/api_token.php?command=request';
    console.log(url);

    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                sessionToken = JSON.parse(xhr.response).token;
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

function loadGifJson(search) {
    var xhr = new XMLHttpRequest();
    var url = 'https://api.giphy.com/v1/gifs/random?tag=' + search + '&api_key=dc6zaTOxFJmzC';
    console.log(url);
    

    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let gif = JSON.parse(xhr.response);
                addGifToScreen(gif.data.images.original.url);
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
    clearTimer();
    if (answer.id === 'correct-answer') {
        correctAnswers++;
        correctAnswersText.textContent = correctAnswers;
        showAnswerResults(true);
    }
    else {
        wrongAnswers++;
        wrongAnswersText.textContent = wrongAnswers;
        showAnswerResults(false);
    }  
}

function showAnswerResults(isCorrect, isTimeout) {
    gameDisplay.removeChild(document.getElementById('question-display'));
    userCorrectDisplay.innerHTML = '';
    userCorrectDisplay.classList.remove('hidden');
    let message = document.createElement('h3');
    let questionsLeft = document.createElement('h5');
    questionsLeft.textContent = 'There are ' + questionsRemaining + ' questions remaining.';
    if(isCorrect) {
        message.textContent = 'Correct!';
        userCorrectDisplay.appendChild(message);
        userCorrectDisplay.appendChild(questionsLeft);
        loadGifJson('good+job');
    } else {
        if(isTimeout) {
            message.textContent = 'Sorry, you ran out of time! The correct answer was ' + currentCorrectAnswer + '.';
            userCorrectDisplay.appendChild(message);
            userCorrectDisplay.appendChild(questionsLeft);
            loadGifJson('times+up');
        } else {
            message.textContent = 'Sorry, the correct answer was ' + currentCorrectAnswer + '.';
            userCorrectDisplay.appendChild(message);
            userCorrectDisplay.appendChild(questionsLeft);
            loadGifJson('better+luck+next+time');
        }
        
    }

    setTimeout(function() {
        userCorrectDisplay.classList.add('hidden');
        getNextQuestion();
    }, 5 * 1000);
}

function addGifToScreen(gifUrl) {
    let gif = document.createElement('img');
    gif.setAttribute('src', gifUrl);
    userCorrectDisplay.appendChild(gif);
}

function endGame() {
    endGameDisplay.classList.remove('hidden');

    endGameDisplay.innerHTML = '<h2>Game Over!</h2>';
    endGameDisplay.innerHTML += '<p> You got a score of ' + (correctAnswers/10 * 100) + '%';
    gameStarted = false;
    startGameButton.textContent = 'Start Over'
    parameterSelection.classList.remove('hidden');
    scoreElement.classList.remove('hidden');``
    correctAnswers = 0;
    wrongAnswers = 0;
}

function reduceTimer() {
    timerDuration--;
    const timerText = document.getElementById('timer');
    timerText.textContent = timerDuration;

    if(timerDuration <= 0) {
        questionsRemaining--;
        questionsUnanswered++;
        questionsUnansweredText.textContent = questionsUnanswered;
        clearTimer();
        showAnswerResults(false, true);
    }
}

function clearTimer() {
    clearInterval(questionTimer);
}

function getNextQuestion() {
    if(questions[0]) {
        displayQuestion(questions[0]);
        questions.splice(0,1);
    } else {
        endGame();
    }
}

function displayQuestion(question) {
    let decoder = document.createElement('textarea');

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
    decoder.innerHTML = question.question;
    questionPrompt.textContent = decoder.value;
    questionDiv.appendChild(questionPrompt);

    let possibleQuestions = [];
    for (var i = 0; i <= question.incorrect_answers.length; i++) {
        if (i !== question.incorrect_answers.length) {
            possibleQuestions.push({correct: false, answer: question.incorrect_answers[i]});
        }
        else {
            possibleQuestions.push({correct: true, answer: question.correct_answer});
            currentCorrectAnswer = question.correct_answer;
        }
    }

    let correctAnswerTracker = 0;
    while(possibleQuestions.length > 0) {
        let possibleAnswer = document.createElement('p');
        possibleAnswer.classList.add('answer');

        let randomIndex = Math.floor(Math.random() * possibleQuestions.length);
        let randomAnswer = possibleQuestions[randomIndex];
        if(randomAnswer.correct) {
            possibleAnswer.setAttribute('id', 'correct-answer');
        }
        possibleQuestions.splice(randomIndex, 1);

        decoder.innerHTML = randomAnswer.answer;
        possibleAnswer.textContent = decoder.value;
        possibleAnswer.addEventListener('click', () => {
            answerChosen(possibleAnswer);
        });
        questionDiv.appendChild(possibleAnswer);
        correctAnswerTracker++;
    }
    
    gameDisplay.appendChild(questionDiv);
}
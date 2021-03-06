import $ from 'jquery';
import './css/base.scss';

import Game from './Game';
import Clue from './Clue';
import domUpdates from './domUpdates.js';


fetch('https://fe-apps.herokuapp.com/api/v1/gametime/1903/jeopardy/data')
  .then(response => response.json())
  .then(parsedData => getData(parsedData))
  .catch(err => console.error(err));

let answer;
let boards;
let game;
let wager;

function getData(info) {
  let clue = new Clue(info);
  boards = clue.makeBoardObject();
};

function checkAnswer(location) {
  let correct = game.currentRound.evaluateGuess($(`${location}`).val());
  if (location === '#player-guess__input') {
    correct ? game.currentRound.updateScores(parseInt(wager)) : game.currentRound.updateScores(-(parseInt(wager)));
  } else {
    correct ? game.currentRound.updateScores(parseInt(answer[0])) : game.currentRound.updateScores(-(parseInt(answer[0]))); 
  };

  if (correct) {
    $('.correct-answer__display').show();;
    new Audio('http://www.nebo.edu/learning_resources/ppt/sounds/Applause.wav').play();
  } else {
    $('.incorrect-answer__display').show();
    new Audio('http://www.nebo.edu/learning_resources/ppt/sounds/wrongway.wav').play();
  };
};

$(document).ready(() => {
  domUpdates.pageLoadHandler();
  domUpdates.disableUserInputButton();
  
  $('#players-name__submit').click(() => {
    let playerNames = [$('#player1-name__input').val(), $('#player2-name__input').val(), $('#player3-name__input').val()];
    game = new Game(boards);
    game.startGame(playerNames);
    $('#user-name__inputs').fadeOut();
    $('#main-scorecard__display').delay(1000).fadeIn();
    $('#puzzle-table__display').delay(1000).fadeIn();
    domUpdates.disableCategories();
  });

  $('#main-board__display').click((e) => {
    new Audio("http://soundbible.com/grab.php?id=1891&type=mp3").play();
    let clickedItem = e.target.id;
    let dataIndex = e.target.getAttribute('data-index');
    

    if (game.roundTracker === 1 && game.currentRound.turnTracker === game.currentRound.dailyDoubleTurns[0]) {
      domUpdates.dailyDoubleTurnActions(clickedItem);
      $('#daily-double-wager__display__name-span').text(game.players[game.currentRound.currentPlayer].name);
      answer = game.currentRound.takeTurn(dataIndex);
      return;
    } ;
    if (game.roundTracker === 2 && game.currentRound.turnTracker === game.currentRound.dailyDoubleTurns[1] ) {

      domUpdates.dailyDoubleTurnActions(clickedItem);
      $('#daily-double-wager__display__name-span').text(game.players[game.currentRound.currentPlayer].name)
      answer = game.currentRound.takeTurn(dataIndex);
      return;
    }; 
    if (game.roundTracker === 2 && game.currentRound.turnTracker === game.currentRound.dailyDoubleTurns[2]) {
      domUpdates.dailyDoubleTurnActions(clickedItem);;
      $('#daily-double-wager__display__name-span').text(game.players[game.currentRound.currentPlayer].name)
      answer = game.currentRound.takeTurn(dataIndex);
      return
    } else {
      domUpdates.normalTurnActions(clickedItem);
      $('#daily-double-wager__display__name-span').text(game.players[game.currentRound.currentPlayer].name)
      answer = game.currentRound.takeTurn(dataIndex);
      return
    };
  });

  $('#submit-button__wager').click(() => {
    wager = $('#player-wager__input').val();
    if (!game.currentRound.checkPlayerWager(wager)) {
      domUpdates.disableGuessInputButton();
      $('.player-wager__input').val('');
      $('#daily-double-wager__display').text('Your wager is more than your current score! Please enter a new wager.');
    } else {
      $('.player-wager__input').val('');
      domUpdates.wagerSubmit();
    };  
  });

  $('#submit-button__guess').click(() => {
    checkAnswer('#player-guess__input');
    if (game.currentRound.turnTracker === 17) {
      $('.column-row__display').removeAttr('style');
      game.generateRound();
    };
    domUpdates.updateQuestionDisplay(answer[0]);
    domUpdates.dailyDoubleSubmitGuessActions()
    domUpdates.highlightCurrentPlayer(game.currentRound.currentPlayer)
  });

  $('#submit-button').click(() => {
    checkAnswer('#current-answer__input');
    
    if (game.currentRound.turnTracker === 17) {
      $('.column-row__display').removeAttr('style')
      game.generateRound()
    };
    domUpdates.updateQuestionDisplay(answer[0]);
    domUpdates.normalSubmitGuessActions();
    domUpdates.highlightCurrentPlayer(game.currentRound.currentPlayer);
  });

  $('#current-answer__input').keyup(() => {
    if ($( '#current-answer__input' ).val() !== '') {
      domUpdates.enableGuessInputButton();
    } else {
      domUpdates.disableGuessInputButton();
    };
  });

  $('.player-input').keyup(() => {
    if ($( '#player1-name__input' ).val() !== '' && $( '#player2-name__input' ).val() !== '' && $( '#player3-name__input' ).val() !== '') {
      domUpdates.enableUserInputButton();
    } else {
      domUpdates.disableUserInputButton();
    };
  });

  $('#submit-button-final__wager1').click(() => {
    domUpdates.finalWagerSubmit(1, 2);
    game.currentRound.takeGuess(game.currentRound.currentPlayer);
    game.currentRound.changePlayer();
  });

  $('#submit-button-final__wager2').click(() => {
    domUpdates.finalWagerSubmit(2, 3);
    game.currentRound.takeGuess(game.currentRound.currentPlayer);
    game.currentRound.changePlayer();
  });

  $('#submit-button-final__wager3').click(() => {
    domUpdates.finalWagerSubmit(3, 0);
    game.currentRound.takeGuess(game.currentRound.currentPlayer);
    game.currentRound.changePlayer();
    domUpdates.finalGuessSubmit(1, 2);
  });

  $('#submit-button-final__guess1').click(() => {
    domUpdates.finalGuessSubmit(1, 2);
    game.currentRound.takeGuess(game.currentRound.currentPlayer);
    game.currentRound.changePlayer();
  });

  $('#submit-button-final__guess2').click(() => {
    domUpdates.finalGuessSubmit(2, 3);
    game.currentRound.takeGuess(game.currentRound.currentPlayer);
    game.currentRound.changePlayer();
  });

  $('#submit-button-final__guess3').click(() => {
    game.game.currentRound.endGame();
    domUpdates.finalGuessSubmit(3, 0);
    game.game.currentRound.takeGuess(game.currentRound.currentPlayer);
    domUpdates.finalGuessSubmit(3, 0);
  });

  $('.reset-game-button__container').click(() => {
    document.location.reload();
  });
});


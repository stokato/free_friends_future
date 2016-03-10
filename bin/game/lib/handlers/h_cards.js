function() { //  арты, ждем, кода все ответ€т, потом показываем всем их ответы и где золото
  if(countActions == 0) {
    var options = {picks : []};
    for (var i = 0; i < currPlayers.length; i++) {
      var id = currPlayers[i].getID();
      var answer = actionsQueue[id];
      if(!validator.isNumeric(answer[0] || answer < 0 || answer > 9 ))  {
        self.stop();
        return new GameError(gSocket, 'GAMECARDS', "Ќеверные агрументы");
      }
      options.picks.push({ id : id, pick : answer });
    }
    options.gold = randomInteger(0, CARD_COUNT-1);

    self.emit(options);

    nextGame = 'start';
    currPlayers = [];
    pushAllPlayers(gRoom, currPlayers);
    actionsQueue = {};
    countActions = PLAYERS_COUNT;
    currTimer = startTimer(handlers[nextGame], countActions);
  }
}
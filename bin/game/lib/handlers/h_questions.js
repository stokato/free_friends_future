function() { // ¬опросы, ждем, когда все ответ€т, потом показываем всем ответы
  if(countActions == 0) {
    var options = { answers : [] };
    for (var i = 0; i < currPlayers.length; i++) {
      var id = currPlayers[i].getID();
      var answer = actionsQueue[id];
      if(answer[0].pick != '1' || answer[0].pick != '2' || answer[0].pick != '3')  {
        self.stop();
        return new GameError(gSocket, 'GAMEQUESTIONS', "Ќеверные агрументы");
      }
      options.answers.push({ id : id, pick : answer[0] });
    }
    self.emit(options);

    nextGame = 'start';
    currPlayers = [];
    actionsQueue = {};
    pushAllPlayers(gRoom, currPlayers);
    countActions = PLAYERS_COUNT;
    currTimer = startTimer(handlers[nextGame], countActions);
  }
}
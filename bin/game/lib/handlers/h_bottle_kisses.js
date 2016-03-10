function(id, opt) { // Бутылочка поцелуи, сообщаем всем выбор пары
  if(!validator.isBoolean(opt.kiss)) {
    self.stop();
    new GameError(gSocket, 'GAMEBOTTLE', "Неверные агрументы");
  }
  var options = {};
  options['kiss'] = { id : id, pick : opt.kiss};
  self.emit(options);

  if(countActions == 0) {
    nextGame = 'start';
    actionsQueue = {};
    currPlayers = [];
    pushAllPlayers(gRoom, currPlayers);

    countActions = PLAYERS_COUNT;
    currTimer = startTimer(handlers[nextGame], countActions);
  }
}
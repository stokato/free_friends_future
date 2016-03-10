function(id, opt) { // ������, �������� ���� �� �����
  var options = {};
  if(!gRoom.guys(opt.pick) && !gRoom.girls(opt.pick)) {
    self.stop();
    return new GameError(gSocket, 'GAMEBEST', "�������� ���������");
  }
  options['pick'] = { id : id, pick : opt.pick};
  self.emit(options);

  if(countActions == 0) {

    nextGame = 'start';
    currPlayers = [];
    pushAllPlayers(gRoom, currPlayers);
    actionsQueue = {};
    countActions = PLAYERS_COUNT;
    currTimer = startTimer(handlers[nextGame], countActions);
  }
}
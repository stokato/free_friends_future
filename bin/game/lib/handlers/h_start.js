var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer');
// ��������� ���� � �������, ��� ������ ������ ������� �����, ����� ����
// �������� ����������� ������ �� ��� � ��������� � �������� ������
module.exports = function(game) {
  return function() {
    if (game.countActions == 0) {
      clearTimeout(game.currTimer);
      var player = randomPlayer(game.gRoom, null);
      game.currPlayers = [];
      game.currPlayers.push(player);
      game.actionsQueue = {};

      game.countActions = 1;
      game.nextGame = 'lot';

      var options = {players: getPlayersID(game.currPlayers)};
      game.emit(options);
      game.currTimer = startTimer(game.handlers[game.nextGame], game.countActions);
    }
  }
};
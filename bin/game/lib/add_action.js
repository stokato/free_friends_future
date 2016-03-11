
// Добавить ход игрока в очередь для обработки
module.exports = function (game) {
  game.gSocket.on('action', function(options) {
    var profile = game.userList[game.gSocket.id];
    if(game.currPlayers[profile.getID()]) {
      if(!game.actionsQueue[profile.getID()]) {
        game.actionsQueue[profile.getID()] = [];
      }
      game.actionsQueue[profile.getID()].push(options);
      game.countActions--;
      game.handlers[game.nextGame](false, profile.getID(), options);
    }
  });
};
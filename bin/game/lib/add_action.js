var checkInput = require('./../../check_input');
var constants_io = require('../../io/constants');
var constants = require('../constants');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, userList) {
  socket.on(constants_io.IO_GAME, function(options) {
    var f = constants_io.FIELDS;
    var selfProfile = userList[socket.id];
    var uid = selfProfile.getID(),
        game = selfProfile.getGame();

    // Если этому пользователю можно ходить, и он еще не превысил лимит ходов
    if(game.gActivePlayers[uid] && game.gActionsLimits[uid] > 0) {

      if (!checkInput(game.gNextGame, socket, userList, options)) {

        //game.stop();
        //return socket.broadcast.in(game.gRoom.name).emit(constants_io.IO_ERROR,
        //  {message: "Игра остановлена всвязи с ошибкой"});
        return;
      }

      if(!game.gActionsQueue[uid]) {
        game.gActionsQueue[uid] = [];
      }

      // В игре Симпатии нельзя выбрать несколько раз одного и того же игрока
      if(game.gNextGame != constants.G_SYMPATHY || game.gNextGame != constants.G_SYMPATHY_SHOW) {
         var i, actions = game.gActionsQueue[uid];

         for( i = 0; i < actions.length; i++) {
           if(actions[i][f.pick] == options[f.pick]) { return; }
         }
      }

      // Уменьшаем счетчики ходов одного игрока и всех в текущем раунде
      game.gActionsLimits[uid] --;

      game.gActionsQueue[uid].push(options);
      game.gActionsCount--;

      // Вызваем обработчик текущей игры
      game.gHandlers[game.gNextGame](false, uid, options);
    }
  });
};
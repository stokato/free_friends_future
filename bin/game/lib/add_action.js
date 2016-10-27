var constants = require('../../constants');

var oPool = require('./../../objects_pool');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  var uid = selfProfile.getID();
  var game = selfProfile.getGame();
  
  // Если этому пользователю можно ходить, и он еще не превысил лимит ходов
  if(game.gActivePlayers[uid] && game.gActionsLimits[uid] > 0) {
    
    // Если нет такого пользоателя среди кандидатов
    if(game.gNextGame == constants.G_BEST && !game.gStoredOptions[options.pick]) {
      return callback(constants.errors.NO_THAT_PLAYER);
    }
    
    // В игре симпатии нельзя указать себя
    if(game.gNextGame == constants.G_SYMPATHY && uid == options.pick) {
      return callback(constants.errors.SELF_ILLEGAL);
    }
    if(game.gNextGame == constants.G_SYMPATHY_SHOW && uid == options.pick) {
      return callback(constants.errors.SELF_ILLEGAL);
    }
    
    if(!game.gActionsQueue[uid]) {
      game.gActionsQueue[uid] = [];
    }
    
    // В игре Симпатии нельзя выбрать несколько раз одного и того же игрока
    // И выбрать того, кого нет
    if(game.gNextGame == constants.G_SYMPATHY || game.gNextGame == constants.G_SYMPATHY_SHOW) {
      if(!game.gActivePlayers[options.pick]) {
        return callback(new Error("В игре Симпатии нельзя выбрать несколько раз одного и того же игрока"));
      }
      
      var actions = game.gActionsQueue[uid];
      
      for( var i = 0; i < actions.length; i++) {
        if(actions[i].pick == options.pick) {
          return callback(new Error("В игре Симпатии нельзя выбрать того, кого нет среди игроков"));
        }
      }
    }
    
    // Уменьшаем счетчики ходов одного игрока и всех в текущем раунде
    game.gActionsLimits[uid] --;
    
    game.gActionsQueue[uid].push(options);
    game.gActionsCount--;
    
    // Вызваем обработчик текущей игры
    game.gHandlers[game.gNextGame](false, uid, options);
  
    callback(null, null);
  }
};
var constants = require('../../constants');

var oPool = require('./../../objects_pool');

// Добавить ход игрока в очередь для обработки
module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  var uid = selfProfile.getID();
  var game = selfProfile.getGame();
  
  // Если этому пользователю можно ходить, и он еще не превысил лимит ходов
  if(game._activePlayers[uid] && game._actionsLimits[uid] > 0) {
    
    // Если нет такого пользоателя среди кандидатов
    if(game._nextGame == constants.G_BEST && !game._storedOptions[options.pick]) {
      return callback(constants.errors.NO_THAT_PLAYER);
    }
    
    // В игре симпатии нельзя указать себя
    if(game._nextGame == constants.G_SYMPATHY && uid == options.pick) {
      return callback(constants.errors.SELF_ILLEGAL);
    }
    if(game._nextGame == constants.G_SYMPATHY_SHOW && uid == options.pick) {
      return callback(constants.errors.SELF_ILLEGAL);
    }
    
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
    
    // В игре Симпатии нельзя выбрать несколько раз одного и того же игрока
    // И выбрать того, кого нет
    if(game._nextGame == constants.G_SYMPATHY || game._nextGame == constants.G_SYMPATHY_SHOW) {
      if(!game._activePlayers[options.pick]) {
        return callback(constants.errors.IS_ALREADY_SELECTED);
      }
      
      var actions = game._actionsQueue[uid];
      
      for( var i = 0; i < actions.length; i++) {
        if(actions[i].pick == options.pick) {
          return callback(constants.errors.FORBIDDEN_CHOICE);
        }
      }
    }
    
    // Уменьшаем счетчики ходов одного игрока и всех в текущем раунде
    game._actionsLimits[uid] --;
    
    game._actionsQueue[uid].push(options);
    game._actionsCount--;
    
    // Вызваем обработчик текущей игры
    game._handlers[game._nextGame](false, uid, options);
  
    callback(null, null);
  }
};
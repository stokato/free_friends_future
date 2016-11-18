var constants = require('../../constants');

var oPool = require('./../../objects_pool');

// Освободить игрока из темницы
module.exports = function (socket, options, callback) {

    var selfProfile = oPool.userList[socket.id];
    var game = selfProfile.getGame();
    var prisonerInfo = game.getPrisonerInfo();

    // Если среди заблокированных игроков такого нет, выдаем ошибку
    if(!prisonerInfo) {
      return callback(constants.errors.NOT_IN_PRISON);
    }

    if(selfProfile.getID() == prisonerInfo.id) {
      return callback(constants.errors.SELF_ILLEGAL);
    }
    
    selfProfile.pay(constants.RANSOM_PRICE, function (err, money) {
      if(err) { return callback(err); }
      
      socket.emit(constants.IO_GET_MONEY, { money : money });
  
      // Снимаем блокировку
      game.clearPrison();
      
      // Разрешаем пользователю играть в текущем раунде
      if(game._nextGame == constants.G_SYMPATHY ||
          game._nextGame == constants.G_SYMPATHY_SHOW ||
          game._nextGame == constants.G_BEST ||
          game._nextGame == constants.G_QUESTIONS ||
          game._nextGame == constants.G_CARDS) {
  
        game._activePlayers[prisonerInfo.id] = prisonerInfo;
      }
  
      var result = {
        id  : prisonerInfo.id,
        vid : prisonerInfo.vid
      };
  
      // Оповещаем игроков в комнате
      socket.broadcast.in(game._room.getName()).emit(constants.IO_RELEASE_PLAYER, result);
  
      callback(null, result);
    });
};
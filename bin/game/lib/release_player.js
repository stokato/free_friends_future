var constants = require('../../constants');

var oPool = require('./../../objects_pool');

var payService = require('./../../io/lib/common/pay_service');

// Освободить игрока из темницы
module.exports = function (socket, options, callback) {

    var selfProfile = oPool.userList[socket.id];
    var game = selfProfile.getGame();
    var prisonerInfo = game.getPrisonerInfo();

    // Если серди заблокированных игроков такого нет, выдаем ошибку
    if(!prisonerInfo) {
      return callback(constants.errors.NOT_IN_PRISON);
    }

    if(selfProfile.getID() == prisonerInfo.id) {
      return callback(constants.errors.SELF_ILLEGAL);
    }
    
    payService(selfProfile, constants.RANSOM_PRICE, function (err) {
      if(err) { return callback(err); }
  
      // Снимаем блокировку
      game.clearPrison();
  
      var result = {
        id  : prisonerInfo.id,
        vid : prisonerInfo.vid
      };
  
      // Оповещаем игроков в комнате
      socket.broadcast.in(game.gRoom.name).emit(constants.IO_RELEASE_PLAYER, result);
  
      callback(null, result);
    });

    // // Проверяем - хватает ли монет у того, кто выкупает
    // selfProfile.getMoney(function(err, money) {
    //   if(err) { return callback(err); }
    //
    //   var newMoney = money - constants.RANSOM_PRICE;
    //
    //   if(newMoney < 0) {
    //     return callback(constants.errors.TOO_LITTLE_MONEY);
    //   }
    //
    //   // Снимаем монеты
    //   selfProfile.setMoney(newMoney, function(err, money) {
    //     if(err) { return callback(err); }
    //
    //     // Снимаем блокировку
    //     game.clearPrison();
    //
    //     var result = {
    //       id  : prisonerInfo.id,
    //       vid : prisonerInfo.vid
    //     };
    //
    //     // Оповещаем игроков в комнате
    //     socket.broadcast.in(game.gRoom.name).emit(constants.IO_RELEASE_PLAYER, result);
    //
    //     // Оповещаем об изменившемся счете
    //     socket.emit(constants.IO_GET_MONEY, { money : money });
    //
    //     callback(null, result);
    //   });
    // });
  
};
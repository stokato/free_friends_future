/**
 * Выкупаем игрока из тюрьмы и сообщаем об этом в комнату
 *
 * @param socket, options, callback
 */

const Config      = require('./../../../../config.json');
const constants   = require('../../../constants');
const oPool       = require('./../../../objects_pool');

const PF            = constants.PFIELDS;
const WASTE_POINTS  = Number(Config.points.waste);
const RANSOM_PRICE  = Number(Config.moneys.sympathy_price);

// Освободить игрока из темницы
module.exports = function (socket, options, callback) {
  
  let selfProfile = oPool.userList[socket.id];
  let game = selfProfile.getGame();
  let prisonerInfo = game.getPrisonerInfo();
  
  // Если среди заблокированных игроков такого нет, выдаем ошибку
  if(!prisonerInfo) {
    return callback(constants.errors.NOT_IN_PRISON);
  }
  
  // Себя выкупить нельзя
  if(selfProfile.getID() == prisonerInfo.id) {
    return callback(constants.errors.SELF_ILLEGAL);
  }
  
  // Снимаем с пользователя монеты
  selfProfile.pay(RANSOM_PRICE, function (err, money) {
    if(err) { return callback(err); }
      
    selfProfile.addPoints(WASTE_POINTS * RANSOM_PRICE, function (err, points) {
      if(err) { return callback(err);  }
  
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
  
      let ranks = game._room.getRanks();
      ranks.addRankBall(constants.RANKS.RELEASER, selfProfile.getID());
  
      let result = {
        [PF.ID]   : prisonerInfo.id,
        [PF.VID]  : prisonerInfo.vid,
        [PF.FID]  : selfProfile.getID(),
        [PF.FVID] : selfProfile.getVID()
      };
  
      // Оповещаем игроков в комнате
      socket.broadcast.in(game._room.getName()).emit(constants.IO_RELEASE_PLAYER, result);
      callback(null, result);
    });
    
  });
};
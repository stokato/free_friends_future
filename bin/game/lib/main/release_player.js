/**
 * Выкупаем игрока из тюрьмы и сообщаем об этом в комнату
 *
 * @param socket, options, callback
 */

var Config        = require('./../../../../config.json');
var RANSOM_PRICE = Number(Config.moneys.sympathy_price);

var constants = require('../../../constants'),
    PF = constants.PFIELDS;

var oPool = require('./../../../objects_pool');

// Освободить игрока из темницы
module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  var game = selfProfile.getGame();
  var prisonerInfo = game.getPrisonerInfo();
  
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
    
    var res = {};
    res[PF.MONEY] = money;
    
    socket.emit(constants.IO_GET_MONEY, res);
    
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
    
    var result = {};
    result[PF.ID] = prisonerInfo.id;
    result[PF.VID] = prisonerInfo.vid;
    result[PF.FID] = selfProfile.getID();
    result[PF.FVID] = selfProfile.getVID();
    
    // Оповещаем игроков в комнате
    socket.broadcast.in(game._room.getName()).emit(constants.IO_RELEASE_PLAYER, result);
    callback(null, result);
  });
};
/**
 * Выкупаем игрока из тюрьмы и сообщаем об этом в комнату
 *
 * @param socket, options, callback
 */
const async = require('async');

const Config      = require('./../../../config.json');
const constants   = require('../../constants');
const oPool       = require('./../../objects_pool');

const checkID     = require('./../../check_id');
const emitRes     = require('./../../emit_result');
const sanitize    = require('./../../sanitize');

const PF            = constants.PFIELDS;
const WASTE_POINTS  = Number(Config.points.waste);
const RANSOM_PRICE  = Number(Config.moneys.sympathy_price);

// Освободить игрока из темницы
module.exports = function (socket, options) {
  if(!checkID(options[PF.ID])) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_RELEASE_PLAYER);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  let game = selfProfile.getGame();
  let prisonerInfo = game.getPrisonerInfo();
  
  // Если среди заблокированных игроков такого нет, выдаем ошибку
  if(!prisonerInfo) {
    return emitRes(constants.errors.NOT_IN_PRISON, socket, constants.IO_RELEASE_PLAYER);
  }
  
  // Себя выкупить нельзя
  if(selfProfile.getID() == prisonerInfo.id) {
    return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_RELEASE_PLAYER);
  }
  
  async.waterfall([ //--------------------------------------------
    function (cb) {
      selfProfile.pay(RANSOM_PRICE, function (err, money) {
        if(err) { return cb(err); }
        
        cb(null, null);
      });
    }, //--------------------------------------------
    function (res, cb) {
      selfProfile.addPoints(WASTE_POINTS * RANSOM_PRICE, function (err, points) {
        if(err) { return cb(err);  }
    
        // Снимаем блокировку
        game.clearPrison();
    
        // Разрешаем пользователю играть в текущем раунде
        let nextGame = game.getNextGame();
        if(nextGame == constants.G_SYMPATHY ||
          nextGame == constants.G_SYMPATHY_SHOW ||
          nextGame == constants.G_BEST ||
          nextGame == constants.G_QUESTIONS ||
          nextGame == constants.G_CARDS) {
      
          game.setActivePlayer(prisonerInfo.id, prisonerInfo)
        }
    
        // Добавляем баллов
        let ranks = game.getRoom().getRanks();
        ranks.addRankBall(constants.RANKS.RELEASER, selfProfile.getID());
        
        cb(null, null);
      });
    } //--------------------------------------------
  ], function (err) {
    if(err) { return emitRes(err, socket, constants.IO_RELEASE_PLAYER);}
  
    // Оповещаем игроков в комнате
    let result = {
      [PF.ID]   : prisonerInfo.id,
      [PF.VID]  : prisonerInfo.vid,
      [PF.FID]  : selfProfile.getID(),
      [PF.FVID] : selfProfile.getVID()
    };
    
    socket.broadcast.in(game._room.getName()).emit(constants.IO_RELEASE_PLAYER, result);
    emitRes(null, socket, constants.IO_RELEASE_PLAYER, result);
  });
};
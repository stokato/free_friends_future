/**
 * Выкупаем игрока из тюрьмы и сообщаем об этом в комнату
 *
 * @param socket, options, callback
 */
const async = require('async');

const Config      = require('./../../../config.json');
const oPool       = require('./../../objects_pool');

const checkID     = require('./../../check_id');
const emitRes     = require('./../../emit_result');
const sanitize    = require('./../../sanitize');

const PF            = require('../../const_fields');
const WASTE_POINTS  = Number(Config.points.waste);
const RANSOM_PRICE  = Number(Config.moneys.sympathy_price);
const IO_RELEASE_PLAYER = Config.io.emits.IO_RELEASE_PLAYER;

// Освободить игрока из темницы
module.exports = function (socket, options) {
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_RELEASE_PLAYER);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  let game = selfProfile.getGame();
  let prisonerInfo = game.getPrisonerInfo();
  
  // Если среди заблокированных игроков такого нет, выдаем ошибку
  if(!prisonerInfo) {
    return emitRes(Config.errors.NOT_IN_PRISON, socket, IO_RELEASE_PLAYER);
  }
  
  // Себя выкупить нельзя
  if(selfProfile.getID() == prisonerInfo.id) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_RELEASE_PLAYER);
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
        if(nextGame == game.CONST.G_SYMPATHY ||
          nextGame == game.CONST.G_SYMPATHY_SHOW ||
          nextGame == game.CONST.G_BEST ||
          nextGame == game.CONST.G_QUESTIONS ||
          nextGame == game.CONST.G_CARDS) {
      
          game.setActivePlayer(prisonerInfo.id, prisonerInfo)
        }
    
        // Добавляем баллов
        let ranks = game.getRoom().getRanks();
        ranks.addRankBall(RELEASER_RANK, selfProfile.getID());
        
        cb(null, null);
      });
    } //--------------------------------------------
  ], function (err) {
    if(err) { return emitRes(err, socket, IO_RELEASE_PLAYER);}
  
    // Оповещаем игроков в комнате
    let result = {
      [PF.ID]   : prisonerInfo.id,
      [PF.VID]  : prisonerInfo.vid,
      [PF.FID]  : selfProfile.getID(),
      [PF.FVID] : selfProfile.getVID()
    };
    
    socket.broadcast.in(game._room.getName()).emit(IO_RELEASE_PLAYER, result);
    emitRes(null, socket, IO_RELEASE_PLAYER, result);
  });
};
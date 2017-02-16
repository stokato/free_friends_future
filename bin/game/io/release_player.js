/**
 * Выкупаем игрока из тюрьмы и сообщаем об этом в комнату
 *
 * @param socket, options, callback
 */
const async = require('async');

const Config      = require('./../../../config.json');
const PF            = require('../../const_fields');
const oPool       = require('./../../objects_pool');

const checkID     = require('./../../check_id');
const emitRes     = require('./../../emit_result');
const sanitize    = require('./../../sanitize');

// Освободить игрока из темницы
module.exports = function (socket, options) {
  
  const WASTE_POINTS  = Number(Config.points.waste);
  const RANSOM_PRICE  = Number(Config.moneys.sympathy_price);
  const RELEASER_RANK = Config.ranks.releaser.name;
  const IO_RELEASE_PLAYER = Config.io.emits.IO_RELEASE_PLAYER;
  
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_RELEASE_PLAYER);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  selfProfile.setActivity();
  
  let game = selfProfile.getGame();
  let prisonerInfoObj = game.getPrisonerInfo();
  
  // Если среди заблокированных игроков такого нет, выдаем ошибку
  if(!prisonerInfoObj) {
    return emitRes(Config.errors.NOT_IN_PRISON, socket, IO_RELEASE_PLAYER);
  }
  
  // Себя выкупить нельзя
  if(selfProfile.getID() == prisonerInfoObj.id) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_RELEASE_PLAYER);
  }
  
  async.waterfall([ //--------------------------------------------
    // Снимаем монеты
    function (cb) {
      selfProfile.pay(RANSOM_PRICE, (err, money) => {
        if(err) { return cb(err); }
        
        cb(null, null);
      });
    }, //--------------------------------------------
    // Добавляем освободившему очки и очищаем темницу
    function (res, cb) {
      let points = Math.round(WASTE_POINTS * RANSOM_PRICE);
      selfProfile.addPoints(points, (err, points) => {
        if(err) {
          return cb(err);
        }
    
        // Снимаем блокировку
        game.clearPrison();
    
        // Разрешаем пользователю играть в текущем раунде
        let nextGame = game.getNextGame();
        if(nextGame == game.CONST.G_SYMPATHY ||
          nextGame == game.CONST.G_SYMPATHY_SHOW ||
          nextGame == game.CONST.G_BEST ||
          nextGame == game.CONST.G_QUESTIONS ||
          nextGame == game.CONST.G_CARDS) {
      
          game.setActivePlayer(prisonerInfoObj.id, prisonerInfoObj)
        }
    
        // Добавляем баллы
        let ranksCtrlr = game.getRoom().getRanks();
        ranksCtrlr.addRankBall(RELEASER_RANK, selfProfile.getID());
        
        cb(null, null);
      });
    } //--------------------------------------------
    // Оповещаем игроков в комнате
  ], function (err) {
    if(err) { return emitRes(err, socket, IO_RELEASE_PLAYER);}
  

    let resultObj = {
      [PF.ID]   : prisonerInfoObj.id,
      [PF.VID]  : prisonerInfoObj.vid,
      [PF.FID]  : selfProfile.getID(),
      [PF.FVID] : selfProfile.getVID()
    };
    
    socket.broadcast.in(game._room.getName()).emit(IO_RELEASE_PLAYER, resultObj);
    emitRes(null, socket, IO_RELEASE_PLAYER, resultObj);
  });
};
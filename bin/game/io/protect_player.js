/**
 * Created by s.t.o.k.a.t.o on 16.01.2017.
 *
 * Устанавливаем защиту игрока от попадания в темницу
 */
const async = require('async');

const Config      = require('./../../../config.json');
const PF          = require('../../const_fields');
const oPool       = require('./../../objects_pool');

const checkID     = require('./../../check_id');
const emitRes     = require('./../../emit_result');
const sanitize    = require('./../../sanitize');

// Освободить игрока из темницы
module.exports = function (socket, options) {
  
  const RELEASER_RANK           = Config.ranks.releaser.name;
  const IO_PRISON_PROTECT       = Config.io.emits.IO_PRISON_PROTECT;
  const COUNT_PROTECTED_ROUNDS  = Config.game.count_protected_rounds;
  
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_PRISON_PROTECT);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  let ranksCtrlr  = oPool.roomList[socket.id].getRanks();
  
  let game = selfProfile.getGame();
  let playersArr = game.getRoom().getAllPlayers();
  
  // Себя защитить нельзя
  if(selfProfile.getID() == options[PF.ID]) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_PRISON_PROTECT);
  }
  
  if(!ranksCtrlr.takeBonus(RELEASER_RANK, selfProfile.getID())) {
    // return emitRes(cFields.errors.NO_SUCH_BONUS, socket, cFields.IO_PRISON_PROTECT);
  }
  
  async.waterfall([
    // Устанавливаем защиту
    function (cb) {
      let playersCount = playersArr.length;
      for(let i = 0; i < playersCount; i++) {
        if(playersArr[i].getID() == options[PF.ID]) {
          
          if(game.getPrisonerInfo() && game.getPrisonerInfo().id == options[PF.ID]) {
            return cb(Config.errors.NO_THAT_PLAYER);
          }
          
          game.setProtection(options[PF.ID], {
            protected : game.getPlayerInfo(playersArr[i]),
            protector : game.getPlayerInfo(selfProfile),
            rounds : COUNT_PROTECTED_ROUNDS,
          });
          
          return cb(null, playersArr[i]);
        }
      }
      
      cb(Config.errors.NO_THAT_PLAYER);
    }
    // Оповещаем игроков в комнате
  ], function (err, proProfile) {
    if(err) {
      return emitRes(err, socket, IO_PRISON_PROTECT);
    }
  
    // Оповещаем игроков в комнате
    let resultObj = {
      [PF.ID]   : proProfile.getID(),
      [PF.VID]  : proProfile.getVID(),
      [PF.FID]  : selfProfile.getID(),
      [PF.FVID] : selfProfile.getVID()
    };
  
    socket.broadcast.in(game.getRoom().getName()).emit(IO_PRISON_PROTECT, resultObj);
    emitRes(null, socket, IO_PRISON_PROTECT, resultObj);
  });
  
};
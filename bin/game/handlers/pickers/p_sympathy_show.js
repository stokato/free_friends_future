/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const async = require('async');

const Config      = require('./../../../../config.json');
const constants   = require('./../../../constants');
const oPool       = require('./../../../objects_pool');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');

const PF                = constants.PFIELDS;
const SYMPATHY_PRICE    = Number(Config.moneys.sympathy_price);
const WASTE_POINTS      = Number(Config.points.waste);

module.exports = function (game) {
  return function (socket, options) {
    if(!checkID(options[PF.PICK])) {
      return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_GAME_ERROR);
    }
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    // Нельзя выбрать себя
    if(uid == options[PF.PICK]) {
      return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_GAME_ERROR);
    }
    
    // Проверка - такого игрока нет
    if(!game.getActivePlayer(options[PF.PICK])) {
      return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_GAME_ERROR);
    }
    
    // Нельзя выбрать несколько раз одного и того же игрока
    let actions = game.getAction(uid);
    for( let i = 0; i < actions.length; i++) {
      if(actions[i][PF.PICK] == options[PF.PICK]) {
        return emitRes(constants.errors.FORBIDDEN_CHOICE, socket, constants.IO_GAME_ERROR);
      }
    }
  
    game.addAction(uid, options);
    
    async.waterfall([ //-------------------------------------------------------------
      function (cb) {
        selfProfile.pay(SYMPATHY_PRICE, function (err, money) {
          if(err) { return cb(err);  }
    
          cb(null, null);
        });
      }, //-------------------------------------------------------------
      function (res, cb) {
        selfProfile.addPoints(WASTE_POINTS * SYMPATHY_PRICE, function (err, points) {
          if(err) { return cb(err);  }
    
          cb(null, null);
      });
      },  //-------------------------------------------------------------
      function (res, cb) {
        let result = { [PF.PICKS] : [] };
  
        // Получаем все ходы, о котором хочет узнать игрок и отправляем
        let actions = game.getAction(options[PF.PICK]);
        if(actions.length() > 0) {
    
          for(let i = 0; i < actions.length; i ++) {
            let pickedId = actions[i][PF.PICK];
      
            let playerInfo = game.getActivePlayer(options[PF.PICK]);
      
            let pick = {
              [PF.ID]   : playerInfo.id,
              [PF.VID]  : playerInfo.vid,
              [PF.PICK] : {
                [PF.ID]   : pickedId,
                [PF.VID]  : game.getActivePlayer(pickedId).vid
              }
            };
      
            result[PF.PICKS].push(pick);
          }
        } else {
          let pick = {
            [PF.ID]   : options[PF.PICK],
            [PF.VID]  : game.getActivePlayer(options[PF.PICK]).vid,
            [PF.PICK] : null
          };
    
          result[PF.PICKS].push(pick);
        }
  
        let socket = game.getActivePlayer(uid).player.getSocket();
        game.emit(result, socket);
        
        cb(null, null);
      } //-------------------------------------------------------------
    ], function (err) {
      if(err) {
        return emitRes(err, socket, constants.IO_GAME_ERROR);
      }
  
      if(game.getActionsCount() == 0) {
        game.getHandler(constants.G_SYMPATHY_SHOW, constants.GT_FIN)(game);
      }
    });
  };
  
};
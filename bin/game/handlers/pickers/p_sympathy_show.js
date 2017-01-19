/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const async = require('async');

const Config      = require('./../../../../config.json');
const oPool       = require('./../../../objects_pool');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');

const PF                = require('./../../../const_fields');
const SYMPATHY_PRICE    = Number(Config.moneys.sympathy_price);
const WASTE_POINTS      = Number(Config.points.waste);
const IO_GAME_ERROR     = Config.io.emits.IO_GAME_ERROR;

module.exports = function (game) {
  return function (socket, options) {
    if(!checkID(options[PF.PICK])) {
      return emitRes(Config.errors.NO_PARAMS, socket, IO_GAME_ERROR);
    }
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    // Нельзя выбрать себя
    if(uid == options[PF.PICK]) {
      return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_GAME_ERROR);
    }
    
    // Проверка - такого игрока нет
    if(!game.getActivePlayer(options[PF.PICK])) {
      return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_GAME_ERROR);
    }
    
    // Нельзя выбрать несколько раз одного и того же игрока
    let actions = game.getAction(uid);
    if(actions) {
      for( let i = 0; i < actions.length; i++) {
        if(actions[i][PF.PICK] == options[PF.PICK]) {
          return emitRes(Config.errors.FORBIDDEN_CHOICE, socket, IO_GAME_ERROR);
        }
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
        let storedActions = game.getStoredOptions()[options[PF.PICK]];
        if(storedActions && storedActions.length > 0) {
    
          for(let i = 0; i < storedActions.length; i ++) {
            let pickedId = storedActions[i][PF.PICK];
      
            let playerInfo = game.getActivePlayer(options[PF.PICK]);
      
            if(playerInfo) {
              result[PF.PICKS].push({
                [PF.ID]   : playerInfo.id,
                [PF.VID]  : playerInfo.vid,
                [PF.PICK] : {
                  [PF.ID]   : pickedId,
                  [PF.VID]  : game.getActivePlayer(pickedId).vid
                }
              });
            }
          }
        } else {
          let playerInfo = game.getActivePlayer(options[PF.PICK]);
          if(playerInfo) {
            result[PF.PICKS].push({
              [PF.ID]   : options[PF.PICK],
              [PF.VID]  : game.getActivePlayer(options[PF.PICK]).vid,
              [PF.PICK] : null
            });
          }
        }
  
        let socket = game.getActivePlayer(uid).player.getSocket();
        game.sendData(result, socket);
        
        cb(null, null);
      } //-------------------------------------------------------------
    ], function (err) {
      if(err) {
        return emitRes(err, socket, Config.io.emits.IO_GAME_ERROR);
      }
  
      if(game.getActionsCount() == 0) {
        game.getHandler(game.CONST.G_SYMPATHY_SHOW, game.CONST.GT_FIN)(game);
      }
    });
  };
  
};
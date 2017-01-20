/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 *
 * @param game - Игра
 *
 * Обработчик события выбора игрока в рануде Симпатии - этап второй - просмотр выбора других игроков
 * Получаем ходы игрока и отравляем их запросившему
 * Снимаем с игрока деньги и начисляем ему очки
 * После того как все игроки походят или сработает таймер - переходим к завершению раунда
 */

const async = require('async');

const Config      = require('./../../../../config.json');
const PF          = require('./../../../const_fields');
const oPool       = require('./../../../objects_pool');

const checkID     = require('./../../../check_id');
const emitRes     = require('./../../../emit_result');

module.exports = function (game) {
  
  const SYMPATHY_PRICE    = Number(Config.moneys.sympathy_price);
  const WASTE_POINTS      = Number(Config.points.waste);
  const IO_GAME_ERROR     = Config.io.emits.IO_GAME_ERROR;
  
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
    let actionsArr = game.getActions(uid);
    if(actionsArr) {
      let actionsCount = actionsArr.length;
      
      for( let i = 0; i < actionsCount; i++) {
        if(actionsArr[i][PF.PICK] == options[PF.PICK]) {
          return emitRes(Config.errors.FORBIDDEN_CHOICE, socket, IO_GAME_ERROR);
        }
      }
    }
  
    game.addAction(uid, options);
    
    async.waterfall([ //-------------------------------------------------------------
      function (cb) {
        selfProfile.pay(SYMPATHY_PRICE, (err, money) => {
          if(err) {
            return cb(err);
          }
    
          cb(null, null);
        });
      }, //-------------------------------------------------------------
      function (res, cb) {
        selfProfile.addPoints(WASTE_POINTS * SYMPATHY_PRICE,(err, points) => {
          if(err) {
            return cb(err);
          }
    
          cb(null, null);
      });
      },  //-------------------------------------------------------------
      function (res, cb) {
        let resultObj = { [PF.PICKS] : [] };
  
        // Получаем все ходы, о котором хочет узнать игрок и отправляем
        let storedActionsArr = game.getStoredOptions()[options[PF.PICK]];
        if(storedActionsArr && storedActionsArr.length > 0) {
          let storedActionsCount = storedActionsArr.length;
          
          for(let i = 0; i < storedActionsCount; i ++) {
            let pickedId = storedActionsArr[i][PF.PICK];
      
            let playerInfoObj = game.getActivePlayer(options[PF.PICK]);
      
            if(playerInfoObj) {
              resultObj[PF.PICKS].push({
                [PF.ID]   : playerInfoObj.id,
                [PF.VID]  : playerInfoObj.vid,
                [PF.PICK] : {
                  [PF.ID]   : pickedId,
                  [PF.VID]  : game.getActivePlayer(pickedId).vid
                }
              });
            }
          }
        } else {
          let playerInfoObj = game.getActivePlayer(options[PF.PICK]);
          
          if(playerInfoObj) {
            resultObj[PF.PICKS].push({
              [PF.ID]   : options[PF.PICK],
              [PF.VID]  : game.getActivePlayer(options[PF.PICK]).vid,
              [PF.PICK] : null
            });
          }
        }
  
        let socket = game.getActivePlayer(uid).player.getSocket();
        game.sendData(resultObj, socket);
        
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
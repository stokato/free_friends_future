/**
 * Сохраняем признак того, что игра добавлена в меню пользователя
 *
 * @param socket, options, callback
 *
 */
const async       = require('async');

const Config      = require('./../../../../config.json');
const constants   = require('./../../../constants');
const oPool       = require('./../../../objects_pool');
const stat        = require('./../../../stat_manager');

const emitRes     = require('./../../../emit_result');

const MENU_BONUS  = Number(Config.moneys.menu_bonus);
const PF          = constants.PFIELDS;

module.exports = function(socket, options) {
  
  let selfProfile = oPool.userList[socket.id];
  
  if(selfProfile.isInMenu()) {
    return emitRes(constants.errors.ALREADY_IS_MENU, socket, constants.IO_ADD_TO_MENU);
  }
  
  async.waterfall([ //-------------------------------------------------------------
    function(cb) { // Запоминаем, что пользователь добавил свое приложение в меню
      
      selfProfile.setInMenu(true, function(err) {
        if(err) { return cb(err, null); }
        
        //Статистика
        stat.setMainStat(constants.SFIELDS.MENU_APPEND, 1);
        
        cb(null, null);
      });
      
    },//---------------------------------------------------------------------------
    function(res, cb) { // Получаем баланс пользователя
      
      selfProfile.getMoney(function (err, money) {
        if (err) {  return cb(err, null); }
        
        cb(null, money);
      });
      
    },//---------------------------------------------------------------------------
    function(money, cb) { // Добавляем ему монет
      
      let newMoney = money + MENU_BONUS;
      selfProfile.setMoney(newMoney, function (err, money) {
        if (err) { return cb(err, null); }
        
        // Статистика
        stat.setUserStat(selfProfile.getID(), selfProfile.getVID(), constants.SFIELDS.COINS_EARNED, MENU_BONUS);
        stat.setMainStat(constants.SFIELDS.COINS_EARNED, MENU_BONUS);
        
        cb(null, money);
      });
      
    }//---------------------------------------------------------------------------
  ], function(err, money) { // Оповещаем об изменениях
    if(err) {  return emitRes(err, socket, constants.IO_ADD_TO_MENU);  }
    
    let res = { [PF.MONEY] : money };
 
    socket.emit(constants.IO_GET_MONEY, res);
    
    emitRes(null, socket, constants.IO_ADD_TO_MENU);
  });
};


/**
 * Сохраняем признак того, что игра добавлена в меню пользователя
 *
 * @param socket, options, callback
 *
 */
const async       = require('async');

const Config      = require('./../../../../config.json');
const PF          = require('./../../../const_fields');
const oPool       = require('./../../../objects_pool');
const stat        = require('./../../../stat_manager');

const emitRes     = require('./../../../emit_result');

module.exports = function(socket, options) {
  
  const MENU_BONUS      = Number(Config.moneys.menu_bonus);
  const IO_ADD_TO_MENU  = Config.io.emits.IO_ADD_TO_MENU;
  
  let selfProfile = oPool.userList[socket.id];
  
  if(selfProfile.isInMenu()) {
    return emitRes(Config.errors.ALREADY_IS_MENU, socket, IO_ADD_TO_MENU);
  }
  
  async.waterfall([ //-------------------------------------------------------------
    function(cb) { // Запоминаем, что пользователь добавил свое приложение в меню
      
      selfProfile.setInMenu(true, (err) => {
        if(err) {
          return cb(err, null);
        }
        
        //Статистика
        stat.setMainStat(PF.MENU_APPEND, 1);
        
        cb(null, null);
      });
      
    },//---------------------------------------------------------------------------
    function(res, cb) { // Получаем баланс пользователя
      
      selfProfile.getMoney((err, money) => {
        if (err) {
          return cb(err, null);
        }
        
        cb(null, money);
      });
      
    },//---------------------------------------------------------------------------
    function(money, cb) { // Добавляем ему монет
      
      let newMoney = money + MENU_BONUS;
      
      selfProfile.setMoney(newMoney, (err, money) => {
        if (err) {
          return cb(err, null);
        }
        
        // Статистика
        stat.setUserStat(selfProfile.getID(), selfProfile.getVID(), PF.COINS_EARNED, MENU_BONUS);
        stat.setMainStat(PF.COINS_EARNED, MENU_BONUS);
        
        cb(null, money);
      });
      
    }//---------------------------------------------------------------------------
  ], function(err, money) { // Оповещаем об изменениях
    if(err) {
      return emitRes(err, socket, IO_ADD_TO_MENU);
    }
 
    socket.emit(Config.io.emits.IO_GET_MONEY, { [PF.MONEY] : money });
    
    emitRes(null, socket, IO_ADD_TO_MENU);
  });
};


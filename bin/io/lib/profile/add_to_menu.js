/**
 * Сохраняем признак того, что игра добавлена в меню пользователя
 *
 * @param socket, options, callback
 *
 */
var async = require('async');

var constants  = require('./../../../constants'),
    PF         = constants.PFIELDS,
    oPool      = require('./../../../objects_pool'),
    stat       = require('./../../../stat_manager');

module.exports = function(socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  if(selfProfile.isInMenu()) {
    return callback(constants.errors.ALREADY_IS_MENU);
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
      
      var newMoney = money + constants.MENU_BONUS;
      selfProfile.setMoney(newMoney, function (err, money) {
        if (err) { return cb(err, null); }
        
        // Статистика
        stat.setUserStat(selfProfile.getID(), selfProfile.getVID(), constants.SFIELDS.COINS_EARNED, constants.MENU_BONUS);
        stat.setMainStat(constants.SFIELDS.COINS_EARNED, constants.MENU_BONUS);
        
        cb(null, money);
      });
      
    }//---------------------------------------------------------------------------
  ], function(err, money) { // Оповещаем об изменениях
    if(err) {  return callback(err);  }
    
    var res = {};
    res[PF.MONEY] = money;
    
    socket.emit(constants.IO_GET_MONEY, res);
    
    callback(null, null);
  });
};


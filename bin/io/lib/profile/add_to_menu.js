var async = require('async');

var constants  = require('./../../../constants');
var oPool      = require('./../../../objects_pool');

module.exports = function(socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  
  if(selfProfile.isInMenu()) {
    return callback(constants.errors.ALREADY_IS_MENU);
  }
  
  async.waterfall([ ///////////////////////////////////////////////////////////////
    function(cb) { // Запоминаем, что пользователь добавил свое приложение в меню
      
      selfProfile.setInMenu(true, function(err, res) {
        if(err) { return cb(err, null); }
        
        cb(null, null);
      });
      
    },/////////////////////////////////////////////////////////////////////////////
    function(res, cb) { // Получаем баланс пользователя
      
      selfProfile.getMoney(function (err, money) {
        if (err) {  return cb(err, null); }
        
        cb(null, money);
      });
      
    },/////////////////////////////////////////////////////////////////////////////
    function(money, cb) { // Добавляем ему монет
      
      var newMoney = money + constants.MENU_BONUS;
      selfProfile.setMoney(newMoney, function (err, money) {
        if (err) { return cb(err, null); }
        
        cb(null, money);
      });
      
    }////////////////////////////////////////////////////////////////////
  ], function(err, money) { // Оповещаем об изменениях
    if(err) {  return callback(err);  }
    
    socket.emit(constants.IO_GET_MONEY, { money : money });
    
    callback(null, null);
  });
};


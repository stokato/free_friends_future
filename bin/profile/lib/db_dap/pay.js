/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

var constants = require('../../../constants');

module.exports = function (price, callback) {
  
  var self = this;
  
  self.getMoney(function(err, money) {
    if(err) { return callback(err); }
    
    var newMoney = money - price;
    
    if(newMoney < 0) {
      return callback(constants.errors.TOO_LITTLE_MONEY); // onComplete(constants.errors.TOO_LITTLE_MONEY);
    }
    
    // Снимаем монеты
    self.setMoney(newMoney, function(err, money) {
      if(err) { return callback(err); }
      
      var socket = profile.getSocket();
      socket.emit(constants.IO_GET_MONEY, { money : money });
      
      callback(null, profile, price);
    });
  });
  
};
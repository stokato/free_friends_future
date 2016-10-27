var constants = require('../../../constants');

module.exports = function (profile, price, callback) {
  
  profile.getMoney(function(err, money) {
    if(err) { return callback(err); }
    
    var newMoney = money - price;
    
    if(newMoney < 0) {
      return callback(constants.errors.TOO_LITTLE_MONEY); // onComplete(constants.errors.TOO_LITTLE_MONEY);
    }
    
    // Снимаем монеты
    profile.setMoney(newMoney, function(err, money) {
      if(err) { return callback(err); }
      
      var socket = profile.getSocket();
      socket.emit(constants.IO_GET_MONEY, { money : money });
      
      callback(null, profile, price);
    });
  });
  
};
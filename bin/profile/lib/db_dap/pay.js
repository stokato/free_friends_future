/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

var constants = require('../../../constants');

/*
    Снимаем монеты с пользователя
 */
module.exports = function (price, callback) {
  
  var self = this;
  
  self.getMoney(function(err, money) {
    if(err) { return callback(err); }
    
    var newMoney = money - price;
    
    if(newMoney < 0) {
      return callback(constants.errors.TOO_LITTLE_MONEY);
    }
    
    self.setMoney(newMoney, function(err, money) {
      if(err) { return callback(err); }
      
      callback(null, money);
    });
  });
  
};
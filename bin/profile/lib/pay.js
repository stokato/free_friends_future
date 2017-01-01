/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Снимае указанную сумму монет с баланса пользователя
 *
 * @param price - сумма с счислению, callback
 * @return money - новый баланс
 */

var constants = require('../../constants'),
    stat      = require('./../../stat_manager');

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
      
      stat.setUserStat(self._pID, self._pVID, constants.SFIELDS.COINS_SPENT, price);
      stat.setMainStat(constants.SFIELDS.COINS_SPENT, price);
  
      if(self._pOnPay) {
        self._pOnPay(self, money);
      }
      
      callback(null, money);
    });
  });
  
};
/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Снимае указанную сумму монет с баланса пользователя
 *
 * @param price - сумма с счислению, callback
 * @return money - новый баланс
 */

const Config    = require('./../../../config.json');
const PF = require('../../const_fields'),
    stat      = require('./../../stat_manager');

module.exports = function (price, callback) {
  
  let self = this;
  
  self.getMoney(function(err, money) {
    if(err) { return callback(err); }
    
    let newMoney = money - price;
    
    if(newMoney < 0) {
      return callback(Config.errors.TOO_LITTLE_MONEY);
    }
    
    self.setMoney(newMoney, function(err, money) {
      if(err) { return callback(err); }
      
      stat.setUserStat(self._pID, self._pVID, PF.COINS_SPENT, price);
      stat.setMainStat(PF.COINS_SPENT, price);
  
      if(self._pOnPay) {
        self._pOnPay(self, money);
      }
      
      callback(null, money);
    });
  });
  
};
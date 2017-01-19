/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Начисляем деньги
 */

const PF = require('../../const_fields'),
  stat          = require('./../../stat_manager');

module.exports = function (profit, callback) {
  
  let self = this;
  
  self.getMoney(function(err, money) {
    if(err) { return callback(err); }
    
    let newMoney = money + profit;
    
    self.setMoney(newMoney, function(err, money) {
      if(err) { return callback(err); }
      
      stat.setUserStat(self._pID, self._pVID, PF.COINS_EARNED, profit);
      stat.setMainStat(PF.COINS_EARNED, profit);
      
      callback(null, money);
    });
  });
  
};
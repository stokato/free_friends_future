/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Начисляем деньги
 */

const constants = require('../../constants'),
  stat          = require('./../../stat_manager');

module.exports = function (profit, callback) {
  
  let self = this;
  
  self.getMoney(function(err, money) {
    if(err) { return callback(err); }
    
    let newMoney = money + profit;
    
    self.setMoney(newMoney, function(err, money) {
      if(err) { return callback(err); }
      
      stat.setUserStat(self._pID, self._pVID, constants.SFIELDS.COINS_EARNED, profit);
      stat.setMainStat(constants.SFIELDS.COINS_EARNED, profit);
      
      callback(null, money);
    });
  });
  
};
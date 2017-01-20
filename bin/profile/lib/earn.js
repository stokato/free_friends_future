/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Начисляем деньги
 */

const PF        = require('../../const_fields');
const statCtrlr = require('./../../stat_manager');

module.exports = function (profit, callback) {
  
  let self = this;
  
  self.getMoney((err, money) => {
    if(err) {
      return callback(err);
    }
    
    let newMoney = money + profit;
    
    self.setMoney(newMoney, (err, money) => {
      if(err) {
        return callback(err);
      }
      
      statCtrlr.setUserStat(self._pID, self._pVID, PF.COINS_EARNED, profit);
      statCtrlr.setMainStat(PF.COINS_EARNED, profit);
      
      callback(null, money);
    });
  });
  
};
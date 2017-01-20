/**
 * Устанавливаем баланс
 *
 * @param value - новый баланс, callback
 * @return money - новый баланс
 */

const  dbCtrlr = require('./../../db_manager');
const  PF      = require('./../../const_fields');

module.exports = function(num, callback) {
  if (!Number.isInteger(num)) {
    return callback(new Error("Количество монет задано некорректно"));
  }
  let  self = this;

  let  options = {
    [PF.ID]    : self._pID,
    [PF.VID]   : self._pVID,
    [PF.MONEY] : num
  };


  dbCtrlr.updateUser(options, (err) => {
    if (err) {
      return callback(err, null);
    }

    self._pMoney = num;
    
    callback(null, self._pMoney);
  });
};

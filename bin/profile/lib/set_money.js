/**
 * Устанавливаем баланс
 *
 * @param value - новый баланс, callback
 * @return money - новый баланс
 */

const  db = require('./../../db_manager');
const  IOF = require('./../../constants').PFIELDS;

module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Количество монет задано некорректно"));
  }
  let  self = this;

  let  options = {
    [IOF.ID]    : self._pID,
    [IOF.VID]   : self._pVID,
    [IOF.MONEY] : num
  };


  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pMoney = num;
    
    callback(null, self._pMoney);
  });
};

//----------------------------------------------
function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}
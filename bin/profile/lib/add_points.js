/**
 * Добавляем очки пользователю
 *
 * Сохраняем обновленные данные в БД
 */

const  dbCtrlr  = require('./../../db_manager');
const  PF       = require('./../../const_fields');

module.exports = function(num, callback) {
  if (!Number.isInteger(num)) {
    return callback(new Error("Количество очков задано некорректно"));
  }
  
  let  self = this;
  
  self._pPoints = self._pPoints || 0;
  
  let  options = {
    [PF.ID]      : self._pID,
    [PF.VID]     : self._pVID,
    [PF.SEX]     : self._pSex,
    [PF.POINTS]  : self._pPoints + num
  };
  
  dbCtrlr.addPoints(options, (err) => {
    if(err) {
      return callback(err, null);
    }
    
    self._pPoints += num;
    
    if(self._pOnAddPoints) {
      self._pOnAddPoints(self, num);
    }
    
    callback(null, self._pPoints);
  });
  
};

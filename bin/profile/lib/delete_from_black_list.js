/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 * 
 * Удаляем пользователя из черного списка
 */

var db  = require('./../../db_manager');

module.exports = function (blockedID, callback) {
  
  var self = this;
  
  db.deleteBlocked(self._pID, blockedID, function (err) {
    if(err) { return callback(err); }
    
    if(self._pBlackList[blockedID]) {
      clearTimeout(self._pBlackList[blockedID].timeout);
      
      delete self._pBlackList[blockedID];
    }
  })
  
};

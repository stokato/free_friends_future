/**
 * Получаем историю приватного чата за заданный период времени
 *
 * @param id - ид пользователя, с которым открывается чат, fdate, sdate - временной период, callback
 * @return список сообщений
 */

var db = require('./../../db_manager');
var IOF = require('./../../constants').PFIELDS;

module.exports = function(id, fdate, sdate, callback) {
  var self = this;
  
  var params = {};
  params[IOF.ID_LIST]    = [id];
  params[IOF.DATE_FROM]  = fdate;
  params[IOF.DATE_TO]    = sdate;

  db.findMessages(self._pID, params, function(err, messages) { messages = messages || [];
    if (err) { return callback(err, null); }
  
    messages.sort(function (mesA, mesB) {
      return mesA[IOF.DATE] - mesB[IOF.DATE];
    });
    
    callback(null, messages);
  });
};

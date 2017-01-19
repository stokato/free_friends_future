/**
 * Получаем историю приватного чата за заданный период времени
 *
 * @param id - ид пользователя, с которым открывается чат, fdate, sdate - временной период, callback
 * @return список сообщений
 */

const db = require('./../../db_manager');
const IOF = require('./../../const_fields');

module.exports = function(id, fdate, sdate, callback) {
  let self = this;
  
  let params = {
    [IOF.ID_LIST]   : [id],
    [IOF.DATE_FROM] : fdate,
    [IOF.DATE_TO]   : sdate
  };

  db.findMessages(self._pID, params, function(err, messages) { messages = messages || [];
    if (err) { return callback(err, null); }
  
    messages.sort(function (mesA, mesB) {
      return mesA[IOF.DATE] - mesB[IOF.DATE];
    });
    
    callback(null, messages);
  });
};

/**
 * Получаем историю приватного чата за заданный период времени
 *
 * @param id - ид пользователя, с которым открывается чат, fdate, sdate - временной период, callback
 * @return список сообщений
 */

const dbCtrlr = require('./../../db_controller');
const PF      = require('./../../const_fields');

module.exports = function(id, fdate, sdate, callback) {
  let self = this;
  
  let params = {
    [PF.ID_LIST]   : [id],
    [PF.DATE_FROM] : fdate,
    [PF.DATE_TO]   : sdate
  };

  dbCtrlr.findMessages(self._pID, params, (err, messagesArr) => { messagesArr = messagesArr || [];
    if (err) {
      return callback(err, null);
    }
  
    messagesArr.sort((mesA, mesB) => {
      return mesA[PF.DATE] - mesB[PF.DATE];
    });
    
    callback(null, messagesArr);
  });
};

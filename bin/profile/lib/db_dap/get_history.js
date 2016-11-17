var db = require('./../../../db_manager');

/*
Получить историю приватного чата за заданный период времени
 */
module.exports = function(options, callback) {
  var self = this;
  
  var params = {
    id_list       : [options.id],
    first_date    : options.first_date,
    second_date   : options.second_date
  };

  db.findMessagesOneChat(self.pID, params, function(err, messages) { messages = messages || [];
    if (err) { return callback(err, null); }
  
    messages.sort(function (mesA, mesB) {
      return mesA.date - mesB.date;
    });
    
    callback(null, messages);
  });
};

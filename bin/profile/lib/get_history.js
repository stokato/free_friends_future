var constants = require('../../constants');
var db = require('./../../db_manager');

/*
Получить историю приватного чата за заданный период времени
 */
module.exports = function(options, callback) {
  var self = this;

  var params = {};
  params.id_list        = [options.id];
  params.first_date  = options.first_date;
  params.second_date = options.second_date;

  db.findMessages(self.pID, params, function(err, messages) {
    if (err) { return callback(err, null); }

    messages = messages || [];
    var history = [];
    var message = {};
    for(var i = 0; i < messages.length; i++) {
      message = {};
      if(messages[i].incoming) { // Если входящее, берем данные собеседника (хранятся в чате) и наоборот
        message.id      = options.id;
        message.vid     = options.vid;
        message.city    = options.city;
        message.country = options.country;
        message.sex     = options.sex;
      } else {
        message.id      = self.pID;
        message.vid     = self.pVID;
        message.city    = self.pCity;
        message.country = self.pCountry;
        message.sex     = self.pSex;
      }
      message.chat      = options.id;
      message.chatVID   = options.vid;
      message.date      = messages[i]["date"];
      message.text      = messages[i]["text"];
      message.messageid = messages[i]["id"];

      history.push(message);
    }
    callback(null, history);
  });
};

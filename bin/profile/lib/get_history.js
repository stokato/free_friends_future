/*
Получить историю приватного чата за заданный период времени
 */
module.exports = function(opt, callback) {
  var self = this;
  var options = {
    id_list : [opt.id],
    fdate    : opt.fdate,
    sdate    : opt.sdate
  };
  self.dbManager.findMessages(self.pID, options, function(err, messages) {
    if (err) { return callback(err, null); }

    messages = messages || [];
    var history = [];
    var message = null;
    for(var i = 0; i < messages.length; i++) {
      if(messages[i].incoming) { // Если входящее, берем данные собеседника (хранятся в чате) и наоборот
        message = {
          chat    : opt.id,
          id      : opt.id,
          vid     : opt.vid,
          date    : messages[i].date,
          text    : messages[i].text,
          city    : opt.city,
          country : opt.country,
          sex     : opt.sex
        };
        history.push(message);
      }
      if(!messages[i].incoming) {
        message = {
          chat    : opt.id,
          id      : self.getID(),
          vid     : self.getVID(),
          date    : messages[i].date,
          text    : messages[i].text,
          city    : self.getCity(),
          country : self.getCountry(),
          sex     : self.getSex()
        };
        history.push(message);
      }
    }
    callback(null, history);
  });
};

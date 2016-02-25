/*
Добавить приватный чат: ид и вид
  Добавляем в список открытых чатов
  Ищем в БД историю обмена сообщениями с этим собеседником
  Возвращаем данные чата вместе с историей
 */
module.exports = function(chat, callback) {
  var self = this;
  self.pPrivateChats.push(chat);

  var options = {
    id_list : [chat.id],
    date    : chat.date
  };
  self.dbManager.findMessages(self.pID, options, function(err, messages) {
    if (err) { return callback(err, null); }

    messages = messages || [];
    var history = [];
    var message = null;
    for(var i = 0; i < messages.length; i++) {
      if(messages[i].incoming) {
        message = {
          chat    : chat.id,
          id      : chat.id,
          vid     : chat.vid,
          date    : messages[i].date,
          text    : messages[i].text,
          city    : chat.city,
          country : chat.country,
          sex     : chat.sex
        };
        history.push(message);
      }
      if(!messages[i].incoming) {
        message = {
          chat    : chat.id,
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

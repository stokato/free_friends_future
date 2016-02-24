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

    var info = {
      id       : chat.id,
      vid      : chat.vid,
      age      : chat.age,
      city     : chat.city,
      country  : chat.country,
      sex      : chat.sex,
      messages : messages
    };

    callback(null, info);
  });
};

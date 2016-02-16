/*
Добавить приватный чат: ид и вид
  Добавляем в список открытых чатов
  Ищем в БД историю обмена сообщениями с этим собеседником
  Возвращаем данные чата вместе с историей
 */
module.exports = function(chat, callback) {
  var self = this;
  self.pPrivateChats.push(chat);

  self.dbManager.findMessages(self.pID, [chat.id], function(err, messages) {
    if (err) { return callback(err, null); }

    chat.messages = messages;

    callback(null, chat);
  });
};
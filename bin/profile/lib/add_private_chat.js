/*
Добавить приватный чат: ид и вид
  Добавляем в список открытых чатов
 */
module.exports = function(chat) {
  this.pPrivateChats.push(chat);
};

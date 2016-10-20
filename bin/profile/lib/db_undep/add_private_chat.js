/*
Добавить приватный чат: ид и вид
  Добавляем в список открытых чатов
 */
module.exports = function(chat) {
  
  for(var i = 0; i < this.pPrivateChats.length; i++) {
    if(this.pPrivateChats[i].id == chat.id) {
      return;
    }
  }
  
  this.pPrivateChats.push(chat);
};

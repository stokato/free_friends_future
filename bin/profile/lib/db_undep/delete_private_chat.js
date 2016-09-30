/*
Удалить приватный чат: ид собеседника (чата)
 */
module.exports = function(id) {
  var i, chats = this.pPrivateChats;
  for(i = 0; i < chats.length; i++) {
    if(chats[i].id == id) {
      return chats.splice(i, 1);
    }
  }
};
/*
Удалить приватный чат: ид собеседника (чата)
 */
module.exports = function(id) {
  var chats = this.pPrivateChats;
  for(var i = 0; i < chats.length; i++) {
    if(chats[i].id == id) {
      return chats.splice(i, 1);
    }
  }
};
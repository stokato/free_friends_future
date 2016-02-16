/*
Проверить - есть ли такой чат: ид собеседника (чата)

 */
module.exports = function(id) {
  var ok = false;
  var chats = this.pPrivateChats;
  for(var i = 0; i < chats.length; i++) {
    if(chats[i].id == id) ok = true;
  }

  return ok;
};
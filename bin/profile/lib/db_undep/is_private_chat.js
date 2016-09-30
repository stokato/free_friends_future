var constants = require('../../../constants');
/*
Проверить - есть ли такой чат: ид собеседника (чата)

 */
module.exports = function(id) {
  var ok = false;
  var i, chats = this.pPrivateChats;

  for(i = 0; i < chats.length; i++) {
    if(chats[i]["id"] == id) { ok = true; }
  }

  return ok;
};
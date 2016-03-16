var constants = require('../../io/constants');
/*
Проверить - есть ли такой чат: ид собеседника (чата)

 */
module.exports = function(id) {
  var ok = false;
  var i, chats = this.pPrivateChats;
  var f = constants.FIELDS;

  for(i = 0; i < chats.length; i++) {
    if(chats[i][f.id] == id) { ok = true; }
  }

  return ok;
};
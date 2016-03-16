var constants = require('../../io/constants');
/*
Удалить приватный чат: ид собеседника (чата)
 */
module.exports = function(id) {
  var f = constants.FIELDS;
  var i, chats = this.pPrivateChats;
  for(i = 0; i < chats.length; i++) {
    if(chats[i][f.id] == id) {
      return chats.splice(i, 1);
    }
  }
};
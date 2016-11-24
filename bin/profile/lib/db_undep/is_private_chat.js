var IOF = require('./../../../constants').PFIELDS;

/*
  Проверить - есть ли такой чат
 */
module.exports = function(id) {
  var chats = this._pIsPrivateChats;

  for(var i = 0; i < chats.length; i++) {
    if(chats[i][IOF.ID] == id) { return true; }
  }

  return false;
};
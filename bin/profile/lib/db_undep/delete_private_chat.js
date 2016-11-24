/*
    Удалить приватный чат
 */
module.exports = function(id) {
  var chats = this._pIsPrivateChats;
  
  for(var i = 0; i < chats.length; i++) {
    if(chats[i] == id) {
      return chats.splice(i, 1);
    }
  }
};
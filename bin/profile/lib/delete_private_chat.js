/**
 * Удалить приватный чат
 *
 * @param id - ид пользователя, с которым чат
 * @return id
 */
module.exports = function(id) {
  var chats = this._pIsPrivateChats;
  
  for(var i = 0; i < chats.length; i++) {
    if(chats[i] == id) {
      chats.splice(i, 1);
      return id;
    }
  }
};
/**
 * Удалить приватный чат
 *
 * @param id - ид пользователя, с которым чат
 * @return id
 */

module.exports = function(id) {
  let  chats = this._pPrivateChats;
  
  for(let i = 0; i < chats.length; i++) {
    if(chats[i] == id) {
      chats.splice(i, 1);
      return id;
    }
  }
};
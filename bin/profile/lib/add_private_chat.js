/**
 * Добавляем приватный чат  в список открытых чатов
 *
 * Есть он уже там, ничего  не делаем
 */
module.exports = function(companion) {
  
  var cid = companion.getID();
  
  for(var i = 0; i < this._pIsPrivateChats.length; i++) {
    if(this._pIsPrivateChats[i] == cid) {
      return;
    }
  }
  
  this._pIsPrivateChats.push(cid);
};
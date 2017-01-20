/**
 * Добавляем приватный чат  в список открытых чатов
 *
 * Есть он уже там, ничего  не делаем
 */
module.exports = function(companion) {
  
  let  cid = companion.getID();
  
  for(let  i = 0; i < this._pPrivateChats.length; i++) {
    if(this._pPrivateChats[i] == cid) {
      return;
    }
  }
  
  this._pPrivateChats.push(cid);
};

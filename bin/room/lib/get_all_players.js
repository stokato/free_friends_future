/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 *  Получить профили всех пользователей в комнате
 *
 *  @param sex - пол профиля (не обязательный)
 *  @return players - список пользователей
 */

const constants = require('./../../constants');

module.exports = function (sex = null) {// sex = sex || null;
  let players = [], index;
  
  if(!sex || sex == constants.GUY) {
    for(index in this._guys) if(this._guys.hasOwnProperty(index)){
      players.push(this._guys[index]);
    }
  }
  if(!sex || sex == constants.GIRL) {
    for(index in this._girls) if(this._girls.hasOwnProperty(index)) {
      players.push(this._girls[index]);
    }
  }
  
  return players;
};
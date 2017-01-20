/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 *  Получить профили всех пользователей в комнате
 *
 *  @param sex - пол профиля (не обязательный)
 *  @return players - список пользователей
 */

const Config    = require('./../../../config.json');

module.exports = function (sex = null) {// sex = sex || null;
  
  const GUY = Config.user.constants.sex.male;
  const GIRL = Config.user.constants.sex.female;
  
  let playersArr = [];
  
  if(!sex || sex == GUY) {
    for(let index in this._guys) if(this._guys.hasOwnProperty(index)){
      playersArr.push(this._guys[index]);
    }
  }
  if(!sex || sex == GIRL) {
    for(let index in this._girls) if(this._girls.hasOwnProperty(index)) {
      playersArr.push(this._girls[index]);
    }
  }
  
  return playersArr;
};
/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Получаем сведения о пользователях одного пола в комнате
 */


const Config    = require('./../../../../config.json');
const fillInfo  = require('./fill_info');

module.exports = function (sex) {
  
  const GUY = Config.user.constants.sex.male;
  
  let infoArr = [];
  
  let playersObj = (sex == GUY)? this._guys : this._girls;
  
  for (let item in playersObj) if (playersObj.hasOwnProperty(item)){
    let gInfoObj = fillInfo(playersObj[item]);
    infoArr.push(gInfoObj);
  }
  
  return infoArr;
};
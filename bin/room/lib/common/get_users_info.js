/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Получаем сведения о пользователях одного пола в комнате
 */


const Config    = require('./../../../../config.json');
const fillInfo  = require('./fill_info');
const GUY = Config.user.constants.sex.male;

module.exports = function (sex) {
  let item, info = [], gInfo;
  
  let arr = (sex == GUY)? this._guys : this._girls;
  
  for (item in arr) if (arr.hasOwnProperty(item)){
    gInfo = fillInfo(arr[item]);
    info.push(gInfo);
  }
  
  return info;
};
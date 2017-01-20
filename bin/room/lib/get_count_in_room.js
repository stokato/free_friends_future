/**
 * Created by s.t.o.k.a.t.o on 16.01.2017.
 */

const Config    = require('./../../../config.json');

module.exports = function (sex) {
  
  const GUY = Config.user.constants.sex.male;
  
  if(sex) {
    return (sex == GUY)? this._guys_count : this._girls_count;
  }
  
  return (this._guys_count + this._girls_count);
};
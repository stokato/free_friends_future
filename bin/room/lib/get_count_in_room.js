/**
 * Created by s.t.o.k.a.t.o on 16.01.2017.
 */

const Config    = require('./../../../config.json');

const GUY = Config.user.constants.sex.male;

module.exports = function (sex) {
  if(sex) {
    return (sex == GUY)? this._guys_count : this._girls_count;
  }
  
  return (this._guys_count + this._girls_count);
};
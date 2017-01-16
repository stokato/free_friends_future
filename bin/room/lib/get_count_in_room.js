/**
 * Created by s.t.o.k.a.t.o on 16.01.2017.
 */

const constants = require('./../../constants');

module.exports = function (sex) {
  if(sex) {
    return (sex == constants.GUY)? this._guys_count : this._girls_count;
  }
  
  return (this._guys_count + this._girls_count);
};
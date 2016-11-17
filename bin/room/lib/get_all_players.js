/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

var constants = require('./../../constants');

module.exports = function (sex) { sex = sex || constants.ANY;
  var players = [], index;
  
  if(sex == constants.ANY || sex == constants.GUY) {
    for(index in this._guys) if(this._guys.hasOwnProperty(index)){
      players.push(this._guys[index]);
    }
  }
  if(sex == constants.ANY || sex == constants.GIRL) {
    for(index in this._girls) if(this._girls.hasOwnProperty(index)) {
      players.push(this._girls[index]);
    }
  }
  
  return players;
};
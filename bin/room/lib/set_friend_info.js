/**
 * Created by s.t.o.k.a.t.o on 16.01.2017.
 */

module.exports = function (id1, id2, isfriends) {
  if(!this._friends[id1]) {
    this._friends[id1] = {};
  }
  this._friends[id1][id2] = isfriends;
  
  if(!this._friends[id2]) {
    this._friends[id2] = {};
  }
  this._friends[id2][id1] = isfriends;
};
/**
 * Created by s.t.o.k.a.t.o on 22.02.2017.
 */

const Config = require('./../../../config.json');
const PF     = require('./../../const_fields');

module.exports = function (message) {
  
  const LEN_ROOM_HISTORY = Config.io.len_room_history;
  
  this._messages.push(message);
  
  if (this._messages.length >= LEN_ROOM_HISTORY) {
    let messageId = this._messages[0][PF.MESSAGEID];
    
    if(this._likes[messageId]) {
      delete this._likes[messageId];
    }
    
    this._messages.shift();
  }
};
/**
 * Created by s.t.o.k.a.t.o on 22.02.2017.
 */

const PF  = require('./../../const_fields');

module.exports = function (messageId, uid) {
  let message = null;
  
  for(let i = 0; i < this._messages.length; i++) {
    if(this._messages[i][PF.MESSAGEID] == messageId) {
      message = this._messages[i];
    }
  }
  
  if(!message) {
    return null;
  }
  
  if(!this._likes[messageId]) {
    this._likes[messageId] = [];
  }
  
  let uidArr = this._likes[messageId];
  let uidIndex = -1;
  
  for(let i = 0; i < uidArr.length; i++) {
    if(uidArr[i] == uid) {
      uidIndex = i;
    }
  }
  
  if(uidIndex >= 0) {
    if(message[PF.LIKES] > 0) {
      message[PF.LIKES] --;
    }
    
    uidArr.splice(uidIndex, 1);
  }  else {
    message[PF.LIKES] ++;
    uidArr.push(uid);
  }
  
  return message;
  
};
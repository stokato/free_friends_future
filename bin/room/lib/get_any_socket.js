/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

/*
    Вернуть первый попавщийся сокет
 */

module.exports = function () {

    var profile = null, index;
    
    for(index in this._guys) if(this._guys.hasOwnProperty(index)) {
      profile = this._guys[index];
      break;
    }
    if(!profile) {
      for(index in room.girls) if(room.girls.hasOwnProperty(index)) {
        profile = room.girls[index];
        break;
      }
    }
    
    if(!profile) {
      return null;
    }
    
    return profile.getSocket();
};
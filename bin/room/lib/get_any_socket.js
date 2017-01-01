/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Вернуть первый попавшийся сокет
 *
 * @return socket
 */

module.exports = function () {

    let profile = null, index;
    
    for(index in this._guys) if(this._guys.hasOwnProperty(index)) {
      profile = this._guys[index];
      break;
    }
    if(!profile) {
      for(index in this._girls) if(this._girls.hasOwnProperty(index)) {
        profile = this._girls[index];
        break;
      }
    }
    
    if(!profile) { return null;  }
    
    return profile.getSocket();
};
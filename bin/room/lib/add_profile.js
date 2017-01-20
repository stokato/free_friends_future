/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавить (связать) профиль
 *
 * @param profile - профиль
 */

const async  = require('async');

const logger  = require('./../../../lib/log')(module);
const Config  = require('./../../../config.json');
const PF      = require('./../../const_fields');

module.exports = function (profile, callback) {
  
  const GUY = Config.user.constants.sex.male;
  
  this._ranks.addProfile(profile);
  
  let sex = profile.getSex();
  if(sex == GUY) {
    this._guys[profile.getID()]  = profile;
    this._guys_count++;
  } else {
    this._girls[profile.getID()] = profile;
    this._girls_count++;
  }
  
  let socket = profile.getSocket();
  if(socket) {
    socket.join(this._nameOfRoom);
  } else {
    logger.error("Room_add_profile : Не удалось получить сокет профиля");
  }
  
  let indexArr = (sex == GUY)? this._guys_indexes : this._girls_indexes;
  indexArr.sort((i1, i2) => { return i1 - i2; });
  
  let index = indexArr[0];
  
  indexArr.splice(0, 1);
  
  profile.setGameIndex(index);
  
  profile.setGame(this._game);
  
  let usersArr = this.getAllPlayers();
  let userListArr = [];
  let usersCount = usersArr.length;
  
  for(let i = 0; i < usersCount; i++) {
    if(usersArr[i].getID() != profile.getID()) {
      
      userListArr.push(usersArr[i].getID());
    }
  }

  let self = this;

  profile.isFriend(userListArr, (err, res) => {
    if(err) {
      return callback(err);
    }

    if(!res) {
      return callback(null, null);
    }

    for(let i = 0; i < res.length; i++) {
      let fInfoObj = res[i];

      if(fInfoObj[PF.ISFRIEND] == true) {

        if(!self._friends[profile.getID()]) {
          self._friends[profile.getID()] = {};
        }

        self._friends[profile.getID()][fInfoObj[PF.ID]] = true;

        if(!self._friends[fInfoObj[PF.ID]]) {
          self._friends[fInfoObj[PF.ID]] = {};
        }

        self._friends[fInfoObj[PF.ID]][profile.getID()] = true;
      }
    }
    
    if(! self._game.isActive()) {
      self.sendRoomInfo(profile.getID());
    }

    callback(null, null);
  });
};
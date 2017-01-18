/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Добавить (связать) профиль
 *
 * @param profile - профиль
 */

const async  = require('async');
const constants = require('./../../constants'),
    logger    = require('./../../../lib/log')(module);
const PF = constants.PFIELDS;

const Config    = require('./../../../config.json');

const GUY = Config.user.constants.sex.male;

module.exports = function (profile, callback) {
  
  this._ranks.addProfile(profile);
  // this._ranks.addEmits(profile.getSocket());
  // this._mplayer.addEmits(profile.getSocket());
  
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
  
  let arr = (sex == GUY)? this._guys_indexes : this._girls_indexes;
  arr.sort(function (i1, i2) { return i1 - i2; });
  
  let index = arr[0];
  
  arr.splice(0, 1);
  
  profile.setGameIndex(index);
  
  profile.setGame(this._game);
  
  let users = this.getAllPlayers();
  let userList = [];
  for(let i = 0; i < users.length; i++) {
    if(users[i].getID() != profile.getID()) {
      userList.push(users[i].getID());
    }
  }

  var self = this;

  profile.isFriend(userList, function (err, res) {
    if(err) { return callback(err); }

    if(!res) { return callback(null, null); }

    for(let i = 0; i < res.length; i++) {
      let fInfo = res[i];

      if(fInfo[PF.ISFRIEND] == true) {

        if(!self._friends[profile.getID()]) {
          self._friends[profile.getID()] = {};
        }

        self._friends[profile.getID()][fInfo[PF.ID]] = true;

        if(!self._friends[fInfo[PF.ID]]) {
          self._friends[fInfo[PF.ID]] = {};
        }

        self._friends[fInfo[PF.ID]][profile.getID()] = true;
      }
    }
    
    if(! self._game.isActive()) {
      self.sendRoomInfo(profile.getID());
    }

    callback(null, null);
  });
};
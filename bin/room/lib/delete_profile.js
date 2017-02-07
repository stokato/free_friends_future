/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Удалить (отвязать) профиль
 *
 * @param sex - пол пользователя, @profile - его профиль
 */

const logger    = require('./../../../lib/log')(module);
const Config    = require('./../../../config.json');

module.exports = function (profile) {
  
  const GUY = Config.user.constants.sex.male;
  
  this._ranks.deleteProfile(profile);
  
  let sex = profile.getSex();
  if(sex == GUY) {
    delete  this._guys[profile.getID()];
    this._guys_count--;
  } else {
    delete this._girls[profile.getID()];
    this._girls_count--;
  }
  
  let socket = profile.getSocket();
  if(socket) {
    socket.leave(this._nameOfRoom, () => {});
  } else {
    logger.error("Room_delete_profile : Не удалось получить сокет профиля");
  }
  
  let indexArr = (sex == GUY)? this._guys_indexes : this._girls_indexes;
  
  indexArr.push(profile.getGameIndex());

  for(let item in this._friends) if(this._friends.hasOwnProperty(item)) {
    if(item == profile.getID()) {
      delete this._friends[item];
    } else {
      delete this._friends[item][profile.getID()];
    }
  }
  
  if(!this._game.isActive()) {
    this.sendRoomInfo();
  }
  
  profile.hideGifts();
  
  if(this._onDeleteProfile) {
    this._onDeleteProfile(profile);
  }
  
};
/**
 * Created by Durov on 03.01.2017.
 */

const Config    = require('./../../../config.json');

const GUY = Config.user.constants.sex.male;
const GIRL = Config.user.constants.sex.female;
const PF = require('./../../const_fields');

module.exports = function (uid) {
  let self = this;

  let info = {
    name : this.getName(),
    title: this._title,
    guys : this.getUsersInfo(GUY),
    girls : this.getUsersInfo(GIRL),
    track_list : this._mplayer.getTrackList()
  };

  fillFriendsInfo(info.guys);
  fillFriendsInfo(info.girls);

  return info;

  //----------------------------------------
  function fillFriendsInfo(arr) {
    for(let i = 0; i < arr.length; i++) {
      let fid = arr[i][PF.ID];

      if(self._friends[uid] && self._friends[uid][fid]) {
        arr[i][PF.ISFRIEND] = true;
      } else (arr[i][PF.ISFRIEND] = false);
    }
  }
};
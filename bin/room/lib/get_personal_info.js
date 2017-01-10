/**
 * Created by Durov on 03.01.2017.
 */

const constants = require('./../../constants');
const PF = constants.PFIELDS;

module.exports = function (uid) {
  let self = this;

  let info = {
    name : this.getName(),
    title: this._title,
    guys : this.getUsersInfo(constants.GUY),
    girls : this.getUsersInfo(constants.GIRL),
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
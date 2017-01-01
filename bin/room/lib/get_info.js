/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Получаем сведения о комнате
 *
 * @return roomInfo
 */

const constants = require('./../../constants');

module.exports = function () {
  return {
    name : this.getName(),
    title: this._title,
    guys : this.getUsersInfo(constants.GUY),
    girls : this.getUsersInfo(constants.GIRL),
    track_list : this._mplayer.getTrackList()
  };
};
/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

var constants = require('./../../constants');

/*
    Получаем сведения о комнате
 */
module.exports = function () {
  return {
    name : this.getName(),
    guys : this.getUsersInfo(constants.GUY),
    girls : this.getUsersInfo(constants.GIRL),
    track_list : this._mplayer.getTrackList()
  };
};
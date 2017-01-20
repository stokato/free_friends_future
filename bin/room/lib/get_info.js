/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Получаем сведения о комнате
 *
 * @return roomInfo
 */

const Config    = require('./../../../config.json');

module.exports = function () {
  
  const GUY = Config.user.constants.sex.male;
  const GIRL = Config.user.constants.sex.female;
  
  return {
    name : this.getName(),
    title: this._title,
    guys : this.getUsersInfo(GUY),
    girls : this.getUsersInfo(GIRL),
    track_list : this._mplayer.getTrackList()
  };
};
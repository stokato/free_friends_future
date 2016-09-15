var constants = require('./../../constants'),
  sendUsersInRoom = require('./send_users_in_room'),
  GameError       = require('../../game_error'),
  getRoomInfo     = require('./get_room_info');

var oPool = require('./../../objects_pool');

module.exports = function(id) {
  setTimeout(function () {
    var profile = oPool.profiles[id];
    if(profile) {
      profile.clearGiftInfo(function() {
        var room = oPool.roomList[profile.getSocket().id];

        getRoomInfo(room, function (err, roomInfo) {
          if (err) { return new GameError(socket, constants.IO_MAKE_GIFT, err.message || constants.errors.OTHER.message); }

          sendUsersInRoom(roomInfo, null, function(err, roomInfo) {
            if(err) { return new GameError(socket, constants.IO_MAKE_GIFT, err.message || constants.errors.OTHER.message); }

          });
        });
      });
    }
  }, constants.GIFT_TIMEOUT);
};
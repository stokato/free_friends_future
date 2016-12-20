/**
 * Вешаем эмиты на указанный сокет
 *
 * @param socket
 */

var constants     = require('../../../constants');

var emitDisconnect      = require('./emit_disconnect');
var createCustomEvent   = require('./create_custom_emit');

var addTorFriend        = require('../profile/add_to_friends'),
    delFromFriends      = require('../profile/del_from_friends'),
    addToMenu           = require('../profile/add_to_menu'),
    addTrack            = require('../player/add_track'),
    likeTrack           = require('../player/like_track'),
    dislikeTrack        = require('../player/dislike_track'),
    getTrackList        = require('../player/get_track_list'),
    getLikesDislikes    = require('../player/get_likers_dislikers'),
    changeRoom          = require('../novigation/change_room'),
    changeStatus        = require('../profile/change_status'),
    chooseRoom          = require('../novigation/choose_room'),
    openPrivateChat     = require('../chat/open_private_chat'),
    closePrivateChat    = require('../chat/close_private_chat'),
    getChatHistory      = require('../chat/get_chat_history'),
    getGiftShop         = require('../store/get_gift_shop'),
    getMoney            = require('../profile/get_money'),
    getMoneyShop        = require('../store/get_money_shop'),
    getProfile          = require('../profile/get_profile'),
    getRooms            = require('../novigation/get_rooms'),
    getTop              = require('../top/get_top'),
    makeGift            = require('../chat/make_gift'),
    sendMessage         = require('../chat/send_message'),
    addQuestion         = require('../questions/add_question'),
    likeProfile         = require('../profile/like_profile'),
    setViewed           = require('../profile/set_viewed'),
    blockUser           = require('../profile/block_user'),
    unblockUser         = require('../profile/unblock_user');

// Назначаем эмиты
module.exports = function(socket) {
  
  var emitList = [
    { emit : constants.IO_ADD_FRIEND,           handler : addTorFriend },
    { emit : constants.IO_DEL_FROM_FRIENDS,     handler : delFromFriends },
    { emit : constants.IO_ADD_TO_MENU,          handler : addToMenu },
    { emit : constants.IO_ADD_TRECK,            handler : addTrack },
    { emit : constants.IO_LIKE_TRACK,           handler : likeTrack },
    { emit : constants.IO_DISLIKE_TRACK,        handler : dislikeTrack },
    { emit : constants.IO_GET_TRACK_LIST,       handler : getTrackList },
    { emit : constants.IO_GET_LIKES_AND_DISLAKES, handler : getLikesDislikes },
    { emit : constants.IO_CHANGE_ROOM,          handler : changeRoom },
    { emit : constants.IO_CHANGE_STATUS,        handler : changeStatus },
    { emit : constants.IO_CHOOSE_ROOM,          handler : chooseRoom },
    { emit : constants.IO_OPEN_PRIVATE_CHAT,    handler : openPrivateChat },
    { emit : constants.IO_CLOSE_PRIVATE_CHAT,   handler : closePrivateChat },
    { emit : constants.IO_GET_CHAT_HISTORY,     handler : getChatHistory },
    { emit : constants.IO_GET_GIFT_SHOP,        handler : getGiftShop },
    { emit : constants.IO_GET_MONEY,            handler : getMoney },
    { emit : constants.IO_GET_MONEY_SHOP,       handler : getMoneyShop },
    { emit : constants.IO_GET_PROFILE,          handler : getProfile },
    { emit : constants.IO_GET_ROOMS,            handler : getRooms },
    { emit : constants.IO_GET_TOP,              handler : getTop },
    { emit : constants.IO_MAKE_GIFT,            handler : makeGift },
    { emit : constants.IO_MESSAGE,              handler : sendMessage, withoutStatus : true },
    { emit : constants.IO_ADD_QUESTION,         handler : addQuestion },
    { emit : constants.IO_LIKE_PROFILE,         handler : likeProfile },
    { emit : constants.IO_SET_VIEWED,           handler : setViewed },
    { emit : constants.IO_BLOCK_USER,           handler : blockUser },
    { emit : constants.IO_UNBLOCK_USER,         handler : unblockUser }
  ];
  
  for(var i = 0; i < emitList.length; i++) {
    createCustomEvent(socket, emitList[i].emit, emitList[i].handler, emitList[i].withoutStatus );
  }
  
  emitDisconnect(socket);
};
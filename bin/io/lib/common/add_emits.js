/**
 * Вешаем эмиты на указанный сокет
 *
 * @param socket
 */

const Config          = require('../../../../config.json');
const ioc             = require('./../../../io_controller');

const  closeConnection      = require('./../profile/close_connection');

const   addTorFriend        = require('../profile/add_to_friends'),
        delFromFriends      = require('../profile/del_from_friends'),
        addToMenu           = require('../profile/add_to_menu'),
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
        addQuestion         = require('../profile/add_question'),
        likeProfile         = require('../profile/like_profile'),
        setViewed           = require('../profile/set_viewed'),
        blockUser           = require('../profile/block_user'),
        unblockUser         = require('../profile/unblock_user');

const EMITS = Config.io.emits;

// Назначаем эмиты
module.exports = function(socket) {
  
  ioc.setEmit(socket, EMITS.IO_ADD_FRIEND, addTorFriend);
  ioc.setEmit(socket, EMITS.IO_DEL_FROM_FRIENDS, delFromFriends);
  ioc.setEmit(socket, EMITS.IO_ADD_TO_MENU, addToMenu);
  ioc.setEmit(socket, EMITS.IO_CHANGE_ROOM, changeRoom);
  ioc.setEmit(socket, EMITS.IO_CHANGE_STATUS, changeStatus);
  ioc.setEmit(socket, EMITS.IO_CHOOSE_ROOM, chooseRoom);
  ioc.setEmit(socket, EMITS.IO_OPEN_PRIVATE_CHAT, openPrivateChat);
  ioc.setEmit(socket, EMITS.IO_CLOSE_PRIVATE_CHAT, closePrivateChat);
  ioc.setEmit(socket, EMITS.IO_GET_CHAT_HISTORY, getChatHistory);
  ioc.setEmit(socket, EMITS.IO_GET_GIFT_SHOP, getGiftShop);
  ioc.setEmit(socket, EMITS.IO_GET_MONEY, getMoney);
  ioc.setEmit(socket, EMITS.IO_GET_MONEY_SHOP, getMoneyShop);
  ioc.setEmit(socket, EMITS.IO_GET_PROFILE, getProfile);
  ioc.setEmit(socket, EMITS.IO_GET_ROOMS, getRooms);
  ioc.setEmit(socket, EMITS.IO_GET_TOP, getTop);
  ioc.setEmit(socket, EMITS.IO_MAKE_GIFT, makeGift);
  ioc.setEmit(socket, EMITS.IO_MESSAGE, sendMessage);
  ioc.setEmit(socket, EMITS.IO_ADD_QUESTION, addQuestion);
  ioc.setEmit(socket, EMITS.IO_LIKE_PROFILE, likeProfile);
  ioc.setEmit(socket, EMITS.IO_SET_VIEWED, setViewed);
  ioc.setEmit(socket, EMITS.IO_BLOCK_USER, blockUser);
  ioc.setEmit(socket, EMITS.IO_UNBLOCK_USER, unblockUser);
  
  closeConnection(socket);
};
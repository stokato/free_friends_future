/**
 * Вешаем эмиты на указанный сокет
 *
 * @param socket
 */

const Config            = require('../../../../config.json');
const ioc               = require('./../../../io_controller');

const  closeConnection  = require('./../profile/close_connection');

const  addTorFriend     = require('../profile/add_to_friends');
const  delFromFriends   = require('../profile/del_from_friends');
const  addToMenu        = require('../profile/add_to_menu');
const  changeRoom       = require('../novigation/change_room');
const  changeStatus     = require('../profile/change_status');
const  chooseRoom       = require('../novigation/choose_room');
const  openPrivateChat  = require('../chat/open_private_chat');
const  closePrivateChat = require('../chat/close_private_chat');
const  getChatHistory   = require('../chat/get_chat_history');
const  getGiftShop      = require('../store/get_gift_shop');
const  getMoney         = require('../profile/get_money');
const  getMoneyShop     = require('../store/get_money_shop');
const  getProfile       = require('../profile/get_profile');
const  getRooms         = require('../novigation/get_rooms');
const  getTop           = require('../top/get_top');
const  makeGift         = require('../chat/make_gift');
const  sendMessage      = require('../chat/send_message');
const  addQuestion      = require('../profile/add_question');
const  likeProfile      = require('../profile/like_profile');
const  setViewed        = require('../profile/set_viewed');
const  blockUser        = require('../profile/block_user');
const  unblockUser      = require('../profile/unblock_user');
const  likeMessage      = require('../chat/like_message');

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
  ioc.setEmit(socket, EMITS.IO_LIKE_MESSAGE, likeMessage);
  
  closeConnection(socket);
};
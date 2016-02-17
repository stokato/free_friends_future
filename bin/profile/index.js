var db        = require('./../db/index.js');
var dbManager = new db();

var init          = require('./lib/init');
var addGift       = require('./lib/add_gift');
var addMessage    = require('./lib/add_message');
var addPoints     = require('./lib/add_points');
var addToFriends  = require('./lib/add_to_friends');
var addToGuests   = require('./lib/add_to_guests');
var build         = require('./lib/build');
var getFriends    = require('./lib/get_friends');
var getSex        = require('./lib/get_gender');
var getGifts      = require('./lib/get_gifts');
var getGuests     = require('./lib/get_guests');
var getHistory    = require('./lib/get_history');
var getPrivateChats = require('./lib/get_private_chats');
var getID         = require('./lib/get_id');
var getMoney      = require('./lib/get_money');
var getNews       = require('./lib/get_news');
var getPoints     = require('./lib/get_points');
var getSocket     = require('./lib/get_socket');
var getStatus     = require('./lib/get_status');
var getVID        = require('./lib/get_vid');
var openMessage   = require('./lib/open_message');
var remove        = require('./lib/remove');
var save          = require('./lib/save');
var setMoney      = require('./lib/set_money');
var setStatus     = require('./lib/set_status');
var setSocket     = require('./lib/set_socket');
var addPrivateChat = require('./lib/add_private_chat');
var deletePrivateChat = require('./lib/delete_private_chat');
var isPrivateChat = require('./lib/is_private_chat');


var setExitTimeout = require('./lib/set_exit_timeout');
var clearExitTimeout = require('./lib/clear_exit_timeout');

/**
 * Класс профиль пользователя, хранит, обменивается с базой и обрабатывает данные о пользователе
 * Свойства: ИД, имя, аватар, возраст, местоположение, статус, пол, очки, деньги (подарки, которы висят на столе ???)
 * Методы: инициализировать - ищет данные о пользователе в базе, если нет - создает новый и заполняет профиль
 *         установить статус, получить статус, установить инф. (прочие свойства), получить инф.,
 *         добавить подарок, получить все подарки,
 *         добавить сообщиение в историю, получить все (или n) сообщений из истории,
 *         добавить друга, получить друзей,
 *         добавить гостя, получить госте,
 *         сохранить текущий профиль в базу,
 *         удалить текущий профиль из базы и очистить все свойства
 */
function Profile() {
  this.dbManager = dbManager;
  this.pSocket   = null;   // Сокет

  this.pID       = null;   // Внутренний ИД
  this.pVID      = null;   // Внешний

  this.pAge      = 0;      // Возраст
  this.pCountry  = null;   // Страна
  this.pCity     = null;   // Город

  this.pSex      = null;   // пол игрока (1 - женский, 2 - мужской)
  this.pStatus   = null;   // статус (заводит игрок)
  this.pPoints   = 0;      // очки
  this.pMoney    = 0;      // деньги

  this.pReady    = false;

  this.pNewMessages = 0;
  this.pNewGifts    = 0;
  this.pNewFriends  = 0;
  this.pNewGuests   = 0;

  this.pPrivateChats = [];  // Сприсок открытых приватных чатов

  this.pExitTimeout;

  this.gift_1   = null;    // На игрвом столе на аватарах игроков весят подарки, по ним не ясно
  this.gift_2   = null;
}

Profile.prototype.init            = init;
Profile.prototype.build           = build;
Profile.prototype.getSocket       = getSocket;
Profile.prototype.getMoney        = getMoney;
Profile.prototype.getID           = getID;
Profile.prototype.getVID          = getVID;
Profile.prototype.getStatus       = getStatus;
Profile.prototype.getPoints       = getPoints;
Profile.prototype.getNews         = getNews;
Profile.prototype.getSex          = getSex;
Profile.prototype.addGift         = addGift;
Profile.prototype.getGifts        = getGifts;
Profile.prototype.addMessage      = addMessage;
Profile.prototype.getHistory      = getHistory;
Profile.prototype.openMessage     = openMessage;
Profile.prototype.addPoints       = addPoints;
Profile.prototype.setMoney        = setMoney;
Profile.prototype.setStatus       = setStatus;
Profile.prototype.setSocket      =  setSocket;
Profile.prototype.addToFriends    = addToFriends;
Profile.prototype.getFriends      = getFriends;
Profile.prototype.addToGuests     = addToGuests;
Profile.prototype.getGuests       = getGuests;
Profile.prototype.save            = save;
Profile.prototype.remove          = remove;

Profile.prototype.setExitTimeout = setExitTimeout;
Profile.prototype.clearExitTimeout = clearExitTimeout;
Profile.prototype.addPrivateChat = addPrivateChat;
Profile.prototype.deletePrivateChat = deletePrivateChat;
Profile.prototype.isPrivateChat = isPrivateChat;
Profile.prototype.getPrivateChats = getPrivateChats;

module.exports = Profile;

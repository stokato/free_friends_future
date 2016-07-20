var db        = require('./../db/index.js'),
    dbManager = new db();

var init          = require('./lib/init'),
    addGift       = require('./lib/add_gift'),
    addMessage    = require('./lib/add_message'),
    addPoints     = require('./lib/add_points'),
    addToFriends  = require('./lib/add_to_friends'),
    addToGuests   = require('./lib/add_to_guests'),
    build         = require('./lib/build'),
    getFriends    = require('./lib/get_friends'),
    getSex        = require('./lib/get_sex'),
    getGifts      = require('./lib/get_gifts'),
    getGuests     = require('./lib/get_guests'),
    getPrivateChats    = require('./lib/get_private_chats'),
    getPrivateChatsWithHistory = require('./lib/get_private_chats_with_history'),
    getHistory    = require('./lib/get_history'),
    getID         = require('./lib/get_id'),
    getMoney      = require('./lib/get_money'),
    getNews       = require('./lib/get_news'),
    getPoints     = require('./lib/get_points'),
    getSocket     = require('./lib/get_socket'),
    getStatus     = require('./lib/get_status'),
    getVID        = require('./lib/get_vid'),
    remove        = require('./lib/remove'),
    save          = require('./lib/save'),
    setMoney      = require('./lib/set_money'),
    setStatus     = require('./lib/set_status'),
    setSocket     = require('./lib/set_socket'),
    addPrivateChat = require('./lib/add_private_chat'),
    deletePrivateChat = require('./lib/delete_private_chat'),
    isPrivateChat = require('./lib/is_private_chat'),
    getAge        = require('./lib/get_age'),
    getCity       = require('./lib/get_city'),
    getCountry    = require('./lib/get_country'),
    getPurchase    = require('./lib/get_purchase'),
    setGame       = require('./lib/set_game'),
    getGame       = require('./lib/get_game'),
    setGameIndex  = require('./lib/set_game_index'),
    getGameIndex  = require('./lib/get_game_index'),
    isFriend      = require('./lib/is_friend'),
    isInMenu      = require('./lib/is_in_menu'),
    setInMenu     = require('./lib/set_in_menu'),
    delFromFriends = require('./lib/del_from_friends');

var setExitTimeout = require('./lib/set_exit_timeout'),
    clearExitTimeout = require('./lib/clear_exit_timeout');

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

  this.pID           = null;   // Внутренний ИД
  this.pVID          = null;   // Внешний
  this.pBDate        = null;

  this.pAge      = 0;      // Возраст
  this.pCountry  = null;   // Страна
  this.pCity     = null;   // Город
  this.pSex      = null;   // пол игрока (1 - женский, 2 - мужской)

  this.pStatus   = null;   // статус (заводит игрок)
  this.pPoints   = 0;      // очки
  this.pMoney    = 0;      // деньги (БД)



  this.pNewMessages = 0;
  this.pNewGifts    = 0;
  this.pNewFriends  = 0;
  this.pNewGuests   = 0;

  this.pPrivateChats = [];  // Сприсок открытых приватных чатов

  this.pExitTimeout;

  this.gift_1   = null;    // На игрвом столе на аватарах игроков весят подарки, по ним не ясно
  this.gift_2   = null;

  this.pGame    = null;

  this.gameIndex = 0;

  this.pIsInMenu = false;

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
Profile.prototype.getPrivateChats = getPrivateChats;
Profile.prototype.getHistory      = getHistory;
//Profile.prototype.addPoints       = addPoints;
Profile.prototype.setMoney        = setMoney;
Profile.prototype.setStatus       = setStatus;
Profile.prototype.setSocket       = setSocket;
Profile.prototype.addToFriends    = addToFriends;
Profile.prototype.getFriends      = getFriends;
Profile.prototype.addToGuests     = addToGuests;
Profile.prototype.getGuests       = getGuests;
Profile.prototype.save            = save;
Profile.prototype.remove          = remove;
Profile.prototype.getPurchase      = getPurchase;

Profile.prototype.setExitTimeout             = setExitTimeout;
Profile.prototype.clearExitTimeout           = clearExitTimeout;
Profile.prototype.addPrivateChat             = addPrivateChat;
Profile.prototype.deletePrivateChat          = deletePrivateChat;
Profile.prototype.isPrivateChat              = isPrivateChat;
Profile.prototype.getPrivateChatsWithHistory = getPrivateChatsWithHistory;

Profile.prototype.getAge     = getAge;
Profile.prototype.getCity    = getCity;
Profile.prototype.getCountry = getCountry;
Profile.prototype.setGame    = setGame;
Profile.prototype.getGame    = getGame;
Profile.prototype.addPoints  = addPoints;
Profile.prototype.setGameIndex = setGameIndex;
Profile.prototype.getGameIndex = getGameIndex;

Profile.prototype.isFriend = isFriend;
Profile.prototype.isInMenu = isInMenu;
Profile.prototype.setInMenu = setInMenu;
Profile.prototype.delFromFriends = delFromFriends;

module.exports = Profile;

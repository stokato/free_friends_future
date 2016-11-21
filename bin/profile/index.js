
var init                            = require('./lib/init/init'),
    addGift                         = require('./lib/db_dap/add_gift'),
    addMessage                      = require('./lib/db_dap/add_message'),
    addPoints                       = require('./lib/db_dap/add_points'),
    addToFriends                    = require('./lib/db_dap/add_to_friends'),
    addToGuests                     = require('./lib/db_dap/add_to_guests'),
    build                           = require('./lib/init/build'),
    getFriends                      = require('./lib/db_dap/get_friends'),
    getGifts                        = require('./lib/db_dap/get_gifts'),
    getGuests                       = require('./lib/db_dap/get_guests'),
    getPrivateChats                 = require('./lib/db_dap/get_private_chats'),
    getPrivateChatsWithHistory      = require('./lib/db_dap/get_private_chats_with_history'),
    getHistory                      = require('./lib/db_dap/get_history'),
    getMoney                        = require('./lib/db_dap/get_money'),
    getNews                         = require('./lib/db_undep/get_news'),
    remove                          = require('./lib/db_dap/remove'),
    save                            = require('./lib/db_dap/save'),
    setMoney                        = require('./lib/db_dap/set_money'),
    pay                             = require('./lib/db_dap/pay'),
    setStatus                       = require('./lib/db_dap/set_status'),
    addPrivateChat                  = require('./lib/db_undep/add_private_chat'),
    deletePrivateChat               = require('./lib/db_undep/delete_private_chat'),
    isPrivateChat                   = require('./lib/db_undep/is_private_chat'),
    isFriend                        = require('./lib/db_dap/is_friend'),
    setInMenu                       = require('./lib/db_dap/set_in_menu'),
    delFromFriends                  = require('./lib/db_dap/del_from_friends'),
    clearGiftInfo                   = require('./lib/db_dap/clear_gift_info'),
    view                            = require('./lib/db_dap/view');

var clearExitTimeout                = require('./lib/db_undep/clear_exit_timeout');

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
  this._pSoket   = null;   // Сокет

  this._pID           = null;   // Внутренний ИД
  this._pVID          = null;   // Внешний
  this._pBDate        = null;

  this._pAge      = 0;      // Возраст
  this._pCountry  = null;   // Страна
  this._pCity     = null;   // Город
  this._pSex      = null;   // пол игрока (1 - женский, 2 - мужской)

  this._pStatus   = null;   // статус (заводит игрок)
  this._pPoints   = 0;      // очки
  this._pMoney    = 0;      // деньги (БД)



  this._pIsNewMessages = 0;
  this._pIsNewGifts    = 0;
  this._pIsNewFriends  = 0;
  this._pIsNewGuests   = 0;

  this._pIsPrivateChats = [];  // Сприсок открытых приватных чатов

  this._pIsExitTimeout;

  this._pGift1   = null;    // На игрвом столе на аватарах игроков весят подарки
  this._pGift1Time = null;

  this._pGift2   = null;

  this._pGame    = null;

  this._pGameIndex = 0;

  this._pIsInMenu = false;

}

Profile.prototype.getSocket       = function() { return this._pSoket; };
Profile.prototype.getID           = function() { return this._pID; };
Profile.prototype.getVID          = function() { return this._pVID; };
Profile.prototype.getStatus       = function() { return this._pStatus; };
Profile.prototype.getPoints       = function() { return this._pPoints; };
Profile.prototype.getSex          = function() { return this._pSex; };
Profile.prototype.getAge          = function() { return this._pAge; };
Profile.prototype.getCity         = function() { return this._pCity; };
Profile.prototype.getCountry      = function() { return this._pCountry; };
Profile.prototype.getGame         = function() { return this._pGame; };
Profile.prototype.isInMenu        = function() { return this._pIsInMenu; };
Profile.prototype.getGameIndex    = function() { return this._pGameIndex; };
Profile.prototype.getGift1        = function() { return this._pGift1; };

Profile.prototype.setGameIndex    = function(val)     { this._pGameIndex = val; };
Profile.prototype.setGame         = function(game)    { this._pGame = game; };
Profile.prototype.setSocket       = function(socket)  { this._pSoket = socket; };
Profile.prototype.setExitTimeout  = function(tm)      { this._pIsExitTimeout = tm; };

Profile.prototype.init            = init;
Profile.prototype.build           = build;
Profile.prototype.getMoney        = getMoney;
Profile.prototype.getNews         = getNews;
Profile.prototype.addGift         = addGift;
Profile.prototype.getGifts        = getGifts;
Profile.prototype.addMessage      = addMessage;
Profile.prototype.getPrivateChats = getPrivateChats;
Profile.prototype.getHistory      = getHistory;
Profile.prototype.setMoney        = setMoney;
Profile.prototype.setStatus       = setStatus;
Profile.prototype.addPoints       = addPoints;

Profile.prototype.addToFriends    = addToFriends;
Profile.prototype.getFriends      = getFriends;
Profile.prototype.addToGuests     = addToGuests;
Profile.prototype.getGuests       = getGuests;
Profile.prototype.save            = save;
Profile.prototype.remove          = remove;

Profile.prototype.clearExitTimeout           = clearExitTimeout;
Profile.prototype.addPrivateChat             = addPrivateChat;
Profile.prototype.deletePrivateChat          = deletePrivateChat;
Profile.prototype.isPrivateChat              = isPrivateChat;
Profile.prototype.getPrivateChatsWithHistory = getPrivateChatsWithHistory;

Profile.prototype.isFriend = isFriend;
Profile.prototype.setInMenu = setInMenu;
Profile.prototype.delFromFriends = delFromFriends;
Profile.prototype.clearGiftInfo = clearGiftInfo;
Profile.prototype.pay = pay;
Profile.prototype.view = view;

module.exports = Profile;

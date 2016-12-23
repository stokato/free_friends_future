/**
 * Класс профиль пользователя, хранит, обменивается с базой и обрабатывает данные о пользователе
 * Свойства: ИД, имя, аватар, возраст, местоположение, статус, пол, очки, деньги, подарки, которые висят на столе
 * Методы: инициализировать - ищет данные о пользователе в базе, если нет - создает новый и заполняет профиль
 *         установить статус, получить статус, установить инф. (прочие свойства), получить инф.,
 *         добавить подарок, получить все подарки,
 *         добавить сообщиение в историю, получить все (или n) сообщений из истории,
 *         добавить друга, получить друзей,
 *         добавить гостя, получить госте,
 *         сохранить текущий профиль в базу,
 *         удалить текущий профиль из базы и очистить все свойства,
 *         добавить очки пользователю,
 *         добавить приватный чат,
 *         убрить подарок из профиля,
 *         удалить из друзей,
 *         проветить - являются ли пользователи из списка друзьями,
 *         получить исторюи сообщений,
 *         снять монеты с баланса,
 *         установить признак - есть  в меню,
 *         установить признак - посмторено, для новых друзей, гостей или подарков
 */

var init                            = require('./lib/init'),
    addGift                         = require('./lib/add_gift'),
    addMessage                      = require('./lib/add_message'),
    addPoints                       = require('./lib/add_points'),
    addToFriends                    = require('./lib/add_to_friends'),
    addToGuests                     = require('./lib/add_to_guests'),
    build                           = require('./lib/build'),
    getFriends                      = require('./lib/get_friends'),
    getGifts                        = require('./lib/get_gifts'),
    getGuests                       = require('./lib/get_guests'),
    getPrivateChats                 = require('./lib/get_private_chats'),
    getPrivateChatsWithHistory      = require('./lib/get_private_chats_with_history'),
    getHistory                      = require('./lib/get_history'),
    getMoney                        = require('./lib/get_money'),
    remove                          = require('./lib/remove'),
    save                            = require('./lib/save'),
    setMoney                        = require('./lib/set_money'),
    pay                             = require('./lib/pay'),
    earn                            = require('./lib/earn'),
    setStatus                       = require('./lib/set_status'),
    addPrivateChat                  = require('./lib/add_private_chat'),
    deletePrivateChat               = require('./lib/delete_private_chat'),
    isPrivateChat                   = require('./lib/is_private_chat'),
    isFriend                        = require('./lib/is_friend'),
    setInMenu                       = require('./lib/set_in_menu'),
    delFromFriends                  = require('./lib/del_from_friends'),
    clearGiftInfo                   = require('./lib/clear_gift_info'),
    view                            = require('./lib/view'),
    addToBlackList                  = require('./lib/add_to_black_list'),
    deleteFromBlackList             = require('./lib/delete_from_black_list'),
    isInBlackList                   = require('./lib/is_in_black_list'),
    getStat                         = require('./lib/get_stat'),
    addQuestion                     = require('./lib/add_question'),
    setLevel                        = require('./lib/set_level'),
    setFreeGifts                    = require('./lib/set_free_gifts'),
    setFreeMusic                    = require('./lib/set_free_music'),
    setVIP                          = require('./lib/set_vip');

var constants = require('./../constants');

function Profile() {
  
  this._pSocket       = null;   // Сокет

  this._pID           = null;   // Внутренний ИД
  this._pVID          = null;   // Внешний
  
  this._pBDate        = null;
  this._pCountry      = null;   // Страна
  this._pCity         = null;   // Город
  this._pSex          = null;   // пол игрока (1 - женский, 2 - мужской)

  this._pStatus       = null;   // статус (заводит игрок)
  this._pPoints       = 0;      // очки
  this._pMoney        = 0;      // деньги (БД)

  this._pIsPrivateChats = [];   // Сприсок открытых приватных чатов

  this._pIsExitTimeout  = 0;

  this._pGift1        = null;   // На игрвом столе на аватарах игроков весят подарки
  this._pGift1Time    = null;

  this._pGift2        = null;

  this._pGame         = null;
  this._pGameIndex    = 0;

  this._pIsInMenu     = false;

  this._pBlackList    = {};    // key - id, value - { date - дата блокировки, timer - таймвут }
  
  this._pInitTime     = null;

  this._pLevel        = 0;
  this._pActiveRank   = null;
  
  this._pFreeGifts    = 0;
  this._pFreeMusic    = 0;
  this._pVIP          = false;
  
  this._pOnAddPoints   = null;
}

Profile.prototype.getSocket         = function () { return this._pSocket; };
Profile.prototype.getID             = function () { return this._pID; };
Profile.prototype.getVID            = function () { return this._pVID; };
Profile.prototype.getStatus         = function () { return this._pStatus; };
Profile.prototype.getPoints         = function () { return this._pPoints; };
Profile.prototype.getSex            = function () { return this._pSex; };
Profile.prototype.getAge            = function () {
  if(this._pBDate) {
    return new Date().getYear() - this._pBDate.getYear();
  }
   return null;
};
  
Profile.prototype.getCity           = function () { return this._pCity; };
Profile.prototype.getCountry        = function () { return this._pCountry; };
Profile.prototype.getGame           = function () { return this._pGame; };
Profile.prototype.isInMenu          = function () { return this._pIsInMenu; };
Profile.prototype.getGameIndex      = function () { return this._pGameIndex; };
Profile.prototype.getGift1          = function () { return this._pGift1; };
Profile.prototype.getBDate          = function () { return this._pBDate; };
Profile.prototype.getInitTime       = function () { return this._pInitTime; };
Profile.prototype.setGameIndex      = function (val)     { this._pGameIndex = val; };
Profile.prototype.setGame           = function (game)    { this._pGame = game; };
Profile.prototype.setSocket         = function (socket)  { this._pSocket = socket; };
Profile.prototype.setExitTimeout    = function (tm)      { this._pIsExitTimeout = tm; };
Profile.prototype.clearExitTimeout  = function () { clearTimeout(this._pIsExitTimeout); };
Profile.prototype.getLevel          = function () { return this._pLevel; };
Profile.prototype.getFreeGifts      = function () { return this._pFreeGifts; };
Profile.prototype.getFreeMusic      = function () { return this._pFreeMusic; };
Profile.prototype.isVIP             = function () { return this._pVIP; };
Profile.prototype.setActiveRank     = function (rank) { this._pActiveRank = rank; };
Profile.prototype.getActiveRank     = function () { return this._pActiveRank; };

Profile.prototype.setOnAddPoints    = function (handler) { this._pOnAddPoints = handler; };

Profile.prototype.init              = init;
Profile.prototype.build             = build;
Profile.prototype.getMoney          = getMoney;
Profile.prototype.addGift           = addGift;
Profile.prototype.getGifts          = getGifts;
Profile.prototype.addMessage        = addMessage;
Profile.prototype.getPrivateChats   = getPrivateChats;
Profile.prototype.getHistory        = getHistory;
Profile.prototype.setMoney          = setMoney;
Profile.prototype.setStatus         = setStatus;
Profile.prototype.addPoints         = addPoints;

Profile.prototype.addToFriends      = addToFriends;
Profile.prototype.getFriends        = getFriends;
Profile.prototype.addToGuests       = addToGuests;
Profile.prototype.getGuests         = getGuests;
Profile.prototype.save              = save;
Profile.prototype.remove            = remove;

Profile.prototype.addPrivateChat             = addPrivateChat;
Profile.prototype.deletePrivateChat          = deletePrivateChat;
Profile.prototype.isPrivateChat              = isPrivateChat;
Profile.prototype.getPrivateChatsWithHistory = getPrivateChatsWithHistory;

Profile.prototype.isFriend          = isFriend;
Profile.prototype.setInMenu         = setInMenu;
Profile.prototype.delFromFriends    = delFromFriends;
Profile.prototype.clearGiftInfo     = clearGiftInfo;
Profile.prototype.pay               = pay;
Profile.prototype.earn              = earn;
Profile.prototype.view              = view;
Profile.prototype.addToBlackList    = addToBlackList;
Profile.prototype.delFromBlackList  = deleteFromBlackList;
Profile.prototype.isInBlackList     = isInBlackList;
Profile.prototype.getStat           = getStat;
Profile.prototype.addQuestion       = addQuestion;
Profile.prototype.setLevel          = setLevel;
Profile.prototype.setFreeGifts      = setFreeGifts;
Profile.prototype.setFreeMusic      = setFreeMusic;
Profile.prototype.setVIP            = setVIP;

module.exports = Profile;

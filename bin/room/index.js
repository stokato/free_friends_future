/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * @class Комната
 *
 * @param name - имя комнаты
 *
 * Комната содержит несколько игроков разного пола, экземпляр класса Игра, экземпляр класса Плеер
 * Пердоставляет инструменты для доступа к ним и получения сведений
 */

const Config = require('./../../config.json'),
  constants = require('./../constants'),
    MusicPlayer = require('./../mplayer/index'),
    GameJS = require('./../game/index'),
    RankManager = require('./../ranks/index');

const addProfile      = require('./lib/add_profile'),
    deleteProfile   = require('./lib/delete_profile'),
    getUsersInfo    = require('./lib/common/get_users_info'),
    getInfo         = require('./lib/get_info'),
    getAnySocket    = require('./lib/get_any_socket'),
    getAllPlayers   = require('./lib/get_all_players'),
    randomProfile   = require('./lib/random_profile'),
    getPersonalInfo = require('./lib/get_personal_info'),
    sendRoomInfo          = require('./lib/send_room_info'),
    getCountInRoom  = require('./lib/get_count_in_room'),
    setFriendInfo   = require('./lib/set_friend_info');


const ONE_SEX_IN_ROOM  = Config.io.one_sex_in_room;
/*
    Класс комнаты
 */
function Room(name, title)  {
  
  this._nameOfRoom = name; // Как-нибудь генерируем новое имя (????)
  this._title = title;
  
  // Пользователи в комнате
  this._guys = {};
  this._guys_count = 0;
  this._girls = {};
  this._girls_count= 0;

  this._friends = {}; // key - id : { id : true / false }
  
  // Сообщения в общем чате
  this._messages = [];
  
  this._girls_indexes = [];
  this._guys_indexes  = [];
  
  for(let i = 1; i <= ONE_SEX_IN_ROOM; i++) {
    this._girls_indexes.push(i);
    this._guys_indexes.push(i);
  }

  this._onDeleteProfile = null;
  
  // Игра и позиции игроков на столе
  this._game = new GameJS(this);
  let self = this;
  this._game.setOnStart(function () {
    self.sendRoomInfo();
  });
  
  // Плеер
  this._mplayer = new MusicPlayer();
  
  // Звания
  this._ranks = new RankManager();
}

// Есть ли прфофиль с таким ИД
Room.prototype.isProfile        = function (uid) { return (uid in this._guys || uid in this._girls); };
Room.prototype.setGame          = function (game) { this._game = game; };
Room.prototype.getGame          = function () { return this._game; };
Room.prototype.getName          = function () { return this._nameOfRoom; };
Room.prototype.getMusicPlayer   = function () { return this._mplayer; };
Room.prototype.getMessages      = function () { return this._messages; };
Room.prototype.getRanks         = function () { return this._ranks; };
Room.prototype.setOnDeleteProfile = function (func) { this._onDeleteProfile = func; };

Room.prototype.setFriendInfo    = setFriendInfo;
Room.prototype.addProfile       = addProfile;
Room.prototype.deleteProfile    = deleteProfile;
Room.prototype.getInfo          = getInfo;
Room.prototype.getUsersInfo     = getUsersInfo;
Room.prototype.getAnySocket     = getAnySocket;
Room.prototype.getAllPlayers    = getAllPlayers;
Room.prototype.randomProfile    = randomProfile;
Room.prototype.getPersonalInfo  = getPersonalInfo;
Room.prototype.sendRoomInfo     = sendRoomInfo;
Room.prototype.getCountInRoom   = getCountInRoom;

module.exports = Room;
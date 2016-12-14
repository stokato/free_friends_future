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

var constants = require('./../constants'),
    MusicPlayer = require('./../mplayer/index'),
    GameJS = require('./../game/index');

var addProfile      = require('./lib/add_profile'),
    deleteProfile   = require('./lib/delete_profile'),
    getUsersInfo    = require('./lib/common/get_users_info'),
    getInfo         = require('./lib/get_info'),
    getAnySocket    = require('./lib/get_any_socket'),
    getAllPlayers   = require('./lib/get_all_players'),
    randomProfile   = require('./lib/random_profile');

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
  
  // Сообщения в общем чате
  this._messages = [];
  
  // Игра и позиции игроков на столе
  this._game = new GameJS(this);
  this._girls_indexes = [];
  this._guys_indexes  = [];
  
  // Плеер
  this._mplayer = new MusicPlayer();
  
  for(var i = 1; i <= constants.ONE_SEX_IN_ROOM; i++) {
    this._girls_indexes.push(constants.ONE_SEX_IN_ROOM+i);
    this._guys_indexes.push(i);
  }
  
}

// Есть ли прфофиль с таким ИД
Room.prototype.isProfile = function (uid) {
  return (uid in this._guys || uid in this._girls);
};

// Получить количество человек указанного пола в комнате
Room.prototype.getCountInRoom = function (sex) {
  return (sex == constants.GUY)? this._guys_count : this._girls_count;
};


Room.prototype.setGame        = function (game) { this._game = game; };
Room.prototype.getGame        = function () {  return this._game; };
Room.prototype.getName        = function () {  return this._nameOfRoom; };
Room.prototype.getMusicPlayer = function () {  return this._mplayer; };
Room.prototype.getMessages    = function () {  return this._messages; };

Room.prototype.addProfile     = addProfile;
Room.prototype.deleteProfile  = deleteProfile;
Room.prototype.getInfo        = getInfo;
Room.prototype.getUsersInfo   = getUsersInfo;
Room.prototype.getAnySocket   = getAnySocket;
Room.prototype.getAllPlayers  = getAllPlayers;
Room.prototype.randomProfile  = randomProfile;

module.exports = Room;
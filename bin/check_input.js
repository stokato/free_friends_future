var validator = require('validator');

var GameError = require('./game_error');
var constants_io = require('./io/constants');
var constants_game = require('./game/constants');

var idRegExp = /[A-Za-z0-9]{8}-(?:[A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}/i;
var ID_LEN = 36;

function checkInput(em, socket, userList, options) {
  if(em == constants_io.IO_INIT && userList[socket.id] ) {
    new GameError(socket, em, "Пользователь уже инициализирован");
    return false;
  }
  if(em != constants_io.IO_INIT && !userList[socket.id] ) {
    new GameError(socket, em, "Пользователь не авторизован");
    return false;
  }
  if(!checkOptionsType(options)) {
    new GameError(socket, em, "Не заданы опции");
    return false;
  }

  var isValid = true;
  var val;
  var f = constants_io.FIELDS;

  switch (em) {
    case constants_io.IO_INIT :
      isValid = (validator.isInt(options[f.country] + ""))? isValid : false;
      isValid = (validator.isInt(options[f.city] + ""))? isValid : false;
      isValid = (options[f.sex] + "" == constants_io.GUY ||
                 options[f.sex] + "" == constants_io.GIRL) ? isValid : false;
      isValid = (validator.isDate(options[f.bdate] + "")? isValid : false);

      if(!isValid) {
        new GameError(socket, em, "Некорректно заданы поля: страна, город, пол, дата рождения");
      }
      break;
    case constants_io.IO_MESSAGE :

      break;
    case constants_io.IO_CHANGE_ROOM :

      //isValid = (validator.isAlphanumeric(options.room + ""))? isValid : false;
      break;
    case constants_io.IO_GET_PROFILE :
      isValid = checkID(options[f.id]);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан ИД");
      }
      break;
    case constants_io.IO_PRIVATE_MESSAGE :
      isValid = checkID(options[f.id]);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан ИД");
      }
      break;
    case constants_io.IO_MAKE_GIFT :

      break;
    case constants_io.IO_ADD_FRIEND :
      isValid = checkID(options[f.id]);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан ИД");
      }
      break;
    case constants_io.IO_CHANGE_STATUS :

      //isValid = (validator.isAlphanumeric(options.status))? isValid : false;
      break;
    case constants_io.IO_OPEN_PRIVATE_CHAT :
      isValid = checkID(options[f.id]);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан ИД");
      }
      break;
    case constants_io.IO_GET_CHAT_HISTORY :
      isValid = checkID(options[f.id]);
      isValid = (validator.isDate(options[f.first_date] + "")? isValid : false);
      isValid = (validator.isDate(options[f.second_date] + "")? isValid : false);

      if(!isValid) {
        new GameError(socket, em, "Некорректно заданы поля: ИД, минимальная и максимальная даты выборки");
      }
      break;
    case constants_io.IO_CLOSE_PRIVATE_CHAT :
      isValid = checkID(options[f.id]);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан ИД");
      }
      break;
    case constants_io.IO_GET_TOP :
      if(options[f.points]) {
        val = options[f.points];
        isValid = (validator.isInt(val) && val <= 9 && val >= 0)? isValid : false;
      }

      if(!isValid) {
        new GameError(socket, em, "Некорректно задано количество очков, с которого следует получть топ.");
      }
      break;
    case constants_game.G_BEST :
      isValid = checkID(options[f.pick]);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан ИД игрока, выбранного лучшим.");
      }
      break;
    case constants_game.G_BOTTLE_KISSES :
      isValid = (options[f.pick])? isValid : false;
      isValid = (validator.isBoolean(options[f.pick] + "")? isValid : false);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан выбор игрока, значение должно быть типа boolean.");
      }
      break;
    case constants_game.G_QUESTIONS :
      val = options[f.pick] + "";
      isValid = (options[f.pick])? isValid : false;
      isValid = (val == "1" || val == "2" || val == "3")? isValid : false;

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан выбор игрока, значение должно быть 1, 2 или 3.");
      }
      break;
    case constants_game.G_CARDS :
      val = options[f.pick] + "";
      isValid = (options[f.pick])? isValid : false;
      isValid = (validator.isInt(val) && val <= 6 && val >= 0)? isValid : false;

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан выбор игрока, значение должно быть от 1 до 7.");
      }
      break;
    case constants_game.G_SYMPATHY :
    case constants_game.G_SYMPATHY_SHOW :
      isValid = checkID(options[f.pick]);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан ИД в выборе игрока.");
      }
      break;
    case constants_io.IO_RELEASE_PLAYER :
      isValid = checkID(options[f.id]);

      if(!isValid) {
        new GameError(socket, em, "Некорректно задан ИД");
      }
      break;
  }

  return isValid;
}

module.exports = checkInput;

function checkID(id) {
  var res = (id + "").search(idRegExp);
  return !!(res == 0 && id.length == ID_LEN);
}

function checkOptionsType(options) {
  if (!options) { return false; } else
  if (typeof options != "object") { return false }

  return true;
}
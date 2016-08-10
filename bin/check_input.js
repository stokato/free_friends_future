var validator = require('validator');

var GameError = require('./game_error');
var constants_io = require('./io/constants');
var constants_game = require('./game/constants');
var sanitize        = require('./sanitizer');

var md5 = require('md5');

var idRegExp = /[A-Za-z0-9]{8}-(?:[A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}/i;
var ID_LEN = 36;

function checkInput(em, socket, userList, options, serverProfile) {

  // Подключение сервера
  if(serverProfile && socket.id == serverProfile.id) {
    return true;
  }


  // Попытка повторного подключения
  if(em == constants_io.IO_INIT && userList[socket.id] ) {
    handError(constants_io.errors.NO_AUTH, em);
    return false;
  }

  // Такого пользователя нет
  if(em != constants_io.IO_INIT && !userList[socket.id] ) {
    handError(constants_io.errors.NO_AUTH, em);
    return false;
  }

  // Не переданы опции
  if(!checkOptionsType(options)) {
    handError(constants_io.errors.NO_PARAMS, em);
    return false;
  }

  // Проверка подписи
  //if(!checkAuth(em, socket, userList, options)) {
  //  handError(constants_io.errors.NO_AUTH, em);
  //  return false;
  //}

  var isValid = true;
  var val;

  switch (em) {
    case constants_io.IO_INIT :

                        isValid = (validator.isInt(options.country + ""))?  isValid : false;
                        isValid = (validator.isInt(options.city + ""))?     isValid : false;
                        isValid = (options.sex + "" == constants_io.GUY ||
                                   options.sex + "" == constants_io.GIRL)?  isValid : false;
                        isValid = (validator.isDate(options.bdate + "")?    isValid : false);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно заданы поля: страна, город, пол, дата рождения");
                        }
                        break;

    case constants_io.IO_MESSAGE :


                        options.text = sanitize(options.text);

                        if("id" in options) {
                          options.id = sanitize(options.id);
                        }
                        break;

    case constants_io.IO_CHANGE_ROOM :

                        //isValid = (validator.isAlphanumeric(options.room + ""))? isValid : false;
                        options.room = sanitize(options.room);
                        break;

    case constants_io.IO_GET_PROFILE :
                        isValid = checkID(options.id);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД");
                        }

                        options.id = sanitize(options.id);
                        break;

    case constants_io.IO_PRIVATE_MESSAGE :
                        isValid = checkID(options.id);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД");
                        }
                        break;

    case constants_io.IO_MAKE_GIFT :

                        options.id = sanitize(options.id);
                        break;

    case constants_io.IO_GIVE_MONEY :
                        isValid = checkID(options.id);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД");
                        }

                        isValid = ("money" in options)?             isValid : false;
                        isValid = (validator.isInt(option.money))?  isValid : false;

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задано количество монет");
                        }
                        break;

    case constants_io.IO_ADD_FRIEND :
                        isValid = checkID(options.id);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД");
                        }

                        options.id = sanitize(options.id);
                        break;

    case constants_io.IO_DEL_FROM_FRIENDS :
                        isValid = checkID(options.id);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД");
                        }

                        options.id = sanitize(options.id);
                        break;

    case constants_io.IO_CHANGE_STATUS :

                        //isValid = (validator.isAlphanumeric(options.status))? isValid : false;
                        options.status = sanitize(options.status);
                        break;

    case constants_io.IO_OPEN_PRIVATE_CHAT :
                        isValid = checkID(options.id);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД");
                        }

                        options.id = sanitize(options.id);
                        break;

    case constants_io.IO_GET_CHAT_HISTORY :
                        isValid = checkID(options.id);
                        isValid = (validator.isDate(options.first_date + "")?   isValid : false);
                        isValid = (validator.isDate(options.second_date + "")?  isValid : false);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно заданы поля: ИД, минимальная и максимальная даты выборки");
                        }

                        options.id = sanitize(options.id);
                        break;

    case constants_io.IO_CLOSE_PRIVATE_CHAT :
                        isValid = checkID(options.id);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД");
                        }

                        options.id = sanitize(options.id);
                        break;

    case constants_io.IO_GET_TOP :
                        //if(options[f.points]) {
                        //  val = options[f.points];
                        //  isValid = (validator.isInt(val) && val <= 9 && val >= 0)? isValid : false;
                        //}

                        //if(options[f.sex]) {
                        //  val = options[f.sex];
                        //  isValid = (validator.isInt(val) && val <= 9 && val >= 0)? isValid : false;
                        //}

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задано количество очков, с которого следует получть топ.");
                        }
                        break;

    case constants_game.G_BEST :
                        isValid = checkID(options.pick);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД игрока, выбранного лучшим.");
                        }
                        break;

    case constants_game.G_BOTTLE_KISSES :
                        isValid = ("pick" in options)? isValid : false;
                        //isValid = (options.pick == "false" || options.pick == "true")? isValid : false;
                        isValid = (validator.isBoolean(options.pick)? isValid : false);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан выбор игрока, значение должно быть типа boolean.");
                        }
                        break;

    case constants_game.G_QUESTIONS :
                        val = options.pick + "";
                        isValid = ("pick" in options)? isValid : false;
                        isValid = (val == "1" || val == "2" || val == "3")? isValid : false;

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан выбор игрока, значение должно быть 1, 2 или 3.");
                        }
                        break;

    case constants_game.G_CARDS :
                        val = options.pick + "";
                        isValid = ("pick" in options)? isValid : false;
                        isValid = (validator.isInt(val) && val <= 6 && val >= 0)? isValid : false;

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан выбор игрока, значение должно быть от 0 до 6.");
                        }
                        break;

    case constants_game.G_SYMPATHY :
    case constants_game.G_SYMPATHY_SHOW :
                        isValid = checkID(options.pick);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД в выборе игрока.");
                        }
                        break;

    case constants_io.IO_RELEASE_PLAYER :
                        isValid = checkID(options.id);

                        if(!isValid) {
                          new GameError(socket, em, "Некорректно задан ИД");
                        }
                        break;

    case constants_io.IO_GAME :
                        //isValid = ("pick" in options)? isValid : false;

                        if(!isValid) {
                          new GameError(socket, em, "Не указан выбор игрока");
                        }

                        if("pick" in options) {
                          options.pick = sanitize(options.pick);
                        }

                        break;
  }

  if(!isValid) {
    handError(constants_io.errors.NO_PARAMS, em);
  }

  return isValid;


  //-------------------------
  function handError(err, em, res) { res = res || {};
    res.operation_status = constants_io.RS_BADSTATUS;
    res.operation_error = err.code || constants_io.errors.OTHER.code;

    socket.emit(em, res);

    new GameError(socket, em, err.message || constants_io.errors.OTHER.message);
  }
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

function checkAuth(em, socket, userList, options) {
  if(("auth_key" in options) == false) {
    new GameError(socket, em, "Отсутствует подпись запроса");
    return false;
  } else if (em == constants_io.IO_INIT) {
    return compareAuthKey(options.vid);
  } else {
    var vid = userList[socket.id].getVID();
    return compareAuthKey(vid);
  }

  //--------------
  function compareAuthKey(vid) {
    if(options.auth_key === md5(constants_io.api_id + "_" + vid + "_" + constants_io.api_secret)) {
      return true;
    } else {
      new GameError(socket, em, "Несовпадение вычисленной и переданной подписи запроса.");
      return false;
    }
  }
}


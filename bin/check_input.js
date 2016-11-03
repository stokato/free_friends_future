var validator = require('validator');
var md5 = require('md5');

var constants = require('./constants');
var sanitize        = require('./sanitizer');
var GameError = require('./game_error');

var oPool = require('./objects_pool');

var idRegExp = /[A-Za-z0-9]{8}-(?:[A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}/i;
var ID_LEN = 36;


module.exports = function (em, socket, options, callback) {
  
  // Попытка повторного подключения
  if(em == constants.IO_INIT && oPool.userList[socket.id] ) {
    return callback(constants.errors.NO_AUTH);
  }
  
  // Такого пользователя нет
  if(em != constants.IO_INIT && !oPool.userList[socket.id] ) {
    return callback(constants.errors.NO_AUTH);
  }
  
  // Не переданы опции
  if(!checkOptionsType(options)) {
    return callback(constants.errors.NO_PARAMS);
  }
  
  // Проверка подписи
  if(!checkAuth(em, socket, options)) {
    return callback(constants.errors.NO_AUTH);
  }
  
  var isValid = true;
  var val;
  
  var err = {
    code : constants.errors.NO_PARAMS.code,
    message : ""
  };
  
  switch (em) {
    case constants.IO_INIT :
      isValid = (validator.isInt(options.country + ""))?  isValid : false;
      isValid = (validator.isInt(options.city + ""))?     isValid : false;
      isValid = (options.sex + "" == constants.GUY ||
      options.sex + "" == constants.GIRL)?  isValid : false;
      isValid = (validator.isDate(options.bdate + "")?    isValid : false);
      
      err.message = "Некорректно заданы поля: страна, город, пол, дата рождения";
      
      break;
    
    case constants.IO_MESSAGE :
      options.text = sanitize(options.text);
      
      if("id" in options) {
        options.id = sanitize(options.id);
        
        err.message = "Некорректно задан ИД";
        
        isValid = checkID(options.id);
      }
      break;
    
    case constants.IO_CHANGE_ROOM :
      //isValid = (validator.isAlphanumeric(options.room + ""))? isValid : false;
      options.room = sanitize(options.room);
      break;
    
    case constants.IO_GET_PROFILE :
      isValid = checkID(options.id);
      
      
      err.message = "Некорректно задан ИД";
      
      options.id = sanitize(options.id);
      break;
    
    case constants.IO_MAKE_GIFT :
      
      options.id = sanitize(options.id);
      break;
    
    case constants.IO_GIVE_MONEY :
      isValid = checkID(options.id);
      
      err.message = "Некорректно задан ИД";
      
      isValid = ("money" in options)?             isValid : false;
      isValid = (validator.isInt(options.money))?  isValid : false;
      
      break;
    
    case constants.IO_ADD_FRIEND :
      isValid = checkID(options.id);
      
      err.message = "Некорректно задан ИД";
      
      options.id = sanitize(options.id);
      break;
    
    case constants.IO_DEL_FROM_FRIENDS :
      isValid = checkID(options.id);
      
      err.message = "Некорректно задан ИД";
      
      options.id = sanitize(options.id);
      break;
    
    case constants.IO_CHANGE_STATUS :
      
      options.status = sanitize(options.status);
      break;
    
    case constants.IO_OPEN_PRIVATE_CHAT :
      isValid = checkID(options.id);
      
      err.message = "Некорректно задан ИД";
      
      options.id = sanitize(options.id);
      break;
    
    case constants.IO_GET_CHAT_HISTORY :
      isValid = checkID(options.id);
      isValid = (validator.isDate(options.first_date + "")?   isValid : false);
      isValid = (validator.isDate(options.second_date + "")?  isValid : false);
      
      err.message = "Некорректно заданы поля: ИД, минимальная и максимальная даты выборки";
      
      options.id = sanitize(options.id);
      break;
    
    case constants.IO_CLOSE_PRIVATE_CHAT :
      isValid = checkID(options.id);
      
      err.message = "Некорректно задан ИД";
      
      options.id = sanitize(options.id);
      break;
    
    case constants.IO_GET_TOP :
      
      break;
    
    
    case constants.IO_GAME :
      
      if("pick" in options && !validator.isBoolean(options.pick)) {
        options.pick = sanitize(options.pick);
      }
      
      switch (options.gNextGame) {
        case constants.G_BEST :
          isValid = checkID(options.pick);
          
          err.message = "Некорректно задан ИД игрока, выбранного лучшим";
          
          break;
        
        case constants.G_BOTTLE_KISSES :
          isValid = ("pick" in options)? isValid : false;
          
          isValid = (validator.isBoolean(options.pick)? isValid : false);
          
          err.message = "Некорректно задан выбор игрока, значение должно быть типа boolean";
          
          break;
        
        case constants.G_QUESTIONS :
          val = options.pick + "";
          isValid = ("pick" in options)? isValid : false;
          isValid = (val == "1" || val == "2" || val == "3")? isValid : false;
          
          err.message = "Некорректно задан выбор игрока, значение должно быть 1, 2 или 3";
          break;
        
        case constants.G_CARDS :
          val = options.pick + "";
          isValid = ("pick" in options)? isValid : false;
          isValid = (validator.isInt(val) && val <= 6 && val >= 0)? isValid : false;
          
          err.message = "Некорректно задан выбор игрока, значение должно быть от 0 до 6";
          
          break;
        
        case constants.G_SYMPATHY :
        case constants.G_SYMPATHY_SHOW :
          isValid = checkID(options.pick);
          
          err.message = "Некорректно задан ИД в выборе игрока";
          
          break;
        
      }
      
      break;
    
    case constants.IO_RELEASE_PLAYER :
      isValid = checkID(options.id);
      
      
      err.message = "Некорректно задан ИД в выборе игрока";
      
      break;
    
    case constants.IO_ADD_TRECK :
      isValid = ("track_id" in options)? isValid : false;
      
      err.message = "Не задан ид трека";
      
      isValid = ("duration" in options)? isValid : false;
      isValid = (validator.isInt(options.duration))? isValid : false;
      
      
      err.message = "Не задана продолжительность трека";
      
      options.track_id = sanitize(options.track_id);
      options.duration = sanitize(options.duration);
      break;
    
    case constants.IO_LIKE_TRACK :
    case constants.IO_DISLIKE_TRACK :
      isValid = ("track_id" in options)? isValid : false;
      
      err.message = "Не задан ид трека";
      
      options.track_id = sanitize(options.track_id);
      break;
    
    case constants.IO_GET_TRACK_LIST :
      
      break;
    
    case constants.IO_ADD_QUESTION :
      isValid = ("text" in options)? isValid : false;
      
      err.message = "Не задан текст вопроса";
      
      options.text = sanitize(options.text);
      
      break;
    
    case constants.IO_DEL_QUESTION :
      isValid = checkID(options.id);
      
      err.message = "Некорректно задан ИД вопроса";
      
      options.id = sanitize(options.id);
      break;
    
    case constants.IO_LIKE_PROFILE :
      isValid = checkID(options.id);
      
      err.messagee = "Некорректно задан ИД вопроса";
      
      options.id = sanitize(options.id);
      break;
  }
  
  if(isValid == true) {
    callback(null, socket, options);
  } else {
    callback(err);
  }
  
};


function checkID(id) {
  var res = (id + "").search(idRegExp);
  return !!(res == 0 && id.length == ID_LEN);
}

function checkOptionsType(options) {
  if (!options) { return false; } else
  if (typeof options != "object") { return false }
  
  return true;
}

function checkAuth(em, socket, options) {
  if(em == constants.IO_INIT) {
    if(("auth_key" in options) == false) {
      new GameError(socket, em, "Отсутствует подпись запроса");
      return false;
    } else if (em == constants.IO_INIT) {
      return compareAuthKey(options.vid);
    } else {
      var vid = oPool.userList[socket.id].getVID();
      return compareAuthKey(vid);
    }
  } else {
    return (socket.handshake.session.authorized == true);
  }
  
  //--------------
  function compareAuthKey(vid) {
    if(options.auth_key === md5(constants.api_id + "_" + vid + "_" + constants.api_secret)) {
      return true;
    } else {
      new GameError(socket, em, "Несовпадение вычисленной и переданной подписи запроса.");
      return false;
    }
  }
}


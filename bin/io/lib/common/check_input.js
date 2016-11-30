/**
 * Проверяем поля объектов, полученных от клиента, на соответствие требованиям
 *
 * @param em - эмит, socket, options - объект с опциями для проверки, callback
 * @return socket, options - проверенные и санитаризированные опции
 */

var validator = require('validator');

var constants = require('./../../../constants'),
    PF        = constants.PFIELDS,
    sanitize  = require('./../../../sanitizer'),
    checkAuth = require('./../../../check_auth'),
    oPool     = require('./../../../objects_pool');

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
  // if(!checkAuth(em, socket, options)) {
  //   return callback(constants.errors.NO_AUTH);
  // }
  
  var isValid = true;
  
  var err = {
    code : constants.errors.NO_PARAMS.code,
    message : ""
  };
  
  switch (em) {
    case constants.IO_INIT :
      isValid = (validator.isInt(options[PF.COUNTRY] + ""))?  isValid : false;
      isValid = (validator.isInt(options[PF.CITY] + ""))?     isValid : false;
      isValid = (options[PF.SEX] + "" == constants.GUY ||
      options[PF.SEX] + "" == constants.GIRL)?  isValid : false;
      isValid = (validator.isDate(options[PF.BDATE] + "")?    isValid : false);
      
      err.message = "Некорректно заданы поля: страна, город, пол, дата рождения";
      
      break;
    
    case constants.IO_MESSAGE :
      options[PF.TEXT] = sanitize(options[PF.TEXT]);
      
      if("id" in options) {
        options[PF.ID] = sanitize(options[PF.ID]);
        
        err.message = "Некорректно задан ИД";
        
        isValid = checkID(options[PF.ID]);
      }
      break;
    
    case constants.IO_CHANGE_ROOM :
      //isValid = (validator.isAlphanumeric(options.room + ""))? isValid : false;
      options[PF.ROOM] = sanitize(options[PF.ROOM]);
      break;
    
    case constants.IO_GET_PROFILE :
      isValid = checkID(options[PF.ID]);
      
      err.message = "Некорректно задан ИД";
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
    
    case constants.IO_MAKE_GIFT :
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
    
    case constants.IO_GIVE_MONEY :
      isValid = checkID(options[PF.ID]);
      
      err.message = "Некорректно задан ИД";
      
      isValid = (PF.MONEY in options)?             isValid : false;
      isValid = (validator.isInt(options[PF.MONEY]))?  isValid : false;
      break;
    
    case constants.IO_ADD_FRIEND :
      isValid = checkID(options[PF.ID]);
      
      err.message = "Некорректно задан ИД";
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
    
    case constants.IO_DEL_FROM_FRIENDS :
      isValid = checkID(options[PF.ID]);
      
      err.message = "Некорректно задан ИД";
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
    
    case constants.IO_CHANGE_STATUS :
      
      options[PF.STATUS] = sanitize(options[PF.STATUS]);
      break;
    
    case constants.IO_OPEN_PRIVATE_CHAT :
      isValid = checkID(options[PF.ID]);
      
      err.message = "Некорректно задан ИД";
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
    
    case constants.IO_GET_CHAT_HISTORY :
      isValid = checkID(options[PF.ID]);
      isValid = (validator.isDate(options[PF.DATE_FROM] + "")?   isValid : false);
      isValid = (validator.isDate(options[PF.DATE_TO] + "")?  isValid : false);
      
      err.message = "Некорректно заданы поля: ИД, минимальная и максимальная даты выборки";
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
    
    case constants.IO_CLOSE_PRIVATE_CHAT :
      isValid = checkID(options[PF.ID]);
      
      err.message = "Некорректно задан ИД";
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
    
    case constants.IO_GET_TOP :
      
      break;
    
    case constants.IO_SET_VIEWED :
      isValid = ("target" in options)?             isValid : false;
      
      err.message = "Не задано свойство target";
      
      options[PF.TARGET] = sanitize(options[PF.TARGET]);
      break;
    
    
    case constants.IO_ADD_TRECK :
      isValid = (PF.TRACKID in options)? isValid : false;
      
      err.message = "Не задан ид трека";
      
      isValid = (PF.DURATION in options)? isValid : false;
      isValid = (validator.isInt(options[PF.DURATION]))? isValid : false;
      
      err.message = "Не задана продолжительность трека";
      
      options[PF.TRACKID] = sanitize(options[PF.TRACKID]);
      options[PF.DURATION] = sanitize(options[PF.DURATION]);
      break;
    
    case constants.IO_LIKE_TRACK :
    case constants.IO_DISLIKE_TRACK :
      isValid = (PF.TRACKID in options)? isValid : false;
      
      err.message = "Не задан ид трека";
      
      options[PF.TRACKID] = sanitize(options[PF.TRACKID]);
      break;
    
    case constants.IO_GET_TRACK_LIST :
      
      break;
    
    case constants.IO_ADD_QUESTION :
      isValid = (PF.TEXT in options)? isValid : false;
      
      err.message = "Не задан текст вопроса";
      
      options[PF.TEXT] = sanitize(options[PF.TEXT]);
      break;
    
    case constants.IO_DEL_QUESTION :
      isValid = checkID(options[PF.ID]);
      
      err.message = "Некорректно задан ИД вопроса";
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
    
    case constants.IO_LIKE_PROFILE :
      isValid = checkID(options[PF.ID]);
      
      err.messagee = "Некорректно задан ИД вопроса";
      
      options[PF.ID] = sanitize(options[PF.ID]);
      break;
  }
  
  if(isValid == true) {
    callback(null, socket, options);
  } else {
    callback(err);
  }
  
};

function checkID(id) {
  var idRegExp = /[A-Za-z0-9]{8}-(?:[A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}/i;
  var ID_LEN = 36;
  
  var res = (id + "").search(idRegExp);
  
  return !!(res == 0 && id.length == ID_LEN);
}

function checkOptionsType(options) {
  if (!options) { return false; } else
  if (typeof options != "object") { return false }
  
  return true;
}


var validator = require('validator');

var Config    = require('./../../../../config.json');
var constants = require('./../../../constants'),
    PF        = constants.PFIELDS,
    sanitize  = require('./../../../sanitizer'),
    checkAuth = require('./../../../check_auth'),
    oPool     = require('./../../../objects_pool');

var CARD_COUNT = Number(Config.game.card_count);

module.exports = function (em, socket, nextGame, options, callback) {
  
  // Такого пользователя нет
  if(!oPool.userList[socket.id] ) {
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
  
  var isValid = true, val;
  
  var err = {
    code : constants.errors.NO_PARAMS.code,
    message : ""
  };
  
  
  
  switch (em) {
    case constants.IO_GAME :
    
      if(PF.PICK in options && !validator.isBoolean(options[PF.PICK])) {
        options[PF.PICK] = sanitize(options[PF.PICK]);
      }
    
      switch (nextGame) {
        case constants.G_BEST :
          isValid = checkID(options[PF.PICK]);
        
          err.message = "Некорректно задан ИД игрока, выбранного лучшим";
        
          break;
      
        case constants.G_BOTTLE_KISSES :
          isValid = (PF.PICK in options)? isValid : false;
        
          isValid = (validator.isBoolean(options[PF.PICK])? isValid : false);
        
          err.message = "Некорректно задан выбор игрока, значение должно быть типа boolean";
        
          break;
      
        case constants.G_QUESTIONS :
          val = options[PF.PICK] + "";
          isValid = (PF.PICK in options)? isValid : false;
          isValid = (validator.isInt(val) && val <= constants.QUESTIONS_COUNT && val >= 1)? isValid : false;
  
          err.message = "Некорректно задан выбор игрока, значение должно быть от 1 до " + constants.QUESTIONS_COUNT;
          break;
      
        case constants.G_CARDS :
          val = options[PF.PICK] + "";
          isValid = (PF.PICK in options)? isValid : false;
          isValid = (validator.isInt(val) && val <= CARD_COUNT-1 && val >= 0)? isValid : false;
        
          err.message = "Некорректно задан выбор игрока, значение должно быть от 0 до " + CARD_COUNT-1;
        
          break;
      
        case constants.G_SYMPATHY :
        case constants.G_SYMPATHY_SHOW :
          isValid = checkID(options[PF.PICK]);
        
          err.message = "Некорректно задан ИД в выборе игрока";
        
          break;
      
      }
    
      break;
  
    case constants.IO_RELEASE_PLAYER :
      isValid = checkID(options[PF.ID]);
    
    
      err.message = "Некорректно задан ИД в выборе игрока";
    
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


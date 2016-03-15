var validator = require('validator');
var constants_io = require('./io/constants_io');
var constants_game = require('./game/constants');

var idRegExp = /[A-Za-z0-9]{8}-(?:[A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}/i;
var ID_LEN = 36;

function checkInput(em, socket, userList, opt) {
  if(em == constants_io.IO_INIT && userList[socket.id] ) {
    new Error("Пользователь уже инициализирован");
    return false
  }
  if(em != constants_io.IO_INIT && !userList[socket.id] ) {
    new Error("Пользователь не авторизован");
    return false
  }
  var options = opt;
  var isValid = true;
  var val;

  if(em == constants_io.IO_INIT) {

    if(!checkOptionsType(options)) { return false }

   // isValid = (validator.isInt(options.age))? isValid : false;
    isValid = (validator.isInt(options.country + ""))? isValid : false;
    isValid = (validator.isInt(options.city + ""))? isValid : false;
    isValid = (options.sex == 1 || options.sex + "" == 2)? isValid : false;
    isValid = (validator.isDate(options.bdate + "")? isValid : false);
  }

  if(em == constants_io.IO_MESSAGE) {
    if(!checkOptionsType(options)) { return false }
  }

  if(em == constants_io.IO_CHANGE_ROOM) {
    if(!checkOptionsType(options)) { return false }

    //isValid = (validator.isAlphanumeric(options.room + ""))? isValid : false;
  }

  if(em == constants_io.IO_GET_PROFILE) {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
  }

  if(em == constants_io.IO_PRIVATE_MESSAGE) {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
  }

  if(em == constants_io.IO_MAKE_GIFT) {
    if(!checkOptionsType(options)) { return false }
  }

  if(em == constants_io.IO_ADD_FRIEND) {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
  }

  if(em == constants_io.IO_CHANGE_STATUS) {
    if(!checkOptionsType(options)) { return false }

    //isValid = (validator.isAlphanumeric(options.status))? isValid : false;
  }

  if(em == constants_io.IO_OPEN_PRIVATE_CHAT) {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
  }

  if(em == constants_io.IO_GET_CHAT_HISTORY) {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
    isValid = (validator.isDate(options.fdate + "")? isValid : false);
    isValid = (validator.isDate(options.sdate + "")? isValid : false);
  }

  if(em == constants_io.IO_OPEN_PRIVATE_CHAT) {
    if(!checkOptionsType(options)) { return false }

    isValid = (!validator.isNull(options.id))? isValid : false;
  }

  if(em == constants_io.IO_CLOSE_PRIVATE_CHAT) {
    if(!checkOptionsType(options)) { return false }

    isValid = (!validator.isNull(options.id))? isValid : false;
  }

  if(em == constants_game.G_BEST) {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.pick);
  }

  if(em == constants_game.G_BOTTLE_KISSES) {
    if(!checkOptionsType(options)) { return false }

    isValid = (validator.isBoolean(options.pick + "")? isValid : false);
  }

  if(em == constants_game.G_QUESTIONS) {
    if(!checkOptionsType(options)) { return false }

    val = options.pick + "";
    isValid = (val == "1" || val == "2" || val == "3")? isValid : false;
  }

  if(em == constants_game.G_CARDS) {
    if(!checkOptionsType(options)) { return false }

    val = options.pick + "";
    isValid = (validator.isInt(val) && val <= 9 && val >= 0)? isValid : false;
  }

  if(em == constants_game.G_SYMPATHY || em == constants_game.G_SYMPATHY_SHOW) {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.pick);
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
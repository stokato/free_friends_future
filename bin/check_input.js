var validator = require('validator');
var idRegExp = /[A-Za-z0-9]{8}-(?:[A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}/i;
var ID_LEN = 36;

function checkInput(em, socket, userList, opt) {
  if(em == 'init' && userList[socket.id] ) { new Error("Пользователь уже инициализирован");  return false }
  if(em != 'init' && !userList[socket.id] ) { new Error("Пользователь не авторизован");  return false }
  var options = opt;
  var isValid = true;
  var val;

  if(em == 'init') {

    if(!checkOptionsType(options)) { return false }

   // isValid = (validator.isInt(options.age))? isValid : false;
    isValid = (validator.isInt(options.country + ""))? isValid : false;
    isValid = (validator.isInt(options.city + ""))? isValid : false;
    isValid = (options.sex == 1 || options.sex + "" == 2)? isValid : false;
    isValid = (validator.isDate(options.bdate + "")? isValid : false);
  }

  if(em == 'message') {
    if(!checkOptionsType(options)) { return false }
  }

  if(em == 'change_room') {
    if(!checkOptionsType(options)) { return false }

    isValid = (validator.isAlphanumeric(options.room + ""))? isValid : false;
  }

  if(em == 'get_profile') {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
  }

  if(em == 'private_message') {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
  }

  if(em == 'make_gift') {
    if(!checkOptionsType(options)) { return false }
  }

  if(em == 'add_friend') {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
  }

  if(em == 'change_status') {
    if(!checkOptionsType(options)) { return false }

    //isValid = (validator.isAlphanumeric(options.status))? isValid : false;
  }

  if(em == 'open_private_chat') {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
  }

  if(em == 'get_chat_history') {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.id);
    isValid = (validator.isDate(options.fdate + "")? isValid : false);
    isValid = (validator.isDate(options.sdate + "")? isValid : false);
  }

  if(em == 'open_private_chat') {
    if(!checkOptionsType(options)) { return false }

    isValid = (!validator.isNull(options.id))? isValid : false;
  }

  if(em == 'close_private_chat') {
    if(!checkOptionsType(options)) { return false }

    isValid = (!validator.isNull(options.id))? isValid : false;
  }

  if(em == 'game_best') {
    if(!checkOptionsType(options)) { return false }

    isValid = checkID(options.pick);
  }

  if(em == 'game_bottle_kisses') {
    if(!checkOptionsType(options)) { return false }

    isValid = (validator.isBoolean(options.pick + "")? isValid : false);
  }

  if(em == 'game_questions') {
    if(!checkOptionsType(options)) { return false }

    val = options.pick + "";
    isValid = (val == "1" || val == "2" || val == "3")? isValid : false;
  }

  if(em == 'game_cards') {
    if(!checkOptionsType(options)) { return false }

    val = options.pick + "";
    isValid = (validator.isInt(val) && val <= 9 && val >= 0)? isValid : false;
  }

  if(em == 'game_sympathy') {
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
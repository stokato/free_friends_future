var validator = require('validator');
var idRegExp = /[A-Za-z0-9]{8}-(?:[A-Za-z0-9]{4}-){3}[A-Za-z0-9]{12}/i;
var ID_LEN = 36;

function checkInput(em, socket, userList, opt) {
  if(em == 'init' && userList[socket.id] ) { new Error("Пользователь уже инициализирован");  return false }
  if(em != 'init' && !userList[socket.id] ) { new Error("Пользователь не авторизован");  return false }
  var options = opt;
  var isValid = true;
  var val;

  if (!options) { return false; }
  if (typeof options != "object") { return false }

  if(em == 'init') {
   // isValid = (validator.isInt(options.age))? isValid : false;
    isValid = (validator.isInt(options.country + ""))? isValid : false;
    isValid = (validator.isInt(options.city + ""))? isValid : false;
    isValid = (options.sex == 1 || options.sex + "" == 2)? isValid : false;
    isValid = (validator.isDate(options.bdate + "")? isValid : false);
  }

  if(em == 'message') {

  }

  if(em == 'change_room') {
    isValid = (validator.isAlphanumeric(options.room + ""))? isValid : false;
  }

  if(em == 'get_profile') {
    isValid = checkID(options.id);
  }

  if(em == 'private_message') {
    isValid = checkID(options.id);
  }

  if(em == 'make_gift') {

  }

  if(em == 'add_friend') {
    isValid = checkID(options.id);
  }

  if(em == 'change_status') {
    //isValid = (validator.isAlphanumeric(options.status))? isValid : false;
  }

  if(em == 'open_private_chat') {
    isValid = checkID(options.id);
  }

  if(em == 'get_chat_history') {
    isValid = checkID(options.id);
    isValid = (validator.isDate(options.fdate + "")? isValid : false);
    isValid = (validator.isDate(options.sdate + "")? isValid : false);
  }

  if(em == 'open_private_chat') {
    isValid = (!validator.isNull(options.id))? isValid : false;
  }

  if(em == 'close_private_chat') {
    isValid = (!validator.isNull(options.id))? isValid : false;
  }

  if(em == 'game_best') {
    isValid = checkID(options.pick);
  }

  if(em == 'game_bottle_kisses') {
    isValid = (validator.isBoolean(options.pick + "")? isValid : false);
  }

  if(em == 'game_questions') {
    val = options.pick + "";
    isValid = (val == "1" || val == "2" || val == "3")? isValid : false;
  }

  if(em == 'game_cards') {
    val = options.pick + "";
    isValid = (validator.isInt(val) && val <= 9 && val >= 0)? isValid : false;
  }

  if(em == 'game_sympathy') {
    isValid = checkID(options.pick);
  }

  return isValid;
}

module.exports = checkInput;

function checkID(id) {
  var res = (id + "").search(idRegExp);
  return !!(res == 0 && id.length == ID_LEN);
}
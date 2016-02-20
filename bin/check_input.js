var validator = require('validator');

function checkInput(em, socket, userList, opt) {
  if(em == 'init' && userList[socket.id] ) { new Error("Пользователь уже инициализирован");  return false }
  if(em != 'init' && !userList[socket.id] ) { new Error("Пользователь не авторизован");  return false }
  var options = opt || {};
  var isValid = true;

  if(em == 'init') {
   // isValid = (validator.isInt(options.age))? isValid : false;
    isValid = (validator.isInt(options.country))? isValid : false;
    isValid = (validator.isInt(options.city))? isValid : false;
    isValid = (options.sex == 1 || options.sex == 2)? isValid : false;
    isValid = (validator.isDate(options.bdate)? isValid : false);
  }

  if(em == 'message') {

  }

  if(em == 'change_room') {

  }

  if(em == 'get_profile') {

  }

  if(em == 'private_message') {

  }

  if(em == 'make_gift') {

  }

  if(em == 'add_friend') {
    // isValid = (validator.isAlphanumeric(options.id))? isValid : false;
  }

  if(em == 'change_status') {
    //isValid = (validator.isAlphanumeric(options.status))? isValid : false;
  }

  if(em == 'change_money')
  {

  }

  if(em == 'open_private_chat') {
    isValid = (!validator.isNull(options.id))? isValid : false;
  }

  if(em == 'close_private_chat') {
    isValid = (!validator.isNull(options.id))? isValid : false;
  }
  return isValid;
}

module.exports = checkInput;
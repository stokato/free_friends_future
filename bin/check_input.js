var validator = require('validator');

function checkInput(em, socket, userList, opt) {
    if(em == 'init' && userList[socket.id] ) { new Error("Пользователь уже инициализирован");  return false }
    if(em != 'init' && !userList[socket.id] ) { new Error("Пользователь не авторизован");  return false }
    var options = opt || {};
    var isValid = true;

    if(em == 'init') {
        isValid = (validator.isInt(options.age))? isValid : false;
        isValid = (!validator.isNull(options.location))? isValid : false;
        isValid = (options.gender == 'guy' || options.gender == 'girl')? isValid : false;
    }

    if(em == 'message') {
        isValid = (validator.isDate(options.date))? isValid : false;
    }

    if(em == 'change_room') {

    }

    if(em == 'get_profile') {
        isValid = (validator.isDate(options.date))? isValid : false;
    }

    if(em == 'private_message') {
        isValid = (validator.isDate(options.date))? isValid : false;
    }

    if(em == 'make_gift') {
        isValid = (validator.isDate(options.date))? isValid : false;
    }

    if(em == 'add_friend') {
        // isValid = (validator.isAlphanumeric(options.id))? isValid : false;
    }

    if(em == 'change_status') {
        //isValid = (validator.isAlphanumeric(options.status))? isValid : false;
    }

    if(em == 'change_money') {
        isValid = (validator.isInt(options.money))? isValid : false;
    }

    return isValid;
}

module.exports = checkInput;
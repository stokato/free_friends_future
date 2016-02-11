
var GameError = require('../../game_error'),
    checkInput = require('../../check_input');

/*
 Показать подарки
 - Получаем подарки - массив подарков (ИД, тип, дата, src ??) (из БД)
 - Отправляем клиенту
 */
function getGifts(socket, userList) {
    socket.on('get_gifts', function() {

        if (!checkInput('get_gifts', socket, userList, null))
            return new GameError(socket, "GETGIFTS", "Верификация не пройдена");

        userList[socket.id].getGifts(function (err, gifts) {
            if (err) {
                return new GameError(socket, "GETGIFTS", err.message);
            }

            socket.emit('get_gifts', gifts);
        });
    });
}

module.exports = getGifts;
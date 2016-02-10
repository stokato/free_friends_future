
var GameError = require('../../game_error'),
    checkInput = require('../../check_input');
/*
 �������� ��������� ��� ��������
 */
function openPrivateMessage(socket, userList) {
    socket.on('open_private_message', function(options) {

        if (!checkInput('open_private_message', socket, userList, null))
            return new GameError(socket, "OPENMESSAGE", "����������� �� ��������");

        userList[socket.id].openMessage(options, function (err, res) {
            if (err) {
                return new GameError(socket, "OPENMESSAGE", err.message);
            }

            socket.emit('open_private_message', options);
        })
    });
}

module.exports = openPrivateMessage;
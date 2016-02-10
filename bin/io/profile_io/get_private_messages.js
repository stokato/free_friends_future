var GameError = require('../../game_error'),
    checkInput = require('../../check_input');
/*
 �������� ���� ������ ���������
 - �������� ������� ��������� - ������ ��������� (����, �� �����������, ��/���, �����) (�� ��)
 - ���������� �������
 */
function getPrivateMessages(socket, userList) {
    socket.on('get_private_messages', function() {

        if (!checkInput('get_private_messages', socket, userList, null))
            return new GameError(socket, "GETHISTORY", "����������� �� ��������");

        userList[socket.id].getHistory(null, null, function (err, messages) {
            if (err) {
                return new GameError(socket, "GETHISTORY", err.message);
            }

            socket.emit('get_private_messages', messages);
        });
    })
}

module.exports = getPrivateMessages;
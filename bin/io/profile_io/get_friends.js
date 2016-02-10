
var GameError = require('../../game_error'),
    checkInput = require('../../check_input');

/*
 �������� ����� ������
 - �������� ������ - ������ (�� � ���� ������ ������) (�� ��)
 - �������� �������
 */
function getFriends(socket, userList) {
    socket.on('get_friends', function() {

        if (!checkInput('get_friends', socket, userList, null))
            return new GameError(socket, "getFRIENDS", "����������� �� ��������");

        userList[socket.id].getFriends(function (err, friends) {
            if (err) {
                return new GameError(socket, "getFRIENDS", err.message);
            }

            socket.emit('get_friends', friends);
        });
    });
}

module.exports = getFriends;
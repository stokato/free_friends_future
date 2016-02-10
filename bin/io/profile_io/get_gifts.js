
var GameError = require('../../game_error'),
    checkInput = require('../../check_input');

/*
 �������� �������
 - �������� ������� - ������ �������� (��, ���, ����, src ??) (�� ��)
 - ���������� �������
 */
function getGifts(socket, userList) {
    socket.on('get_gifts', function() {

        if (!checkInput('get_gifts', socket, userList, null))
            return new GameError(socket, "GETGIFTS", "����������� �� ��������");

        userList[socket.id].getGifts(function (err, gifts) {
            if (err) {
                return new GameError(socket, "GETGIFTS", err.message);
            }

            socket.emit('get_gifts', gifts);
        });
    });
}

module.exports = getGifts;
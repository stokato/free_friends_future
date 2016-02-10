var GameError = require('../../game_error'),
    checkInput = require('../../check_input');
/*
 �������� ���� ������� (����������)
 - �������� ������� - ������ �������� �� ����� ���������� (�� ��)
 - �������� �������
 */
function getGuests(socket, userList) {
    socket.on('get_guests', function() {

        if (!checkInput('get_guests', socket, userList, null))
            return new GameError(socket, "GETGUESTS", "����������� �� ��������");

        userList[socket.id].getGuests(function (err, guests) {
            if (err) {
                return new GameError(socket, "GETGUESTS", err.message);
            }

            socket.emit('get_guests', guests);
        });
    });
}

module.exports = getGuests;
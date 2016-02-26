var constants = require('./../constants_io');
    closeConnection = require('./close_connection');

/*
 ������� (�����������)
 - �������� ���� ������� � �������
 - �������� ��� � ������� �� �����
 - ��������� ������� � ��
 - ������� ������� � ������� �� ������
 - ��������� �����
 */
module.exports = function (socket, userList, profiles, roomList, rooms) {
  socket.on('disconnect', function() {
    if(userList[socket.id]) {
      userList[socket.id].setExitTimeout(
        setTimeout(function(){
          closeConnection(socket, userList, profiles, roomList, rooms);
        }, constants.EXIT_TIMEOUT))
    }
  });
}; // ������� �� ����


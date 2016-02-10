var async     =  require('async');
// ���� ������
var profilejs =  require('../../profile/index'),          // �������
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');

/*
 �������� ������������ � ������: ���������� � ����� (VID, ��� ��� �� ���?)
 - �������� ���� �������
 - �������� ������� ����� (�� ��� ��� ��)
 - ���������� ���� ����� � ������ (����� � ��)
 - �������� ������ (� �������, ���� �� ������) ???
 */
function addToFriends(socket, userList, profiles) {
    socket.on('add_friend', function(options) {

        if (!checkInput('add_friend', socket, userList, options))
            return new GameError(socket, "ADDFRIEND", "����������� �� ��������");

        if (userList[socket.id].getID() == options.id)
            return new GameError(socket, "ADDFRIEND", "������ �������� � ������ ����");

        var selfProfile = userList[socket.id];
        var selfInfo = {
            id: selfProfile.getID(),
            vid: selfProfile.getVID(),
            date: options.date
        };
        async.waterfall([///////////////////////////////////////////////////////////////////
            function (cb) { // �������� ������� �����
                var friendProfile = null;
                if (profiles[options.id]) { // ���� ������
                    friendProfile = profiles[options.id];
                    cb(null, friendProfile);
                }
                else {                // ���� ��� - ����� �� ����
                    friendProfile = new profilejs();
                    friendProfile.build(options.id, function (err, info) {  // ����� VID � ��� ����, ��� ��� �����������
                        if (err) {
                            return cb(err, null);
                        }

                        cb(null, friendProfile);
                    });
                }
            },///////////////////////////////////////////////////////////////
            function (friendProfile, cb) { // ��������� ������� � ������
                friendProfile.addToFriends(selfInfo, function (err, res) {
                    if (err) {
                        return cb(err, null);
                    }

                    if (profiles[friendProfile.getID()]) { // ���� ���� ������, �� � ���
                        var friendSocket = friendProfile.getSocket();
                        friendSocket.emit('add_friend', selfInfo);
                        friendSocket.emit('get_news', friendProfile.getNews());
                    }

                    cb(null, friendProfile);
                })
            },
            function (friendProfile, cb) { // ��������� �������
                var friendInfo = {
                    id: friendProfile.getID(),
                    vid: friendProfile.getVID(),
                    points: friendProfile.getPoints(),
                    date: options.date
                };
                selfProfile.addToFriends(friendInfo, function (err, res) {
                    if (err) {
                        return cb(err, null);
                    }

                    socket.emit('add_friend', friendInfo);

                    cb(null, null);
                })
            }], function (err, res) { // ���������� ���������. ������������ ������
            if (err) {
                return new GameError(socket, "ADDFRIEND", err.message);
            }
        }); // waterfall
    });
}

module.exports = addToFriends;
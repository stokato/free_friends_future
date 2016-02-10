var async     =  require('async');
// ���� ������
var profilejs =  require('../../profile/index'),          // �������
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');

/*
 �������� ������� (����� �� ������ ����� �������, ���� � ���� ������� ������ ���,
 ������� ����� ������� �� ���. ����� ????)
 - ���� ������� ���� ������� - ���������� ������� ���� ������ (����� ?)
 - ���� �����
 -- ������� ������� ����, ���� ������� (�� ��� ��� ��)
 -- ��������� ���� ��� � ����� (����� ����� � ��)
 -- ��������� ������� ������ ������� (????)
 -- ���� ���, ���� �������, ������, ������� ����� ��� ����� ��������� � ������ ???
 */
function getProfile(socket, userList, profiles) {
    socket.on('get_profile', function(options) {

        if (!checkInput('get_profile', socket, userList, options))
            return new GameError(socket, "ADDFRIEND", "����������� �� ��������");

        var selfProfile = userList[socket.id];

        if (selfProfile.getID() == options.id) { // ���� ��������� ���� �������
            var info = {
                id: selfProfile.getID(),
                vid: selfProfile.getVID(),
                status: selfProfile.getStatus(),
                points: selfProfile.getPoints(),
                money: selfProfile.getMoney()
            };

            return socket.emit('get_profile', info);
        }

        async.waterfall([///////////////////////////////////////////////////////////////////
            function (cb) { // �������� ������� ����, ��� �������������
                var friendProfile = null;
                var friendInfo = null;
                if (profiles[options.id]) { // ���� ������
                    friendProfile = profiles[options.id];
                    friendInfo = {
                        id: friendProfile.getID(),
                        vid: friendProfile.getVID(),
                        status: friendProfile.getStatus(),
                        points: friendProfile.getPoints()
                    };
                    cb(null, friendProfile, friendInfo);
                }
                else {                // ���� ��� - ����� �� ����
                    friendProfile = new profilejs();
                    friendProfile.build(options.id, function (err, info) {
                        if (err) {
                            return cb(err, null);
                        }

                        friendInfo = {
                            id: info.id,
                            vid: info.vid,
                            status: info.status,
                            points: info.points
                        };
                        cb(null, friendProfile, friendInfo);
                    });
                }
            },///////////////////////////////////////////////////////////////
            function (friendProfile, friendInfo, cb) { // ��������� ���� � �����
                var info = {
                    id: selfProfile.getID(),
                    vid: selfProfile.getVID(),
                    points: selfProfile.getPoints(),
                    date: options.date
                };
                friendProfile.addToGuests(info, function (err, res) {
                    if (err) {
                        return cb(err, null);
                    }

                    cb(null, friendInfo, info);
                });//////////////////////////////////////////////////////////////
            }], function (err, friendInfo, info) { // ���������� ���������. ������������ ������
            if (err) {
                return new GameError(socket, "ADDFRIEND", err.message);
            }

            socket.emit('get_profile', friendInfo); // ���������� ����

            if (profiles[friendInfo.id]) { // ���� ���, ���� �������������, ������, �������� � ���������
                var friendProfile = profiles[friendInfo.id];
                var friendSocket = friendProfile.getSocket();
                friendSocket.emit('add_guest', info);
                friendSocket.emit('get_news', friendProfile.getNews());
            }
        }); // waterfall
    });
}

module.exports = getProfile;
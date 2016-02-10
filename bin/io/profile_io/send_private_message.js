var async     =  require('async');
// ���� ������
var profilejs =  require('../../profile/index'),          // �������
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');
/*
 ��������� ������ ���������: ���������, ������ � ���. � ���������� (VID, ��� ��� ��?)
 - �������� ���� �������
 - �������� ������� �������� (�� ��� ��� ��)
 - ��������� �������� ���������
 - ��������� ��������� ����                                       ???
 - �������� ������ (� �������, ���� �� ������) (� ��� ��������?)
 */
function sendPrivateMessage(socket, userList, profiles) {
    socket.on('private_message', function(options) {

        if (!checkInput('private_message', socket, userList, options))
            return new GameError(socket, "SENDPRIVMESSAGE", "����������� �� ��������");

        if (userList[socket.id].getID() == options.id)
            return new GameError(socket, "SENDPRIVMESSAGE", "������ ���������� ��������� ����");

        var selfProfile = userList[socket.id];
        async.waterfall([//////////////////////////////////////////////////////////////
            function (cb) { // �������� ������ �������� � ������� ��������� � ���������� � �������
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
            }, ///////////////////////////////////////////////////////////////////////////////
            function (friendProfile, cb) { // ��������� ��������� � ������� ����������
                var savingMessage = {
                    date: options.date,
                    companionid: selfProfile.getID(),
                    companionvid: selfProfile.getVID(),
                    incoming: true,
                    text: options.text,
                    opened: false
                };
                friendProfile.addMessage(savingMessage, function (err, result) {
                    if (err) {
                        return cb(err, null);
                    }

                    if (profiles[options.id]) {
                        savingMessage['vid'] = selfProfile.getVID();
                        var friendSocket = profiles[options.id].getSocket();
                        friendSocket.emit('private_message', savingMessage);
                        friendSocket.emit('get_news', friendProfile.getNews());
                    }
                    cb(null, savingMessage, friendProfile);
                });
            }, //////////////////////////////////////////////////////////////////////////////////////
            function (savingMessage, friendProfile, cb) { // ��������� ��������� � ������� �����������
                savingMessage = {
                    date: options.date,
                    companionid: friendProfile.getID(),
                    companionvid: friendProfile.getVID(),
                    incoming: false,
                    text: options.text,
                    opened: true
                };
                selfProfile.addMessage(savingMessage, function (err, res) {
                    if (err) {
                        cb(err, null);
                    }

                    savingMessage['vid'] = friendProfile.getVID();
                    socket.emit('private_message', savingMessage);
                    cb(null, null);
                });
            }/////////////////////////////////////////////////////////////////////////////////
        ], function (err) { // ���������� ��������� ��� � ������ ������
            if (err) {
                new GameError(socket, "SENDPRIVMESSAGE", err.message);
            }
        });
    });
}

module.exports = sendPrivateMessage;
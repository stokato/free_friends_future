var async     =  require('async');
// ���� ������
var profilejs =  require('../../profile/index'),          // �������
    dbjs      = require('../../db/index'),
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');

var db = new dbjs();
/*
 ������� �������: �� �������, ������ � ���. � ���������� (VID, ��� ��� ��?)
 - ���� ������� �� �� � ����
 - �������� ������� �������� (�� ��� ��� ��)
 - ��������� �������� ������� (����� ����� � ��)
 - �������� ������ (� �������, ���� �� ������) (� ��� ��������?)
 */
function makeGift(socket, userList, profiles) {
    socket.on('make_gift', function(options) {

        if (!checkInput('make_gift', socket, userList, options))
            return new GameError(socket, "MAKEGIFT", "����������� �� ��������");

        if (userList[socket.id].getID() == options.id)
            return new GameError(socket, "MAKEGIFT", "������ ������� ������� ����");

        async.waterfall([///////////////////////////////////////////////////////////////////
            function (cb) { // ���� ������� � ����� id � ���� ������ (?????)
                db.findGood(options.giftid, function (err, gift) {
                    if (err) {
                        return cb(err, null)
                    }

                    if (gift) {
                        cb(null, gift);
                    } else cb(new Error("��� ������ �������"), null);
                });
            },///////////////////////////////////////////////////////////////
            function (gift, cb) { // ���� ������� � ����� id � ���� ������ (?????)
                var money = userList[socket.id].getMoney();
                if (money < gift.price) {
                    cb(new Error("������������ ����� ��� ���������� �������"), null);
                } else {
                    userList[socket.id].setMoney(money - gift.price, function (err, money) {
                        if (err) {
                            return cb(err, null);
                        }

                        socket.emit('money', {money: money});
                        cb(null, gift);
                    });
                }
            },///////////////////////////////////////////////////////////////
            function (gift, cb) { // �������� ������� ��������
                var recProfile = null;

                if (profiles[options.id]) { // ���� ������
                    recProfile = profiles[options.id];
                    cb(null, recProfile, gift);
                }
                else {                // ���� ��� - ����� �� ����
                    recProfile = new profilejs();
                    recProfile.build(options.id, function (err, info) {  // ����� VID � ��� ����, ��� ��� �����������
                        if (err) {
                            return cb(err, null);
                        }

                        cb(null, recProfile, gift);
                    });
                }
            },///////////////////////////////////////////////////////////////
            function (recProfile, gift, cb) { // ��������� �������
                var selfProfile = userList[socket.id];
                gift.fromid = selfProfile.getID();
                gift.fromvid = selfProfile.getVID();
                gift.date = options.date;
                recProfile.addGift(gift, function (err, result) {
                    if (err) {
                        return cb(err, null);
                    }

                    cb(null, gift);
                });
            }
        ], function (err, gift) { // ���������� ���������. ������������ ������
            if (err) {
                return new GameError(socket, "MAKEGIFT", err.message);
            }

            if (profiles[options.id]) {
                var recProfile = profiles[options.id];
                var recSocket = recProfile.getSocket();
                var info = {
                    giftid: gift.id,
                    type: gift.type,
                    data: gift.data,
                    date: gift.date,
                    fromid: gift.fromid,
                    fromvid: gift.fromvid,
                    title: gift.title
                };
                recSocket.emit('make_gift', info);
                recSocket.emit('get_news', recProfile.getNews());
            }
        }); // waterfall
    });
}

module.exports = makeGift;
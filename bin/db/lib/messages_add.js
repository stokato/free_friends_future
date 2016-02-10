/*
 �������� ��������� � ��: ��, ������ ���������
 - �������� (��� ���� �����������)
 - ���������� ��
 - ������ � ��������� ������
 - ���������� ������ ���������
 */
module.exports = function(uid, msg, callback) {
    var message = msg                 || {};
    var date = message.date;
    var companionid = message.companionid;
    var incoming  = message.incoming;
    var text      = message.text;
    var companionvid = message.companionvid;
    var opened   = message.opened;

    if (!date || !uid || !companionid || !text || !companionvid) {
        return callback(new Error("�� ������ ���� �� ���������� ���������"), null);
    }

    var id = this.uuid.random();

    var fields = "id, userid, date, companionid, companionvid, incoming, text, opened";
    var values = "?, ?, ?, ?, ?, ?, ?, ?";
    var params = [id, uid, date, companionid, companionvid, incoming, text, opened];

    var query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";

    this.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return callback(err); }

        callback(null, message);
    });
};
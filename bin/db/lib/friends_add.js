/*
 �������� ����� � ��: ��, ������ � ������� �����
 - �������� (��� ���� �����������)
 - ���������� ��
 - ������ � ��������� ������
 - ���������� ������ �������
 */
module.exports = function(uid, frnd, callback) {
    var friend = frnd || {};
    var fid   = friend.id;
    var date = friend.date;
    var fvid = friend.vid;

    if ( !uid || !fid || !fvid) {
        return callback(new Error("�� ������ Id ������������ ��� ��� �����"), null);
    }

    var fields = "userid, friendid, friendvid, date";
    var values = "?, ?, ?, ?";

    var params = [uid, fid, fvid, date];

    var query = "INSERT INTO user_friends (" + fields + ") VALUES (" + values + ")";

    this.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return callback(err); }

        callback(null, frnd);
    });
};
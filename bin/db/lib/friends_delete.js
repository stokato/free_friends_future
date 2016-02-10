/*
 ������� ���� ������ ������: ��
 - �������� �� ��
 - ������ � ��������� ������ �� ����� ���� ������ ������ (����� �� �� ��� ��������)
 - �� ������� ���������� ��������� ������ �� ��� �������� (�����������)
 - ���������� �� ������
 */
module.exports = function(uid, callback) {
    if (!uid) { callback(new Error("����� ������ Id ������������")); }

    var query = "DELETE FROM user_friends WHERE userid = ?";
    this.client.execute(query, [uid], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, uid);
    });

};
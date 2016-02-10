/*
 ������� ��� ��������� ������: ��
 - �������� �� ��
 - ������ � ��������� ������ �� ����� ���� ��������� ������ (����� �� �� ��� ��������)
 - �� ������� ���������� ��������� ������ �� ��� �������� (�����������)
 - ���������� �� ������
 */
module.exports = function(uid, callback) {
    var self = this;
    if (!uid) { callback(new Error("����� ������ Id ������������")); }

    var query = "select id FROM user_messages where userid = ?";

    self.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var fields = '';
        var params = [];
        for (var i = 0; i < result.rows.length-1; i ++) {
            fields += '?, ';
            params.push(result.rows[i]);
        }
        fields += '?';
        params.push(result.rows.length-1);

        var query = "DELETE FROM user_messages WHERE id in ( " + fields + " )";
        self.client.execute(query, [params], {prepare: true }, function(err) {
            if (err) {  return callback(err); }

            callback(null, uid);
        });
    });

};
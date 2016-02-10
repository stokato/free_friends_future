/*
 ������� ����� �� ��: ��
 - �������� �� ��
 - ������ � ��������� ������ �� �������� ������
 - ���������� �� ������
 */
module.exports = function(goodid, callback) {
    var id = goodid;
    if (!id) { callback(new Error("����� ������ Id ������")); }

    var query = "DELETE FROM shop WHERE id = ?";

    this.client.execute(query, [results.rows[0].id], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        cb(null, goodid);
    });

};
/*
 ������� ������������: ��
 - �������� �� ��
 - ���������� ��
 */
module.exports = function(id, callback) {
    if (!id) { callback(new Error("����� ������ Id")); }

    var query = "DELETE FROM users WHERE id = ?";

    this.client.execute(query, [id], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, id);
    });
};
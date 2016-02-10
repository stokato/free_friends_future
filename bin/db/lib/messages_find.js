/*
 ����� ����������� ��������� ������������: �� ������
 - �������� ��
 - ������ ������ (��� ����) � ���������
 - ���������� ������ � ����������� (���� ������ ��� - NULL)
 */
module.exports = function(uid, callback) {
    if (!uid) { return callback(new Error("����� ������ Id ������������"), null); }

    var query = "select id,  date,  companionid, companionvid,  incoming,  text, opened FROM user_messages where userid = ?";

    this.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var messages = [];

        if(result.rows.length > 0) {
            for(var i = 0; i < result.rows.length; i++) {
                var msg = result.rows[i];
                var message = {
                    id        : msg.id,
                    date      : msg.date,
                    companionid : msg.companionid,
                    companionvid : msg.companionvid,
                    incoming  : msg.incoming,
                    text      : msg.text,
                    opened    : msg.opened
                };
                messages.push(message);
            }

            callback(null, messages);

        } else {
            callback(null, null);
        }
    });
};
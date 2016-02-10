/*
 ����� ��� ������� ������: �� ������
 - �������� �� ��
 - ������ � ��������� ������ (��� ����)
 - ���������� ������ � ��������� (���� ������ ��� NULL)
 */
module.exports = function(uid, callback) {
    if (!uid) {
        return callback(new Error("����� ������ Id ������������"), null);
    }

    var query = "select giftid, type, data, date, fromid, fromvid FROM user_gifts where userid = ?";

    this.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var gifts = [];

        if(result.rows.length > 0) {
            for(var i = 0; i < result.rows.length; i++) {
                var gft = result.rows[i];
                var gift = {
                    giftidid : gft.giftid,
                    type : gft.type,
                    data : gft.data,
                    date : gft.date,
                    fromid : gft.fromid,
                    fromvid : gft.fromvid
                };
                gifts.push(gift);
            }

            callback(null, gifts);

        } else {
            callback(null, null);
        }
    });
};
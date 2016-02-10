/*
 �������� ����� � ��: ��, ������ � �������
 - �������� (��� ���� �����������)
 - ���������� ��
 - ������ � ��������� ������
 - ���������� ������ �������
 */
module.exports = function(gd, callback) {
    var good    = gd || {};

    var goodId  = good.id;
    var title   = good.title;
    var price   = good.price;
    var data    = good.data;
    var type    = good.type;

    if ( !goodId || !title || !price || !data || !type) {
        return callback(new Error("�� ������ Id ������"), null);
    }

    var id = this.uuid.random();

    var fields = "id, title, price, data, type";
    var values = "?, ?, ?, ?, ?";

    var params = [id, goodId, title, price, data, type];

    var query = "INSERT INTO shop (" + fields + ") VALUES (" + values + ")";

    this.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return callback(err); }

        callback(null, good);
    });
};
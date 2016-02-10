/*
 �������� ������� ���������:
 - ������ �� ��
 - ���� ����� �������� count - ��������� ���������� � �����
 - ���� ����� position - count � ��������� �������
 */
module.exports = function(options, callback) {
    var message = {
        id : options.id,
        opened : true
    };

    this.dbManager.updateMessage(this.pID,message, function(err) {
        if (err) { return callback(err, null); }

        callback(null, null);
    });
};
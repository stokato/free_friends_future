/*
 ������������� ���������� ����� ������
 - ������� � �� � ���� �������
 - � ���
 - ����������
 */
module.exports = function(num, callback) {
    if (!isNumeric(num)) {
        return callback(new Error("������ ��� ��������� ���������� �����, ���������� ����� ������ �����������"));
    }
    var self = this;
    var options = {
        id : self.pID,
        vid : self.pVID,
        money : num
    };

    self.dbManager.updateUser(options, function(err) {
        if (err) {return callback(err, null); }

        self.pMoney = options.money;
        callback(null, self.pMoney);
    });
};

function isNumeric(n) { // �������� - �������� �� �������� ������
    return !isNaN(parseFloat(n)) && isFinite(n);
}
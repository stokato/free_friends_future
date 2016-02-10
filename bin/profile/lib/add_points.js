/*
 ��������� ���� ������������
 - ������� � �� � ���� �������
 - � ���
 - ����������
 */
module.exports = function(num, callback) {
    if (!isNumeric(num)) {
        return callback(new Error("������ ��� ���������� ����� ������������, ���������� ����� ������ �����������"));
    }
    var self = this;
    var options = {
        id : self.pID,
        vid : self.pVID,
        points : self.pPoints + num
    };

    self.dbManager.updateUser(options, function(err) {
        if (err) {return callback(err, null); }

        self.pPoints = options.points;
        callback(null, self.pPoints);
    });
};
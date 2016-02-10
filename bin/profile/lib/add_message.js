/*
 ��������� ������ ��������� � ��
 - ��������� ������ ����� ����: ����������, ��������/bool, �����, ����
 */
module.exports = function(message, callback) {
    var self = this;
    self.dbManager.addMessage(self.pID, message, function(err) {
        if (err) { return callback(err, null); }

        self.pNewMessages ++;
        self.save(function(err) {
            if (err) { return callback(err, null); }

            callback(null, null);
        });
    });
};
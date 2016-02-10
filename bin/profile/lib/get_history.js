/*
 �������� ������� ���������:
 - ������ �� ��
 - ���� ����� �������� count - ��������� ���������� � �����
 - ���� ����� position - count � ��������� �������
 */
module.exports = function(count, position, callback) {
    var self = this;
    self.dbManager.findMessages(self.pID, function(err, messages) {
        if (err) { return callback(err, null); }

        if (!count) {
            callback(null, messages);
        } else {
            var history = [];
            var first = (position)? position : messages.length-1 - count;
            var last  = (position && (position + count) < messages.length-1)? position + count
                : messages.length-1;

            for (var i = first; i <= last; i++) {
                history.push(messages[i]);
            }
            self.pNewMessages = 0;
            self.save(function(err) {
                if (err) { return callback(err, null); }

                callback(null, history);
            });
        }
    });
};
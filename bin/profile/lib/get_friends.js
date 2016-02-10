/*
 �������� ���� ������ �� ��
 */
module.exports = function(callback) {
    var self = this;
    self.dbManager.findFriends(self.pID, function(err, friends) {
        if (err) { return callback(err, null); }

        self.pNewFriends = 0;
        self.save(function(err) {
            if (err) { return callback(err, null); }

            callback(null, friends);
        });
    });
};
/*
 Добавляем друга в БД
 */
module.exports = function(friend, callback) {
    var self = this;
    self.dbManager.addFriend(self.pID, friend, function (err) {
        if (err) { return callback(err, null); }

        self.pNewFriends ++;
        self.save(function(err) {
            if (err) {
                return callback(err, null);
            }

            callback(null, friend);
        });
    });
};
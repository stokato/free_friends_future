/*
 Добавляем гостя в БД
 */
module.exports = function(guest, callback) {
    var self = this;
    self.dbManager.addGuest(self.pID, guest, function(err, gst) {
        if (err) { return callback(err, null); }

        self.pNewMessages ++;
        self.save(function(err) {
            if (err) { return callback(err, null); }

            callback(null, gst);
        });
    })
};
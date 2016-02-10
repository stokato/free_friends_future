/*
 Получаем из БД все подарки
 */
module.exports = function(callback) {
    var self = this;
    self.dbManager.findGifts(self.pID, function(err, gifts) {
        if (err) { callback(err, null); }

        self.pNewGifts = 0;
        self.save(function(err) {
            if (err) { return callback(err, null); }

            callback(null, gifts);
        });
    });
};
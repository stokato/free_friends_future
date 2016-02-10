/*
 Добавляем подарок в БД
 */
module.exports = function(gift, callback) {
    var self = this;
    self.dbManager.addGift(self.pID, gift, function(err) {
        if (err) { return callback(err, null); }

        self.pNewGifts ++;
        self.save(function(err) {
            if (err) { return callback(err, null); }

            callback(null, gift);
        });
    });
};
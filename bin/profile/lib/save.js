/*
 Сохраняем профиль в БД
 */
module.exports = function(callback) {
    var self = this;
    var options = {
        id       : self.pID,
        vid      : self.pVID,
        age      : self.pAge,
        location : self.pLocation,
        gender   : self.pGender,
        status   : self.pStatus,
        points   : self.pPoints,
        money    : self.money
    };


    self.dbManager.updateUser(options, function(err, id) {
        if (err) { return callback(err, null); }

        callback(null, id);
    });
};
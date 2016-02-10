/*
 ������� ������������� �� ��
 - ������� �������
 - ������� �������
 - ������ ���������
 - ������
 - ������
 - ������ �����������
 */
module.exports = function(callback) {

    var self = this;
    self.pSocket   = null;

    self.pVID      = null;
    self.pAge      = null;
    self.pLocation = null;
    self.pStatus   = null;

    self.pPoints   = null;
    self.pGender   = null;
    self.pMoney    = null;

    self.dbManager.deleteGifts(this.pID, function(err, id) {  // ������� �������
        if(err) { return callback(err, null); }
        self.dbManager.deleteMessages(id, function(err, id) { // � �������
            if(err) { return callback(err, null) }
            self.dbManager.deleteFriends(id, function(err, id) { // � ������
                if(err) { return callback(err, null) }
                self.dbManager.deleteGuests(id, function(err, id) { // � ������
                    if(err) { return callback(err, null) }

                    self. dbManager.deleteUser(id, function(err, id) { // � ������ ������������
                        if(err) { return callback(err, null) }

                        callback(null, id);
                    });
                });
            });
        });
    });
};
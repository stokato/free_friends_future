
/*
 Инициализируем профиль
 - Устанавливаем полученные из соц сети свойства (в БД они точно не нужны, а в ОЗУ ???)
 - Что-то проверяем
 - Ищем пользователя в БД и заполняем оставшиеся свойства
 - Если нет - добавляем
 - Возвращаем свойсва
 */
module.exports = function(id, callback) {
    var self = this;
    self.pID = id;

    if (!self.pID) { return callback(new Error("Не задан ИД"), null); }

    var fList = ["gender", "points", "status", "location", "age"];
    self.dbManager.findUser(self.pID, null, fList, function(err, foundUser) {
        if (err) { return  callback(err, null); }
        if (!foundUser) { return callback(new Error("Такого пользователя нет в БД"), null); }

        self.pVID     = foundUser.vid;
        self.pStatus = foundUser.status;
        self.pPoints = foundUser.points;
        self.pGender = foundUser.gender;
        self.pLocation = foundUser.location;
        self.pAge = foundUser.age;

        self.pNewMessages = foundUser.newmessages || 0;
        self.pNewGifts    = foundUser.newgifts || 0;
        self.pNewFriends  = foundUser.newfriends || 0;
        self.pNewGuests   = foundUser.newguests || 0;
        // self.pMoney  = foundUser.money;

        var info = {
            id       : self.pID,
            vid      : self.pVID,
            age      : self.pAge,
            location : self.pLocation,
            status   : self.pStatus,
            points   : self.pPoints,
            //money    : self.pMoney,
            gender   : self.pGender,
            messages : self.pNewMessages,
            gifts    : self.pNewGifts,
            friends  : self.pNewFriends,
            guests   : self.pNewGifts
        };

        callback(null, info);
    });
};
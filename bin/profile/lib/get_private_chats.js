/*
 Получаем историю сообщений одного собеседника:
 - Читаем из БД
 - Если задан параметр count - указанное количество с конца
 - Если задан position - count с указанной позиции
 */
module.exports = function(count, position, callback) {
    var self = this;
    if(self.pPrivateChats[0]) { // Если есть открытые чаты
        var arr = [];
        for(var i = 0; i < self.pPrivateChats.length; i++) { // Готовим массив их ид
            arr.push(self.pPrivateChats[i].id);
        }
        self.dbManager.findMessages(self.pID, arr, function(err, messages) { // Получаем историю
            if (err) { return callback(err, null); }

            messages = messages || [];
            messages.sort(compareCompanions); // Сортируем по ид

            var chats = {};
            for(var j = 0; j < self.pPrivateChats.length; j++) { // Готовим список чатов
                chats[self.pPrivateChats[j].id] = {
                                                    id : self.pPrivateChats[j].id,
                                                    vid: self.pPrivateChats[j].vid,
                                                    messages : []
                                                    }
            }

            var currChat = null;
            for(var i = 0; i < messages.length; i++) { // Разносим историю по чатам
                if(currChat != messages[i].companionid) {
                    currChat = messages[i].companionid;
                }

                chats[currChat].messages.push(messages[i]);
            }

            callback(null, chats);

        });
    } else { callback(null, null) ;}
};

// Для сортировки массива игроков (получение топа по очкам)
function compareCompanions(userA, userB) {
    return userB.companionid - userA.companionid;
}
var vk = require('vksdk');

user = {
//Получаем пол пользователя
    getSex: function getSex(request) {
        var sex = vk.request('users.get', {fields:'sex'} , function(err) {
                if(err){
                    console.log(err);
                }
                else {
                    console.log('The users sex request successfully', request.params.user_sex);
                }
        })
        return sex;
    },

//Получаем ID пользователя
    getID: function getID(request) {
        var ID = vk.request('users.get', {fields:'id'}, function(err) {
                if(err) {
                    console.log(err);
                }
                else {
                    console.log('The users ID request successfully', request.params.user_uid);
                }
        })
        return ID;
    },
 
//Проверка: установлено ли уже данное приложение у пользователя
// Вернет 1, если установленно, противном случае вернет - 0  
    checkApp: function checkApp() {
            var app = vk.request(users.isAppUser, {}, function(err) {
                    if(err) {
                        console.log(err);
                    }
                    else {
                        console.log('isAppUser checked');
                    }
            })
            return app;
    }
};

module.exports = user;
//Игра бутылочка
 
var Cassandra = require('cassandra-driver'),
              query = require('../query'),
	              cfg = require('../config');
 
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});
 
//Массив пользователей
var users = new Array(12),
    target = new Array(6);

//Максимум м минимум для генератора случайных чисел
var max = 11,
    min = 0;
	  
var temp  = 0, //Хранит максимальное значение массива
    index = 0; //Хранит индекс максимального значения массива

var bottle = {
spinBottle: function spinBottle(gender) {
	
	switch(gender) {
        //Крутим парней
		case 1: 
          for(int i = 0; i < users.length; i++) {
                client.execute("select user_id from users where sex = ?", [gender], {prepare: true}, function(error, response) {
                    if(error) {
						console.log(error);
					}
					else {
						users [i] = response.rows[0].user_id;
					}
                });
            } break;
			
		//Крутим девушек
		case 2: 
		  for(int i = 0; i < users.length; i++) {
                client.execute("select user_id from users where sex = ?", [gender], {prepare: true}, function(error, response) {
                    if(error) {
						console.log(error);
					}
					else {
						users [i] = response.rows[0].user_id;
					}
                });
            } break;
			
        //Сохраняем всех в массив и крутим генератор
		default:
			for(int i = 0; i < users.length; i++) {
                client.execute("select user_id from users", {prepare: true}, function(error, response) {
                    if(error) {
						console.log(error);
					}
					else {
						users [i] = response.rows[0].user_id;
					}
                });
            } break;
	}
	
	for(i = 0; i < users.length; i++) {

	}
	
	for(i = 0; i < users.length; i++) {
			users[i] = (Math.random() * (max - min) + min).toFixed(0);
    }
	
	 temp = users[0];
    
    for(i = 0; i < users.length; i++) {
			if(temp < users[i]) {
				temp = users[i];
				index = i;
			}
    else continue;
    }
    return index;
},

getGender: function getGender(user_id) {
	client.execute("select sex from users where user_id = ?", [user_id], {prepare: true}, function(error, response) {
		if(error) {
			console.log(error);
		}
		else {
				switch(response.rows[0].sex) {
					//Если getGender вернет 1 (женщина), spinBottle будет крутить парней в массиве
					case 1: spinBottle(2); break; 
					//Если getGender вернет 2 (мужчина), spinBottle будет крутить девушек в массиве
					case 2: spinBottle(1); break; 
					//В противном случае, предпологаем, что getGender вернул 0 (пол не указан), spinBottle будет крутить всех в массиве
					default: spinBottle(0); break; 
				}
		}
	});
}
};

module.exports = bottle;
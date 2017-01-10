var Cassandra = require('cassandra-driver'),
          cfg = require('../config/configuration.js');

var Host     = cfg.cassandra.host,
	Port     = cfg.cassandra.port,
	Keyspace = cfg.cassandra.keyspace; 

var client = new Cassandra.Client({contactPoints: [Host, Port], keyspace: Keyspace});

exports = module.exports = User;

//Инициализация пользователя
function User() {
	if(!(this instanceof User)) return new User();
	
	this.uid = null;
	this.profile = {};
	this.room = null;
	this.seat = -1;
}

//Установка параметров профиля пользователя
User.prototype.setProfile = function( settings ) {
	this.uid = settings.uid;
	this.profile = {
		uid: settings.uid, //id пользователя
		status: settings.status, //статус пользователя
		name: settings.name, //имя пользователя
		city: settings.city, //город пользователя
		age: settings.age, //возраст пользователя
		relation: settings.relation, //семейное положение пользователя
		avatar: settings.avatar, //аватар пользователя
		coins: settings.coins, //монеты пользователя
		points: settings.points //поинты пользователя
	};
	
	return this;
};

//Получение параметров профиля пользователя
User.prototype.getProfile = function() {
	var settings = this.profile;
	return {
		uid: settings.uid, //id пользователя
		status: settings.status, //статус пользователя
		name: settings.name, //имя пользователя
		city: settings.city, //город пользователя
		age: settings.age, //возраст пользователя
		relation: settings.relation, //семейное положение пользователя
		avatar: settings.avatar, //аватар пользователя
		coins: settings.coins, //монеты пользователя
		points: settings.points //поинты пользователя
	};
};

//Вернуть имя пользователя
User.prototype.getName = function() {
	return {
		uid: this.uid,
		name: this.profile.name
	};
};

//Вернуть монеты пользователя
User.prototype.getCoins = function() {
	return {
		uid: this.uid,
		coins: this.profile.coins
	};
};

//Вернуть поинты пользователя
User.prototype.getPoints = function() {
	return {
		uid: this.uid,
		points: this.profile.points
	};
};

//Установка ссылки на соедниение
User.prototype.setLink = function(server, socket, pin) {
	var user = this;
	var uid = user.uid;
	
	if(user.socket) {
		user.removeLink();
	}
	
	user.server = server;
	user.socket = socket;
	user.pin = pin;
	
	socket.user[ uid ] = user;
	socket.users_count ++;
	
	return this;
};

//Удаление ссылки
User.prototype.removeLink = function() {
	var user = this;
	
	var socket = user.socket;
	if(socket) {
		delete socket.users[ user.uid ];
		socket.users_count --;
	}
	
	user.socket = null;
	user.server = null;
	user.pin = null;
	
	return this;
};

//Сохранение данных
User.prototype.saveData = function ( reply ) {
  var user = this;
  var info = user.profile;
  var set_coins = info.coins;
  var set_points = info.points;
  var user_id = info.uid;
  var query = "UPDATE users SET points = ? coins = ? WHERE UID = ?";
  client.execute(query, [set_points, set_coins, user_id], {prepare: true}, function(error, response) {
  	if(error) {
  		console.log(error);
  	}
  	else {
  		console.log("Save data for " + user_id + " complete !");
  	}
  });
};


//Загрузка данных
User.prototype.loadData = function() {
  var user = this;
  var info = user.profile;
  var UID = info.uid;
  var query = "SELECT coins, points FROM users WHERE UID = ?";
  client.execute(query, [UID], {prepare: true}, function(error, response) {
  	if(error) {
  		console.log(error);
  	}
  	else {
  		console.log("Data loadig for " + UID + " is done !");
  	}
  });
  return this;
};
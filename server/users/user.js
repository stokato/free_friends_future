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
		coins: settings.coins //монеты пользователя
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
		coins: settings.coins //монеты пользователя
	};
};

//Вернуть имя пользователя
User.prototype.getName = function() {
	return {
		uid: this.uid,
		name: this.profile.name
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
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
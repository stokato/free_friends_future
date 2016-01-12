exports = module.exports = User;

//Инициализация пользователя
function User() {
	if(!(this instanceof User)) return new User();
	
	this.uid = null;
	this.profile = {};
	this.room = null;
	this.seat = -1;
}
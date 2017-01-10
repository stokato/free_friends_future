var User = require('../users/user.js');

exports = module.exports = Room;

function Room( game, roomid, options ) {
	this.options = {
		max_seats: 12
	};

	if(options && (typeof options === 'object')) {
		for(var i in options) this.options[i] = options[i];
	}
	
	this.game = game;
	
	this.id = roomid;
	
	this.users = {};
	this.users_count = 0;
	
	this.seats_count = this.options.max_seats;
	this.seats_taken = 0;
	this.seats = [];
	for(var j=0; j<this.seats_count; j++) {
		this.seats.push(null);
	}
}
var addPlayer = "INSERT INTO users (user_id, first_name, last_name, login, password, city, date, sex, relation, avatar, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

var query = {
    addPlayer: addPlayer
};

module.exports = query;
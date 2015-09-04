var addPlayer = "INSERT INTO users (user_id, first_name, last_name, login, password, city, date, sex, relation, avatar, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    logon     = "SELECT password FROM users WHERE login = ?",
    getID     = "SELECT user_id FROM users WHERE login = ?";

var query = {
    addPlayer: addPlayer,
    logon: logon,
    getID: getID
};

module.exports = query;
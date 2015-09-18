var addPlayer = "INSERT INTO users (user_id, country, city, date, sex, coins, points) VALUES (?, ?, ?, ?, ?, ?, ?)",
    logon     = "SELECT user_id FROM users WHERE user_id = ?";

var query = {
    addPlayer: addPlayer,
    logon: logon
};

module.exports = query;
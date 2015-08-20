var addPlayer = "INSERT INTO players (id, user_id, age, city, relation, sex, status, points) VALUES (?,?,?,?,?,?,?,?)";

var query = {
    addPlayer: addPlayer
};

module.exports = query;
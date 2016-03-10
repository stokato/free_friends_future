function() { // Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
  var firstGender = currPlayers[0].getSex();
  var secondGender = (firstGender == 'guy') ? 'girl' : 'guy';
  var player = randomPlayer(gRoom, secondGender);
  currPlayers.push(player);
  nextGame = 'bottle_kisses';
  countActions = 2;
  actionsQueue = {};

  var options = {};
  options['players'] = getPlayersID(currPlayers);
  self.emit(options);

  currTimer = startTimer(handlers[nextGame], countActions);
}
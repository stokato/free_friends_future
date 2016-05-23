var Config = require('./../../config.json');

var G_START         = 'results',
  G_LOT           = 'lot',
  G_BOTTLE        = 'bottle',
  G_BOTTLE_KISSES = 'bottle_kisses',
  G_QUESTIONS     = 'questions',
  G_CARDS         = 'cards',
  G_BEST          = 'best',
  G_SYMPATHY      = 'sympathy',
  G_SYMPATHY_SHOW = 'sympathy_show';

var GAMES = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY ];
var QUESTIONS = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."];
var TIMEOUT = 10;
var CARD_COUNT = 10;
var PLAYERS_COUNT = 2;//10;
var SYMPATHY_LIMIT = 2;

module.exports.CONFIG = Config.user.constants;

module.exports.G_START = G_START;
module.exports.G_LOT = G_LOT;
module.exports.G_BOTTLE = G_BOTTLE;
module.exports.G_BOTTLE_KISSES = G_BOTTLE_KISSES;
module.exports.G_QUESTIONS = G_QUESTIONS;
module.exports.G_CARDS = G_CARDS;
module.exports.G_BEST  = G_BEST;
module.exports.G_SYMPATHY = G_SYMPATHY;
module.exports.G_SYMPATHY_SHOW = G_SYMPATHY_SHOW;

module.exports.GAMES = GAMES;
module.exports.GAME_QUESTIONS = QUESTIONS;
module.exports.TIMEOUT = TIMEOUT;
module.exports.CARD_COUNT = CARD_COUNT;
module.exports.PLAYERS_COUNT = PLAYERS_COUNT;
module.exports.SHOW_SYMPATHY_LIMIT = SYMPATHY_LIMIT;


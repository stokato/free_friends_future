/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Контроллер рангов пользователей одной комнаты
 *
 */

var constants = require('./../constants');

var addProfile        = require('./lib/add_profile'),
    deleteProfile     = require('./lib/delete_profile'),
    addRankBall       = require('./lib/add_rank_ball'),
    getRanksOfProfile = require('./lib/get_ranks_of_profile'),
    awardProfile      = require('./lib/award_prfile'),
    takeBonus          = require('./lib/take_bonus');

function RanksManager() {
  
  // Обладатели званий
  this._rankOwners = {};
  
  // Накопленные бонусы по каждому званию
  this._bonuses = {};
  
  for(var item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    this._rankOwners[constants.RANKS[item]] = null;
    this._bonuses[constants.RANKS[item]] = 0;
  }
  
  // Список пользователей со счетчиками званий
  this._profiles = {};
  
  // Обработчик события писвоения звания
  this._onRank = null;
  
  // Обработчики для начисления бонусов по каждому званию
  this._onRankBonus = {};
}

RanksManager.prototype.getRankOwner   = function (rank) { return this._rankOwners[rank]; };
RanksManager.prototype.setOnRank      = function (handler) { this._onRank = handler; };
RanksManager.prototype.setOnRankBonus = function (rank, handler) { this._onRankBonus[rank] = handler; };

RanksManager.prototype.addProfile         = addProfile;
RanksManager.prototype.deleteProfile      = deleteProfile;
RanksManager.prototype.addRankBall        = addRankBall;
RanksManager.prototype.getRanksOfProfile  = getRanksOfProfile;
RanksManager.prototype.awardProfile       = awardProfile;
RanksManager.prototype.takeBonus          = takeBonus;

module.exports = RanksManager;
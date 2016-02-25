var db = require('../db');

var getGood = require('./lib/get_good');
var getGoodTest = require('./lib/get_good_test');
var issueGood  = require('./lib/issue_good');
var issueGoodTest = require('./lib/issue_good_test');

function Shop () {
  this.dbManager = new db();
}

Shop.prototype.getGood = getGood;
Shop.prototype.getGoodTest = getGoodTest;

Shop.prototype.issueGood = issueGood;
Shop.prototype.issueGoodTest = issueGoodTest;

module.exports = Shop;
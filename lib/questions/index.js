/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Обработка вопросов
 */

var log = require('./../log')(module);
var express = require('express');
var router = express.Router();
var checkAuth = require('./../passport/is_autenticated');

var addQuestion         = require('./lib/add_question');
var getQuestions        = require('./lib/get_questions');
var deleteQuestions     = require('./lib/delete_questions');
var addUserQuestions    = require('./lib/add_user_questions');
var getUserQuestions    = require('./lib/get_user_questions');
var deleteUserQuestions = require('./lib/delete_user_questions');

// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

router.get('/', checkAuth, getQuestions);

router.post('/', checkAuth, function (req, res, next) {
  if(req.body.operation_type == 'insert') {
    addQuestion(req, res, next);
  } else if(req.body.operation_type == 'delete') {
    deleteQuestions(req, res, next);
  } else {
    next(new Error('not implemented'));
  }
});

router.get('/user', checkAuth, getUserQuestions);

router.post('/user', checkAuth, function (req, res, next) {
  if(req.body.operation_type == 'insert') {
    addUserQuestions(req, res, next);
  } else if(req.body.operation_type == 'delete') {
    deleteUserQuestions(req, res, next);
  } else {
    next(new Error('not implemented'));
  }
});

module.exports = router;

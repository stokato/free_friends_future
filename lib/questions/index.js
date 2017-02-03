/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Обработка вопросов
 */

const express   = require('express');
const router    = express.Router();
const checkAuth = require('./../passport/is_autenticated');

const addQuestion         = require('./lib/add_question');
const getQuestions        = require('./lib/get_questions');
const deleteQuestions     = require('./lib/delete_questions');
const addUserQuestions    = require('./lib/add_user_questions');
const getUserQuestions    = require('./lib/get_user_questions');
const deleteUserQuestions = require('./lib/delete_user_questions');
const setQuestionsActivity = require('./lib/set_question_activity');
const reloadGameQuestions = require('./lib/reload_game_questions');
const updateQuestion      = require('./lib/update_question');

// router.use(function timeLog(req, res, next) {
//   console.log('Time: ', Date.now());
//   next();
// });

router.get('/', checkAuth, getQuestions);

router.post('/', checkAuth, function (req, res, next) {
  if(req.body.operation_type == 'insert') {
    addQuestion(req, res, next);
  } else if(req.body.operation_type == 'update') {
    updateQuestion(req, res, next);
  } else if(req.body.operation_type == 'activity') {
    setQuestionsActivity(req, res, next);
  } else if(req.body.operation_type == 'refresh') {
    reloadGameQuestions(req, res, next);
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

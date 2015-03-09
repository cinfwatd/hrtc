var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(request, response, next) {
  response.redirect('/auth/login');
});

router.get('/login', function(request, response, next) {
  response.render('login', { title: 'Express' });
});

router.post('/login', function(request, response, next) {
  var username = request.body.username;
  var password = request.body.password;
  // var remember = request.sanitize('remember').toBoolean();
  var remember = Boolean(request.body.remember);

  request.checkBody('username', 'The Username field is required.').notEmpty();
  if (username)
    request.checkBody('username', 'The Username must be between 4 and 25 characters.').len(4, 25).optional();

  request.checkBody('password', 'The Password field is required.').notEmpty();
  if (password)
    request.checkBody('password', 'The Password must be at least 4 characters.').len(4).optional();
  // request.assert('password', 'The Password must not be more than 25 characters')

  var errors = request.validationErrors();
  if (errors) {
    // console.log(errors);
    response.render('login', { errors: errors, username: request.body.username });
  } else {
    response.send('form processing ...' + username+ '@' + password + ':' + remember);
  }
  // response.rend('form request');
});

router.get('/logout', function(request, response, next) {
  //clear the session and redirect to login page.
  response.redirect('/auth/login');
});

router.get('/forgot-password', function(request, response, next) {
  response.send('forgot password page..');
});

router.get('/reset-password', function(request, response, next) {
  response.send('reset password page..');
});

module.exports = router;

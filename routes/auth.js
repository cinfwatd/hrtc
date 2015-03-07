var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(request, response, next) {
  response.redirect('/auth/login');
});

router.get('/login', function(request, response, next) {
  response.send('Login page..');
});

router.post('/login', function(request, response, next) {
  response.send('form request');
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

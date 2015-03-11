var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(request, response, next) {
  var User = require('../models/user');
  var newUser = User();

  newUser.username = 'solo';
  newUser.password = newUser.generateHash('pass');
  newUser.name.first = 'Solomon';
  newUser.name.last = 'Bariya';
  newUser.email = 'solman@mailinator.com';

  newUser.save(function (err, user) {
    if (err) return console.error(err.red);
    else return console.log('saved newUser'.green);
  });

  response.send('welcome page...');
});

// router.get('/dashboard', function(request, response, next) {
//   response.send('dashboard');
// })

module.exports = router;

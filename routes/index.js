var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(request, response, next) {
  var User = require('../models/user');
  var newUser = User();

  newUser.username = 'docky';
  newUser.password = newUser.generateHash('pass');
  newUser.name.first = 'Bulleier';
  newUser.name.last = 'Jerulsa';
  newUser.email = 'jbulle@mailinator.com';
  newUser.groups.push('Doctor');

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

var express = require('express');
var router = express.Router();

var User = require('../models/user');

/* GET home page. */
router.get('/', function(request, response, next) {
  // response.send('welcome page...');
  // response.redirect('auth/login');
  // var newUser = User();
  //   newUser.username = 'admin';
  //   newUser.password = newUser.generateHash('pass');
  //   newUser.name.first = 'User';
  //   newUser.name.last = 'Super';
  //
  //   newUser.email = 'superuser@mailinator.com';
  //   newUser.groups.push('Admin');
  //
  //   newUser.save(function(error, user) {
  //     if (error) return console.log('error creating user');
  //     // return console.log('New User created.');
  //     return response.redirect('auth/login');
  //   });
  return response.redirect('auth/login');
});

module.exports = router;

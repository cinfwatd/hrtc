var express = require('express');
var router = express.Router();

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(request, response, next) {
  response.redirect('/auth/login');
});

router.get('/login', function(request, response, next) {
  if (request.session && request.session.authenticated)
    return response.redirect('/dashboard');
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
    response.render('login', { errors: errors, username: username });
  } else {
    // var data = User.findOne({username: username, password: password});
    // response.send('form processing ...' + username+ '@' + password + ':' + remember);
    User.findOne({username: username}, function(error, user) {
      if(error){
        console.log(error.red);
      }

      if(user) {
        if (user.validatePassword(password)) {
          request.session.authenticated = true;
          request.session.userId = user._id;
          return response.redirect('/dashboard');
        }
        return response.render('login',
          { errors: {
              error: { msg: 'Invalide login credentials.'}
            },
            username: username
          });

      } else {
        return response.render('login',
          { errors: {
              error: { msg: 'User not found.'}
            },
            username: username
          });
      }

    });
    // response.send('form request');
  }
  // response.rend('form request');
});

router.get('/logout', function(request, response, next) {
  //clear the session and redirect to login page.
  request.session.destroy();
  response.redirect('/auth/login');
});

router.get('/forgot-password', function(request, response, next) {
  // response.send('forgot password page..');
  response.render('forgot-password');
});

router.post('/forgot-password', function(request, response, next) {
  var email = request.body.email;

  request.checkBody('email', 'The Email field is required').notEmpty();
  if (email)
    request.checkBody('email', 'The Email provided seems to be invalid.').isEmail();

  var errors = request.validationErrors();

  if (errors) {
    response.render('forgot-password', {errors: errors, email: email});
  } else {
    User.findOne({email: email}, function(error, user) {
      if (error) {
        console.log('An error occured when checking for user to reset password.');
      }

      if (user) {
        // send token through email and notify the user.
        return response.render('forgot-passord',
          { success: 'Please check your Inbox for the email.'});

      } else {
        return response.render('forgot-password',
          { errors: {
            error: { msg: 'User ['+ email+'] not found.'}
          },
          email: email
        });
      }
    });
  }
})

router.get('/reset-password', function(request, response, next) {
  response.send('reset password page..');
});

module.exports = router;

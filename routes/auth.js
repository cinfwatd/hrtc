var express = require('express'),
  router = express.Router(),
  nodemailer = require('nodemailer'),
  crypto = require('crypto');

var User = require('../models/user');
var redirectTo = '/calendar';

var smtpTransport = nodemailer.createTransport({
  service: 'mandrill',
  auth: {
    user: 'czprobity@gmail.com',
    pass: 'jhCGwCscVOcZonkYgUqZBg'
  }
});

/* GET users listing. */
router.get('/', function(request, response, next) {
  response.redirect('/auth/login');
});

router.get('/login', function(request, response, next) {
  // console.log(request.get('referrer'));
  if (request.session && request.session.authenticated)
    return response.redirect(redirectTo);
  response.render('auth/login', { pageTitle: 'Login' });
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
    request.flash('error', errors);
    request.flash('username', username);
    response.redirect('/auth/login');
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
          request.session.username = user.name.full;
          request.session.userPicture = user.picture;
          // request.session.user = user;
          request.session.lastLogin = user.lastLogin;
          if (user.groups.indexOf("Patient") >= 0) {
            request.session.doctors = user.doctors;
            request.session.isDoctor = false;
            request.session.patients = [];
          } else if (user.groups.indexOf("Doctor") >= 0) {
            request.session.doctors = [];
            request.session.patients = user.patients;
            request.session.isDoctor = true;
          }
          // request.session.doctors = user.doctors;
          user.lastLogin = Date.now();
          user.save();
          return response.redirect(redirectTo);
        }
        request.flash('error', "Invalid login credentials.");
        request.flash('username', username);
        return response.redirect('/auth/login');

      } else {
        request.flash('error', "Inalid login credentials.");
        request.flash('username', username);
        return response.redirect('/auth/login');
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
  response.render('auth/forgot-password', {pageTitle: "Forgot Password"});
});

router.post('/forgot-password', function(request, response, next) {
  var email = request.body.email;

  request.checkBody('email', 'The Email field is required.').notEmpty();
  if (email)
    request.checkBody('email', 'The Email provided seems to be invalid.').isEmail();

  var errors = request.validationErrors();

  if (errors) {
    // console.log(errors);
    request.flash('error', errors);
    request.flash('email', email);
    response.redirect('/auth/forgot-password');
  } else {
    User.findOne({email: email}, function(error, user) {
      if (error) {
        console.log('An error occured when checking for user to reset password.');
      }

      if (user) {
        crypto.randomBytes(20, function(error, buffer) {
          if (error) {
            console.log("An error occured  with crypto".red);
          }
          var token = buffer.toString('hex');

          user.resetPassword.token = token;
          user.resetPassword.expiration = Date.now() + 3600000; //1hr

          user.save(function(error, user) {
            var mailOptions = {
              to: user.email,
              from: 'passwordreset@telemonitor.com',
              subject: 'Password Reset',
              text: 'You are receiving this because you (or someone else) '
              + 'have requested the reset of the password for your account.\n\n'
              + 'Please click on the following link, or paste this into your browser '
              + 'to complete the process: \n\nhttp://' + request.headers.host
              + '/auth/reset/' + token + '\n\nIf you did not request this, please '
              + 'ignore this email and your password will remain unchanged.\n'
            };

            smtpTransport.sendMail(mailOptions, function(error) {
              if (error) {
                console.log('An error occured in sendMail'.red);
                console.error(error);
                request.flash('error',  'An error occured while trying to send the email. Please try again.');
                request.flash('email', user.email);
                return response.redirect('/auth/forgot-password');
              }

              request.flash('info', 'An e-mail has been sent to <b>' + user.email + '</b> with further instructions.');
              return response.redirect('/auth/forgot-password');
            });
          });
        });
        // remember to redirect back on any errro
        // return response.render('forgot-passord',
        //   { error: 'Please check your Inbox for the email.'});

      } else {
        request.flash('error', 'No account with this email [' + email + '] exist.');
        request.flash('email', email);
        return response.redirect('auth/forgot-password');
      }
    });
  }
})

router.get('/reset/:token', function(request, response, next) {
  // response.send('reset password page..');
  User.findOne({'resetPassword.token': request.params.token,
    'resetPassword.expiration': {$gt: Date.now()}}, function(error, user) {
      if (!user) {
        request.flash('error', 'Password reset token is invalid or has expired.');
        return response.redirect('/auth/forgot-password');
      } else {
        request.flash('token', request.params.token);
        return response.render('auth/reset-password', {pageTitle: "Reset Password"});
      }
    });
});

router.post('/reset/:token', function(request, response, next) {
  var password = request.body.password;
  var confirmation = request.body.confirmation;

  request.checkBody('password', 'The Password and Password Confirmation field are required.').notEmpty();
  request.checkBody('password', 'The Password must be at least 4 characters.').len(4);
  request.checkBody('password', 'The Password Confirmation did not match the Password entered.').equals(confirmation);

  var errors = request.validationErrors();
  if (errors) {
    request.flash('error', errors);
    response.render('auth/reset-password', {pageTitle: "Reset Password"});
  } else {
    User.findOne({'resetPassword.token': request.params.token,
      'resetPassword.expiration': {$gt: Date.now()}}, function(error, user) {
      if (!user) {
        request.flash('error', 'Password request token is invalid or has expired.');
        return response.redirect('back');
      }

      user.password = user.generateHash(password);
      user.resetPassword.token = undefined;
      user.resetPassword.expiration = undefined;

      user.save(function(error) {
        // response.redirect('/auth/login');
        var mailOptions = {
          to: user.email,
          from: 'passwordreset@telemonitor.com',
          subject: 'Your Password Has Been Changed',
          text: 'Hello '+ user.name.full +',\n\nThis is a confirmation that the password for your account '
            + user.email + ' has been changed.\n'
        };

        smtpTransport.sendMail(mailOptions, function(error) {
          if (error) {
            console.log('An error occured while sending the confirmation mail.'.red);
          }
          request.flash('success', '<b>Success!</b> Your password has been changed.');
          response.redirect('/auth/login');
        })
      });
    });
  }
});

module.exports = router;

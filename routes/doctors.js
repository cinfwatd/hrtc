var express = require('express'),
  router = express.Router(),
  User = require('../models/user'),
  Appointment = require('../models/appointment'),
  async = require('async');

router.get('/', function(request, response, next) {
  response.render('doctors/list', {pageTitle: "Doctors"})
});

router.get('/:id', function(request, response, next) {
  var id = request.params.id;
  var msg = "): This is embarrassing. We couldn't find that Doctor. Please try again!";
  // make sure user is a MD
  async.waterfall([
    function(callback) {
      User.findOne({
        _id: id,
        groups: 'Doctor'
      }).exec(function(error, user) {
        callback(error, user);
      });
    },
    function(user, callback2) {
      if (user) {
        Appointment.findOne({
          receiver: user.id,
          sender: request.session.userId,
          'status.expired' : false,
          'status.granted': false
        }).exec(function(error, appoint) {
          callback2(error, user, appoint);
        });
      } else {
        request.flash('error', msg);
        return response.redirect('/doctors');
      }
    }
  ], function(error, user, appoint) {
// console.log(appoint);
    var pageTitle = "Dr. " + user.name.full + "'s Profile", found = false;
    if (appoint) {
      found = true;
    }

    return response.render('doctors/profile', {pageTitle: pageTitle, user: user, doc: id, found: found});
  });
});

router.post('/request', function(request, response, next) {
  var start = request.body.start;
  var end = request.body.end;
  var message = request.body.msg;
  var doc = request.body.doc;

  var newRequest = Appointment();
  newRequest.receiver = doc;
  newRequest.sender = request.session.userId;
  newRequest.message = message;
  newRequest.chat.start = start;
  newRequest.chat.end = end;
  newRequest.save(function(error, appointment) {
    if (error) return response.status(500).send("Not Ok");
    else return response.status(200).send("OK");
  });
  // newRequest.
  // return response.status(200).send("OK");
});

module.exports = router;

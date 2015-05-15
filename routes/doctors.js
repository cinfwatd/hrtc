var express = require('express'),
  router = express.Router(),
  User = require('../models/user'),
  Appointment = require('../models/appointment'),
  Hospital = require('../models/hospital'),
  async = require('async');

router.get('/', function(request, response, next) {
  User.find({
    groups: 'Doctor'
  }, function(error, docs) {
    response.render('doctors/list', {pageTitle: "Doctors", doctors: docs})
  }).populate('hospital');
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
      })
      .populate('hospital')
      .exec(function(error, user) {
        callback(error, user);
      });
    },
    function(user, callback2) {
      if (user) {
        Appointment.findOne({
          receiver: user.id,
          sender: request.session.userId,
          'status.read' : false,
          // 'status.granted': false
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
  if (start == end)
    message = message + "<hr style='margin:0px' /><Appointment Date: " + start;
  else
    message = message + "<hr style='margin:0px' />Appointment Date: (" + start + " - " + end+ ")";
  //accept request.
  // set user patient and doctor respectively
  message = message + "<hr style='margin:0px' /><a href='/doctors/accept/" + request.session.userId + "/" + encodeURIComponent(request.session.username) + "'>Accept Request</a><hr style='margin:0px' />";
  message = message + "<small>Accepting request simply associates the Patient with you. (Required for Patients sidebar)</small>"

  newRequest.message = message;
  newRequest.chat.start = start;
  newRequest.chat.end = end;

  // put message as already softdeleted and harddeleted
  // by sender so as not to show on the senders page.
  newRequest.softDeleted.push(request.session.userId);
  newRequest.hardDeleted.push(request.session.userId);

  newRequest.save(function(error, appointment) {
    if (error) return response.status(500).send("Not Ok");
    else return response.status(200).send("OK");
  });
  // newRequest.
  // return response.status(200).send("OK");
});

router.get('/accept/:id/:name', function(request, response, next) {
  var patient = request.params.id;
  var name = request.params.name;

  // console.log("Id: " + patient + " Name: " + name);

});

module.exports = router;

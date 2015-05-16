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

  async.waterfall([
    function(callback) {
      User.findOne({
        _id: request.session.userId,
        groups: 'Patient',
        "doctors.id": {$ne: doc}
      }, function(error, user) {
        if (user) {
          var newRequest = Appointment();
          newRequest.receiver = doc;
          newRequest.sender = request.session.userId;
          if (start == end)
            message = message + "<hr style='margin:0px' /><Appointment Date: " + start;
          else
            message = message + "<hr style='margin:0px' />Appointment Date: (" + start + " - " + end+ ")";
          //accept request.
          // set user patient and doctor respectively
          message = message + "<hr style='margin:0px' /><button class='btn btn-xs btn-white btn-primary' id='accept' data-href='/doctors/accept/" + request.session.userId + "'>Accept Request</button><hr style='margin:0px' />";
          message = message + "<small>Accepting request simply associates the Patient with you. (Required for Patients sidebar)</small>"

          newRequest.message = message;
          newRequest.chat.start = start;
          newRequest.chat.end = end;

          // put message as already softdeleted and harddeleted
          // by sender so as not to show on the senders page.
          newRequest.status.softDeleted.push(request.session.userId);
          newRequest.status.hardDeleted.push(request.session.userId);

          newRequest.save(callback(error, user));
        } else {
          return response.status(500).send("Exists");
        }
      });
    }
  ], function(error, result) {
    if (error) return response.status(500).send("Not Ok");
    else return response.status(200).send("OK");
  });
});

router.get('/accept/:id', function(request, response, next) {
  var patientId = request.params.id;

  // console.log("Id: " + patient + " Name: " + name);
  async.waterfall([
    function(callback) {
      User.findOne({
        _id: patientId,
        groups: 'Patient',
        "doctors.id": {$ne: request.session.userId}
      }, function(error, user) {
        if (user) {
          user.doctors.push({
            name: request.session.username,
            id: request.session.userId
          });
          user.save(callback(error, user));
        } else {
          return response.status(500).send("Exists");
        }
      });
    }, function(patient, callback2){
      User.findOne({
        _id: request.session.userId,
        groups: 'Doctor',
        "patients.id": {$ne: patientId}
      }, function(error, user){
        if (user) {
          user.patients.push({
            name: patient.name.full,
            id: patient.id
          });
          user.save(callback2(error, user));
        } else {
          return response.status(500).send("Exists");
        }
      });
    }
  ], function(error, result) {
    if (error) return response.status(500); // not sure of error
    return response.status(200).send("OK");
  });
});

module.exports = router;

var express = require('express'),
  router = express.Router(),
  User = require('../models/user'),
  Appointment = require('../models/appointment');

router.get('/', function(request, response, next) {
  response.render('doctors/list', {pageTitle: "Doctors"})
});

router.get('/:id', function(request, response, next) {
  var id = request.params.id;
  var msg = "): This is embarrassing. We couldn't find that Doctor. Please try again!";
  // make sure user is a MD
  User.findOne({_id: id}, function(error, user) {
    if (error) {
      request.flash('error', msg);
      return response.redirect('/doctors');
    }

    if (user) {
      // this user = doctor
      var pageTitle = "Dr. " + user.name.full + "'s Profile";

      var found = false;
      var appoint = Appointment.findOne({
        doctor: user.id,
        patient: request.session.userId,
        'chat.end': {$gt: Date.now()},
        'status.granted': false,
        'status.expired': false
        });
      if (appoint) found = true;
      return response.render('doctors/profile', {pageTitle: pageTitle, user: user, doc: id, found: found});
    }
    request.flash('error', msg);
    return response.redirect('/doctors');
  });
});

router.post('/request', function(request, response, next) {
  var start = request.body.start;
  var end = request.body.end;
  var message = request.body.msg;
  var doc = request.body.doc;

  var newRequest = Appointment();
  newRequest.doctor = doc;
  newRequest.patient = request.session.userId;
  newRequest.message = message;
  newRequest.chat.start = start;
  newRequest.chat.end = end;
  newRequest.save(function(error, appointment) {
    if (error) return response.status(500).senk("Not Ok");
    else return response.status(200).send("OK");
  });
  // newRequest.
  // return response.status(200).send("OK");
});

module.exports = router;

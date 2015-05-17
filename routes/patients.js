var express = require('express'),
  router = express.Router(),
  User = require('../models/user'),
  Appointment = require('../models/hospital'),
  async = require('async');

router.get('/', function(request, response, next) {
  // response.send("patients page")
  User.find({
    groups: 'Patient',
    'doctors.id': request.session.userId
  }, function(error, patients) {
    response.render('patients/list', {pageTitle: "Patients", patients: patients})
  });
});

router.get('/:id', function(request, response, next) {
  var id = request.params.id;

  User.findOne({
    _id: id,
    groups: 'Patient'
  }, function(error, patient) {
    var msg = "): This is embarrassing. We couldn't find that User. Please try again!";
    if (patient) {
      var pageTitle = patient.name.full + "'s Profile";

      return response.render('patients/profile', {pageTitle: pageTitle, user: patient});
    } else {
      request.flash('error', msg);
      return response.redirect('/patients');
    }
  });
});

module.exports = router;

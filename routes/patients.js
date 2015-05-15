var express = require('express'),
  router = express.Router(),
  User = require('../models/user'),
  Appointment = require('../models/hospital'),
  async = require('async');

router.get('/', function(request, response, next) {
  response.send("patients page")
});

router.get('/:id', function(request, response, next) {
  var id = request.params.id;

  response.send("Patient - ", id);
});

module.exports = router;

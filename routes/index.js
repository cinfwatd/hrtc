var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(request, response, next) {
  // var User = require('../models/user');
  // var newUser = User();
  //
  // newUser.username = 'root';
  // newUser.password = newUser.generateHash('pass');
  // newUser.name.first = 'Probity';
  // newUser.name.last = 'Cinfwat';
  // newUser.email = 'zach@mailinator.com';
  // newUser.groups.push('Patient');
  // newUser.doctors.push({name: 'Mann James', id: '55243ce5b0ef3dcf69c0a589', hospital: 'Vom Christian Hospital, Jos'});
  // // newUser.hospital = '55243bb31e6e004066ddca08'
  // newUser.doctors.push({name: 'Denise Mappr', id: '55243fc81f0b9aef71b0d2d8', hospital: 'Jos University Teaching Hospital, Jos'});
  // newUser.save(function (err, user) {
  //   if (err) return console.error(err.red);
  //   else return console.log('saved newUser'.green);
  // });

  // var Hospital = require('../models/hospital');
  // var hosp = Hospital();
  //
  // hosp.name = "Jos University Teaching Hospital, Jos";
  // hosp.address = "Lamingo, Jos-East, Plateau State, Nigeria.";
  // hosp.save(function(err, hosp) {
  //   if (err) return console.log('error creating hospital.'.red);
  //   else return console.log('created new hospital: '.green);
  // })
  response.send('welcome page...');
});

// router.get('/dashboard', function(request, response, next) {
//   response.send('dashboard');
// })

module.exports = router;

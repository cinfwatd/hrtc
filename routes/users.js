var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.get('/settings', function(request, response, next) {
//   response.send('Settings page..........');
// });

router.get('/profile', function(request, response, next) {
  response.send('Profile Page.......');
});

module.exports = router;

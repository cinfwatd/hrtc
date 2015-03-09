var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('welcome page...');
});

router.get('/dashboard', function(request, response, next) {
  res.send('dashboard');
})

module.exports = router;

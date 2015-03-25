var express = require('express'),
  router = express.Router();

router.get('/', function(request, response, next) {
  response.render('dashboard');
});

module.exports = router;

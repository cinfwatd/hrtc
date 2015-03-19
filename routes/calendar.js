var express = require('express'),
  router = express.Router();

router.get('/', function(request, response, next) {
  response.send('calendar');
});

router.post('/save', function(request, response, next) {

});

module.exports = router;

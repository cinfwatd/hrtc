var express = require('express'),
  router = express.Router();

//Video
router.get('/video', function(request, response, next) {
  response.send('video page..');
});
//Text
router.get('/text', function(request, response, next) {
  response.send('TExt Messaging');
});

module.exports = router;

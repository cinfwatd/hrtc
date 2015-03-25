var express = require('express'),
  router = express.Router();

//Video
router.get('/video', function(request, response, next) {
  response.render('video', {pageTitle: "Video Conference"});
});
//Text
router.get('/text', function(request, response, next) {
  response.render('text', {pageTitle: "Text Chat"});
});

module.exports = router;

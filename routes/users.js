var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/record', function(req, res, next) {
  res.render('record', {pageTitle: "Medical Record"});
});

router.get('/messages', function(request, response, next) {
  response.render('inbox', {pageTitle: "Inbox"});
});

router.get('/profile', function(request, response, next) {
  response.render('profile', {pageTitle: "User Profile"});
});

router.post('/profile-upload', function(request, response, next) {
  console.log(request.files);
  var url = '/uploads/' + request.files.avatar.name;
  response.send({name:"yessss", status: "OK", url: url});
});

module.exports = router;

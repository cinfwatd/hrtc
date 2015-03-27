var express = require('express'),
  router = express.Router(),
  User = require('../models/user');

router.get('/', function(request, response, next) {
  response.render('doctors/list', {pageTitle: "Doctors"})
});

router.get('/:id', function(request, response, next) {
  var id = request.params.id;
  var msg = "): This is embarrassing. We couldn't find that Doctor. Please try again!";
  // make sure user is a MD
  User.findOne({_id: id}, function(error, user) {
    if (error) {
      request.flash('error', msg);
      return response.redirect('/doctors');
    }

    if (user) {
      var pageTitle = "Dr. " + user.name.full + "'s Profile";
      return response.render('doctors/profile', {pageTitle: pageTitle, user: user});
    }
    request.flash('error', msg);
    return response.redirect('/doctors');
  });
});

module.exports = router;

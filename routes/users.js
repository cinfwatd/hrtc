var express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  path = require('path'),
  User = require('../models/user');

/* GET users listing. */
router.get('/record', function(req, res, next) {
  res.render('record', {pageTitle: "Medical Record"});
});

router.get('/profile', function(request, response, next) {
  var id = request.session.userId;
  var pageTitle = "User Profile";
  User.findOne({_id: id}, function(error, user) {
    if (error) {
      request.flash("error", "Seems like your session has expired. Please login again.");
      return response.render('profile', {pageTitle: pageTitle});
    }

    if (user) {
      // request.flash("user", user);
      return response.render('profile', {pageTitle: pageTitle, user: user});
    }

  });
});

router.post('/profile-upload', function(request, response, next) {
  var id = request.session.userId;
  // console.log(request.files.avatar);
  var url = path.join('/uploads', request.files.avatar[0].name);
  var deletePicture = function(url) {
    var url = path.join(__dirname, '..', 'public', url);
    // console.log(url);
    fs.unlink(url, function() {
      return console.log("Error: User issues. file deleted.".red);
    });
  }
  //find
  User.findOne({_id: id}, function(error, user) {
    if (error) {
      deletePicture(url);
      return response.send("Error uploading file.");
    }

    if (user) {
      var oldPictureUrl = user.picture;
      user.picture = url;
      user.save(function(error, user) {
        if (error){
          console.log(error);
          deletePicture(url);
          return response.send("Error uploading file. g");
        } else {
          request.session.userPicture = url;
          deletePicture(oldPictureUrl);
          return response.send({status: "OK", url: url});
        }
      })
    }
  });

});

router.post('/profile', function(request, response, next) {
  var id = request.session.userId;
  var name = request.body.name;
  var value = request.body.value;

  User.findOne({_id: id}, function(error, user) {
    if (error) {
      return response.status(500).send("Seams your session has expired. Please login again.");
    }

    if (user) {
      var isNameModified = false;
      switch(name) {
        case 'username':
          user.username = value;
          break;
        case 'firstname':
          user.name.first = value;
          isNameModified = true;
          break;
        case 'middlename':
          user.name.middle = value;
          isNameModified = true;
          break;
        case 'lastname':
          user.name.last = value;
          isNameModified = true;
          break;
        case 'dob':
          user.bioData.dob = value;
          break;
        case 'password':
          user.password = user.generateHash(value);
          break;
        case 'gender':
          user.bioData.gender = value;
          break;
        case 'email':
          user.email = value;
          break;
        case 'about':
          user.bioData.about = value;
          break;
      }

      user.save(function(error, user) {
        if (error) return response.status(500).send("): Please try again.")
        if (isNameModified) request.session.username = user.name.full;
        return response.status(200).send("OK");
      })
    }
  })
});

module.exports = router;

var express = require('express'),
  Hospital = require('../models/hospital'),
  User = require('../models/user'),
  async = require('async'),
  mongoose = require('mongoose'),
  rndm = require('rndm'),
  router = express.Router();

var postmark = require('postmark'),
  postmarkClient = new postmark.Client("d8734f2f-e5fa-4b9c-a5d8-6645ad8b6696");

router.get('/', function(request, response, next) {
  response.render('admin/admins', {pageTitle: 'Hospital Administrators'});
});

router.get('/hospitals', function(request, response, next) {
  response.render('admin/hospitals', {pageTitle: 'Hospitals'});
});

router.get('/hospital/fetch', function(request, response, next) {
  var limit = request.query.rows,
    page = request.query.page,
    sortIndex = request.query.sidx,
    isSearch = request.query._search;
    sortOrder = request.query.sord;

    // console.log(isSearch);
  async.waterfall([
    function(callback) {
      Hospital.count({}, function(error, count) {
        callback(error, count);
      });
    },
    function(count, callback2) {
      // console.log("Count".red);
      // console.log(count);
      if (count > 0 && limit > 0) {
        totalPages = Math.ceil(count/limit);
      } else {
        totalPages = 0;
      }

      // if for some reason the requested page is > total
      // set requested page to total page
      if (page > totalPages) page = totalPages;

      // calculate the starting position of the rows
      var start = limit * page - limit;

      // if for some reason start position is < 0, set it to 0
      // typical case is that the user typed 0 for the requested page
      if (start < 0) start = 0;
      // console.log(limit, start);

      var query = Hospital.find({active: true})
        .limit(limit)
        .skip(start);

        if (isSearch === 'true') {
          // console.log("YES".green)
          var filters = JSON.parse(request.query.filters),
            groupOp = filters.groupOp,
            rules = filters.rules;

            var optionsArray = [];

            for (var rule of rules) {
              var field = rule.field,
                operator = rule.op,
                data = rule.data,
                option = {};

                console.log(field, operator, data)

              switch(operator) {
                case 'bw':
                // begins with
                  option[field] = new RegExp('^' + data, "i");
                  break;
                case 'bn':
                // does not begin with
                  option[field] = new RegExp('^(?!' + data + ').*$', "i");
                  break;
                case 'ew':
                // ends with
                  option[field] = new RegExp(data + '$', "i");
                  break;
                case 'en':
                // does not ends with
                  option[field] = new RegExp('^(?!.*' + data + '$)', "i");
                  break;
                case 'cn':
                // contains
                  option[field] = new RegExp(data, "i");
                  break;
                case 'nc':
                // does not contsin
                  option[field] = new RegExp('^((?!' + data + ').)*$', "i");
                  break;
              }

              optionsArray.push(option);
            }
            console.log(optionsArray)

          // console.log(groupOp);
          if (groupOp === 'AND') {
            query.and(optionsArray);
          } else {
            // OR
            query.or(optionsArray);
          }
        }


        query
        .exec(function(error, hospitals) {
          var data = {
            "page": page,
            "total": totalPages,
            "records": count,
            "rows": hospitals
          }
          callback2(error, data)
        });
    }
  ], function(error, data) {
    if (error) return request.send(500);
    return response.json(data);
  });
});

router.post('/hospital/push', function(request, response, next) {
  var operation = request.body.oper,
    name = request.body.name,
    address = request.body.address,
    id = request.body.id;

  if (operation === 'del') {
    // this is destructive and can cause a myriad of problems
    // Doctors might be linked with this hospital.
    // Hospital.findByIdAndRemove(id, function(error) {
    //   if (error) return response.status(500).send("Error deleting record.");
    //   return response.status(200).send("HardDeleted.");
    // });
    Hospital.findByIdAndUpdate(id, {active: false},
    function(error, hosp) {
      if (error) return response.status(500).send("Error deleting record.");
      return response.status(200).send("SoftDeleted.");
    });

  } else if (operation === 'edit') {
    Hospital.findByIdAndUpdate(id,{
      name: name,
      address: address
    }, function(error, hosp) {
      if (error) return response.status(500).send("Error updating Hospital.");
      return response.status(200).send("Updated.");
    })

  } else if (operation === 'add') {
    var hosp = new Hospital();
    hosp.address = address;
    hosp.name = name;

    hosp.save(function(error) {
      if (error) return response.status(500).send("Error saving new Hospital.");
      return response.status(200).send("Added.");
    });
  }
});

// populate hospital select box
router.get('/hospital/select', function(request, response, next) {
  Hospital.find({}, function(error, hosps) {
    if (error) {
      return response.status(500).send("<select><option> -- empty --</option></select>");
    } else {
      var data = "<select>";
      for (var hosp of hosps) {
        data += "<option value='" + hosp.id + "'>" +hosp.name + "</option>";
      }
      data += "</select>";
      return response.status(200).send(data);
    }
  });
});

router.get('/patients', function(request, response, next) {
  response.send("heloo patients.");
});

router.get('/patients/fetch', function(request, response, next) {

});

router.get('/admins/fetch', function(request, response, next) {
  var limit = request.query.rows,
    page = request.query.page,
    sortIndex = request.query.sidx,
    isSearch = request.query._search;
    sortOrder = request.query.sord;

    // console.log(isSearch);
  async.waterfall([
    function(callback) {
      User.count({groups: 'Hospital'}, function(error, count) {
        callback(error, count);
      });
    },
    function(count, callback2) {
      // console.log("Count".red);
      // console.log(count);
      if (count > 0 && limit > 0) {
        totalPages = Math.ceil(count/limit);
      } else {
        totalPages = 0;
      }

      // if for some reason the requested page is > total
      // set requested page to total page
      if (page > totalPages) page = totalPages;

      // calculate the starting position of the rows
      var start = limit * page - limit;

      // if for some reason start position is < 0, set it to 0
      // typical case is that the user typed 0 for the requested page
      if (start < 0) start = 0;
      // console.log(limit, start);

      var query = User.find({groups: 'Hospital'})
        .limit(limit)
        .skip(start);

        if (isSearch === 'true') {
          // console.log("YES".green)
          var filters = JSON.parse(request.query.filters),
            groupOp = filters.groupOp,
            rules = filters.rules;

            var optionsArray = [];

            for (var rule of rules) {
              var field = rule.field,
                operator = rule.op,
                data = rule.data,
                option = {};

                // console.log(field, operator, data)

              switch(operator) {
                case 'bw':
                // begins with
                  option[field] = new RegExp('^' + data, "i");
                  break;
                case 'bn':
                // does not begin with
                  option[field] = new RegExp('^(?!' + data + ').*$', "i");
                  break;
                case 'ew':
                // ends with
                  option[field] = new RegExp(data + '$', "i");
                  break;
                case 'en':
                // does not ends with
                  option[field] = new RegExp('^(?!.*' + data + '$)', "i");
                  break;
                case 'cn':
                // contains
                  option[field] = new RegExp(data, "i");
                  break;
                case 'nc':
                // does not contsin
                  option[field] = new RegExp('^((?!' + data + ').)*$', "i");
                  break;
                case 'eq':
                  option[field] = data;
                  break;
                case 'ne':
                  option[field] = {$ne: data};
                  break;
                case 'gt':
                  option[field] = {$gt: data};
                  break;
                case 'ge':
                  option[field] = {$gte: data};
                  break;
                case 'lt':
                  option[field] = {$lt: data};
                  break;
                case 'le':
                  option[field] = {$lte: data};
              }

              optionsArray.push(option);
            }
            // console.log(optionsArray)

          // console.log(groupOp);
          if (groupOp === 'AND') {
            query.and(optionsArray);
          } else {
            // OR
            query.or(optionsArray);
          }
        }

        // just to make sure sort field is set
        if (sortIndex.length > 2) {
          var sortObj = {};
          sortObj[sortIndex] = sortOrder;
          console.log(sortObj);
          query.sort(sortObj);
        }

        query.populate('hospital');
        query
        .exec(function(error, users) {
          var data = {
            "page": page,
            "total": totalPages,
            "records": count,
            "rows": users
          }
          callback2(error, data)
        });
    }
  ], function(error, data) {
    if (error) return response.send(500);
    // console.log(data);

    return response.json(data);
  });
});

router.post('/admins/push', function(request, response, next) {
  var operation = request.body.oper,
    email = request.body.email,
    hospital = request.body['hospital.name'],
    status = request.body.active,
    id = request.body.id;

    // workaroound for cast exception when empty
    if (id == '_empty') id = 'asdfjklqwerty12345678900'; // dummy 24 byte hex string

    // console.log(email, hospital, id);
    if (operation == 'del') {
      // this is destructive and can cause a myriad of problems
      // User.findByIdAndRemove(id, function(error) {
      //   if (error) return response.status(500).send("Error deleting record.");
      //   return response.status(200).send("HardDeleted.");
      // });
      User.findByIdAndUpdate(id, {active: false},
      function(error, hosp) {
        if (error) return response.status(500).send("Error deleting record.");
        return response.status(200).send("SoftDeleted.");
      });

    } else if (operation == 'add' || operation == 'edit') {
      // check if an entry already exist.

      async.waterfall([
        function(callback) {
          User.count({_id: {$ne: id}, hospital: hospital, groups: 'Hospital'},
          function(error, count) {
            callback(error, count);
          });
        },
        function(count, callback2) {
          if (count >= 1) {
            // it exists
            return response.status(500).send("Hospital Administrator exits for this hospital.");
          }
          // console.log("here", count)
          var user = new User(),
            passwordGenerator = rndm.create("password"),
            usernameGenerator = rndm.create("username"),
            rawPassword = passwordGenerator(4),
            password = user.generateHash(rawPassword),
            username = usernameGenerator(5);

          if (operation == 'add') {
            user.email = email;
            user.hospital = hospital;
            user.username = username;
            user.password = password;
            user.groups.push('Hospital');
            user.active = status;

            user.save(function(error) {
              if (error) return response.status(500).send("Error adding new Hospital Administrator.");
            })
          }

          else if (operation == 'edit') {
            User.findByIdAndUpdate(id, {
              email: email,
              hospital: hospital,
              username: username,
              password: password,
              active: status,
              dateUpdated: Date.now()

            }, function(error, user) {
              if (error) return response.status(500).send("Error editing Hospital Administrator.");
            })
          }

          // callback
          callback2(null, username, rawPassword);

        }],
        function(error, username, password){
          if (error) return response.status(500).send("Please try again. Server error.");

          console.log(username, password);
          var mailOptions = {
            'From': 'Telemonitoring <info@bitrient.com>',
            'To': email,
            'Subject': 'Account Details',
            'TextBody': 'Your account has been successfully created with the following details: \n\n'
            + 'Username: ' + username + '\n'
            + 'Password: ' + password + '\n\n'
            + 'Please change yout login details from your profile page. Thanks.'
          };

          console.log(mailOptions)

          client.sendEmail(mailOptions,
          function(error, success) {
            if (error) {
              return response.status(500).send("Unable to send via postmark: " + error.message);
            }
            return response.status(200).send("Send to postmark for delivery.");
          });
        }
      )
    }
});

router.get('/doctors', function(request, response, next) {

  response.send("Hospital Doctors ");
});

module.exports = router;

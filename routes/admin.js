var express = require('express'),
  Hospital = require('../models/hospital'),
  async = require('async'),
  router = express.Router();

router.get('/', function(request, response, next) {
  response.render('dashboard', {pageTitle: 'Dashboard'});
});

router.get('/hospital', function(request, response, next) {
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

router.post('/hospital', function(request, response, next) {
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

router.get('ss/:hospital', function(request, response, next) {
  var hospital = request.params.hospital;
  response.send(hospital);
});
module.exports = router;

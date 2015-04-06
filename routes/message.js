var express = require('express'),
  router = express.Router(),
  path = require('path'),
  User = require('../models/user'),
  async = require('async'),
  Appointment = require('../models/appointment');

router.get('/', function(request, response, next) {
  return response.redirect('/message/inbox');
});

router.get('/inbox', function(request, response, next) {
  var currentPage = request.query.page;
  Appointment.paginate({
    receiver: request.session.userId,
    'status.softDeleted': {$ne: request.session.userId},
  }, currentPage, request.query.limit,
    function(error, pageCount, appointments, itemCount) {
      // if (error) return next(error);
      if (error) {
         return console.log('ERRRRRRRRRR'.red);
      } else {
        // console.log('Pages: ', pageCount);
        // console.log(appointments);
        return response.render('message/inbox',
        {
          pageTitle: "Inbox",
          messages: appointments,
          pageCount: pageCount,
          itemCount: itemCount,
          currentPage: currentPage,
        });
      }
    }, {columns: {}, populate: 'sender', sortBy: {title: -1}});
});

router.get('/sent', function(request, response, next) {
  var currentPage = request.query.page;
  Appointment.paginate({
    sender: request.session.userId,
    'status.softDeleted': {$ne: request.session.userId}
  }, currentPage, request.query.limit,
    function(error, pageCount, appointments, itemCount) {
      // if (error) return next(error);
      if (error) {
         return console.log('ERRRRRRRRRR'.red);
      } else {
        // console.log('Pages: ', pageCount);
        console.log(appointments);
        return response.render('message/inbox',
        {
          pageTitle: "Sent",
          messages: appointments,
          pageCount: pageCount,
          itemCount: itemCount,
          currentPage: currentPage
        });
      }
    }, {columns: {}, populate: 'receiver', sortBy: {title: -1}});
});

router.get('/trash', function(request, response, next) {
  var currentPage = request.query.page;
  Appointment.paginate({
    'status.softDeleted': request.session.userId,
    'status.hardDeleted': {$ne: request.session.userId},
    $or: [{sender: request.session.userId}, {receiver: request.session.userId}]
  }, currentPage, request.query.limit,
    function(error, pageCount, appointments, itemCount) {
      // if (error) return next(error);
      if (error) {
         return console.log('ERRRRRRRRRR'.red);
      } else {
        // console.log('Pages: ', pageCount);
        console.log(appointments);
        return response.render('message/inbox',
        {
          pageTitle: "Trash",
          messages: appointments,
          pageCount: pageCount,
          itemCount: itemCount,
          currentPage: currentPage
        });
      }
    }, {columns: {}, populate: ['receiver', 'sender'], sortBy: {title: -1}});
});

router.post('/softdelete', function(request, response, next) {
  var messages = request.body.messages.split(','),
  conditions = {_id: {$in: messages}},
  update = {$push: {'status.softDeleted': request.session.userId}},
  option = {multi: true};

  async.waterfall([
    function(callback) {
      Appointment.update(conditions, update, option, function(error, numbAffected) {
        callback(error, numbAffected);
      });
    }
  ],
  function(error, result) {
    console.log(error);
    console.log(result);
    if (error) return response.sendStatus(500).send('Failed');
    else return response.sendStatus(200).send(result);
  });

});

router.post('/harddelete', function(request, response, next) {

});

router.post('/getmessage', function(request, response, next) {
  var id = request.body.id;
  async.waterfall([
    function(callback) {
      Appointment.findOne({
        _id: id
      }, function(error, appoint) {
        callback(error, appoint);
        // response.app.render('message/partials/messagebody', {message: appoint})
      });
    },
    function(appoint, callback2) {
      if (appoint.status.read) {
        callback2(null, appoint);
      } else {
        appoint.status.read = true;
        appoint.save(function(error, appoint) {
          callback2(error, appoint);
        });
      }
    },
    function(appoint, callback3) {
      response.app.render('message/partials/messagebody', {message: appoint},
      function(error, html) {
        callback3(error, html);
      });
    }
  ], function(error, result) {
    return response.send(result);
  });
});

module.exports = router;

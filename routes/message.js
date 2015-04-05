var express = require('express'),
  router = express.Router(),
  path = require('path'),
  User = require('../models/user'),
  Appointment = require('../models/appointment');
  // paginate = require('mongoose-paginate');

// Appointment.plugin(paginate);

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

module.exports = router;

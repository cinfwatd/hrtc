var express = require('express'),
  router = express.Router(),
  path = require('path'),
  User = require('../models/user'),
  async = require('async'),
  path = require('path'),
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
        // console.log(appointments);
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
        // console.log(appointments);
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

router.post('/delete', function(request, response, next) {
  var messages = request.body.messages.split(','),
  soft = request.body.soft,
  conditions = {_id: {$in: messages}},
  option = {multi: true};


  if (parseInt(soft)){
    update = {$push: {'status.softDeleted': request.session.userId}};
  } else {
    update = {$push: {'status.hardDeleted': request.session.userId}};
  }

  async.waterfall([
    function(callback) {
      Appointment.update(conditions, update, option, function(error, numbAffected) {
        callback(error, numbAffected);
      });
    }
  ],
  function(error, result) {
    // console.log(error);
    // console.log(result);
    if (error) return response.sendStatus(500).send('Failed');
    else return response.sendStatus(200).send(result);
  });

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
      if (appoint.status.read || (appoint.sender == request.session.userId)) {
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
    // console.log(result);
    return response.send(result);
  });
});

router.post('/compose', function(request, response, next) {
  var id = request.session.userId;
  var recipient = request.body.recipient;
  var subject = request.body.subject;
  var message = request.body.message;

  // console.log("recipient: ", recipient);
  // console.log("subject: ", subject);
  // console.log("message: ", message);

  var attachments = request.files.attachment;

  var msg = Appointment();
  msg.sender = id;
  msg.receiver = recipient;
  msg.message = message;
  msg.subject = subject;

  if (attachments) {
    var urls = [];
    for (var i = 0; i < attachments.length; i++) {
      urls.push(path.join('/uploads', attachments[i].name));
    }
    msg.attachment.attached = true;
    msg.attachment.content = urls;
  }

  msg.save(function(error, message) {
    if (error) return response.sendStatus(500);
    else {
      message.populate('receiver', 'name _id').populate('sender', 'name _id')
      .populate(function(error, message) {
        return response.status(200).send(message);
      });
    }
  });
});

router.get('/uploads/:file', function(request, response, next) {
  var f = request.params.file;
  var file = path.join(__dirname, '..', 'public', 'uploads', f);

  // return console.log(file);
  // var filename = path.basename(file);
  // var mimetype = mime.lookup(file);
  //
  // response.setHeader('Content-disposition', 'attachment; filename=' + filename);
  // response.setHeader('Content-type', mimetype);
  //
  // var filestream = fs.createReadStream(file);
  // filestream.pipe(response);
  // console.log(file);
  return response.download(file);
});

module.exports = router;

var express = require('express'),
  router = express.Router(),
  Events = require('../models/events');


router.get('/', function(request, response, next) {
  response.render('calendar');
});

router.post('/save/:id', function(request, response, next) {
  // response.send('save');
  var id = request.params.id,
    title = request.body.title,
    description = request.body.description,
    start = request.body.start,
    end = request.body.end,
    className = request.body.className,
    allDay = request.body.allDay;

  var update = request.body.update; // used to tell dat its a positional update

    if (id != 'undefined') {
      // event = Events
      // find the events
      // console.log(typeof id);
      // console.log('check me out'.red);
      Events.findOne({_id: id}, function(error, evt) {
        if (error) {
          return console.log(error.red);
        }

        if (evt){
          events = evt;
        }
      });
    } else {
      events = new Events();
      // get user id and add to events
      events.user = request.session.userId;
    }

    if (!update) {
      events.title = title;
      events.description = description;
      events.className = className;
    }
    events.start = start;
    events.end = end;
    events.allDay = allDay;

    events.save(function(error, events) {
      if (error) return console.error(error.red);
      else{
        // console.log('saved new Events'.green);
        response.send(events.id);
      }
    });
});

router.get('/fetch', function(request, response, next) {
  response.send('fetch');
});

router.post('/delete/:id', function(request, response, next) {
  var id = request.params.id;
  // Events.remove({id: id}, function(error) {
  //   if (error) {
  //     return console.log('Error trying to remove events'.red);
  //   }
  //   response.send("done");
  // });
  Events.findOne({_id: id}, function(error, evt) {
    if (error) {
      console.log('error finding events.'.red)
    }

    if (evt) {
      evt.remove(function(error) {
        if (error) {
          console.log('error deleting event.'.red);
        }
        response.send("done");
      });
    }
  });
});

module.exports = router;

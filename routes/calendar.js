var express = require('express'),
  router = express.Router(),
  Event = require('../models/event');


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
      // event = Event
      // find the event
      // console.log(typeof id);
      // console.log('check me out'.red);
      Event.findOne({id: id}, function(error, evt) {
        if (error) {
          return console.log(error.red);
        }

        if (evt){
          event = evt;
        }
      });
    } else {
      event = new Event();
      // get user id and add to event
      event.user = request.session.userId;
    }

    if (!update) {
      event.title = title;
      event.description = description;
      event.className = className;
    }
    event.start = start;
    event.end = end;
    event.allDay = allDay;

    event.save(function(error, event) {
      if (error) return console.error(error.red);
      else{
        // console.log('saved new Event'.green);
        response.send(event.id);
      }
    });
});

router.get('/fetch', function(request, response, next) {
  response.send('fetch');
});

router.post('/delete/:id', function(request, response, next) {
  var id = request.params.id;
  // Event.remove({id: id}, function(error) {
  //   if (error) {
  //     return console.log('Error trying to remove event'.red);
  //   }
  //   response.send("done");
  // });
  Event.findOne({id: id}, function(error, evt) {
    if (error) {
      console.log('error finding event.'.red)
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

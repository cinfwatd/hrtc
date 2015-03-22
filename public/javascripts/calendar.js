/* initialize the external events
-----------------------------------------------------------------*/
$('.colorpicker').ace_colorpicker({'auto_pos': false});

$('#external-events div.external-event').each(function() {

  // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
  // it doesn't need to have a start or end
  var eventObject = {
    title: $.trim($(this).text()), // use the element's text as the event title
    description: "Description: " + $.trim($(this).text())
  };

  // store the Event Object in the DOM element so we can get to it later
  $(this).data('eventObject', eventObject);

  // make the event draggable using jQuery UI
  $(this).draggable({
    zIndex: 999,
    revert: true,      // will cause the event to go back to its
    revertDuration: 300  //  original position after the drag
  });

});




/* initialize the calendar
-----------------------------------------------------------------*/

var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();


var calendar = $('#calendar').fullCalendar({
  //isRTL: true,
   buttonHtml: {
    prev: '<i class="ace-icon fa fa-chevron-left"></i>',
    next: '<i class="ace-icon fa fa-chevron-right"></i>'
  },
  header: {
    left: 'prev,next today',
    center: 'title',
    right: 'month,agendaWeek,agendaDay'
  },
  weekNumbers: true,
  businessHours: {
     start: '10:00', // a start time (10am in this example)
     end: '18:00', // an end time (6pm in this example)

     dow: [ 1, 2, 3, 4, 5]
   // days of week. an array of zero-based day of week integers (0=Sunday)
   // (Monday-Thursday in this example)
  },
  //           events: [
  //   {
  // 	title: 'All Day Event',
  // 	start: new Date(y, m, 1),
  // 	className: 'label-important'
  //   },
  //   {
  // 	title: 'Long Event',
  // 	start: moment().subtract(5, 'days').format('YYYY-MM-DD'),
  // 	end: moment().subtract(1, 'days').format('YYYY-MM-DD'),
  // 	className: 'label-success'
  //   },
  //   {
  // 	title: 'Some Event',
  // 	start: new Date(y, m, d-3, 15, 20),
  // 	allDay: false,
  // 	className: 'label-info'
  //   }
  // ]
  events: {
    url :'calendar/fetch',
    // durationEditable: false,
    // startEditable: false
  }	//url
  ,
  editable: true,
  droppable: true, // this allows things to be dropped onto the calendar !!!
  drop: function(date, allDay) { // this function is called when something is dropped

    // retrieve the dropped element's stored Event Object
    var originalEventObject = $(this).data('eventObject');
    var $extraEventClass = $(this).attr('data-class');


    // we need to copy it, so that multiple events don't have a reference to the same object
    var copiedEventObject = $.extend({}, originalEventObject);

    // assign it the date that was reported
    copiedEventObject.start = date;
    copiedEventObject.allDay = allDay;
    if($extraEventClass) {
      // console.log($extraEventClass);
      copiedEventObject['className'] = [$extraEventClass];}
      // console.log(copiedEventObject);

    // render the event on the calendar
    // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
    $('#calendar').fullCalendar('renderEvent', copiedEventObject, false);

  },
  eventResize: function(event, delta, revertFunc) {

    if (typeof event.id !== 'undefined') {

  //         bootbox.confirm("Extend '" + event.title + "' end date/time to " + event.end.format() +"?", function(result) {
     // if(result) {
       var start = event.start.format();
       var end = 0;

       try {
         end = event.end.format();
       } catch (err) {
         end = start;
       }

       $.ajax({
           type: "POST",
           url: "/calendar/save/" + event.id,
           data: "start="+start+"&end="+end+"&allDay="+event.allDay+"&_csrf="+TOKEN+"&update=true",
           success: function(id) {
             calendar.fullCalendar('updateEvent', event);
           },
           error: function(data) {
             revertFunc();
           }
       });
   // 	} else {
   // 		revertFunc();
   // 	}
   // });
      }

    },
  eventDrop: function(event, delta, revertFunc) {

    if (typeof event.id === 'undefined'){ } else {

      // bootbox.confirm("Move '"+ event.title +"' start date to "+ event.start.format() , function(result) {
      // 	if (result) {
          var start = event.start.format();
          var end = 0;

          try {
            end = event.end.format();
          } catch (err) {
            end = start;
          }

          $.ajax({
              type: "POST",
              url: "/calendar/save/" + event.id,
              data: "start="+start+"&end="+end+"&allDay="+event.allDay+"&_csrf="+TOKEN+"&update=true",
              success: function(id) {
                calendar.fullCalendar('updateEvent', event);
              },
              error: function(data) {
                revertFunc();
              }
          });
      // 	} else {
      // 		revertFunc();
      // 	}
      // });
    }

    },
  selectable: true,
  selectHelper: true,
  select: function(start, end, allDay) {
    bootbox.prompt("New Event Title:", function(title) {
      if (title !== null) {
        calendar.fullCalendar('renderEvent',
          {
            title: title,
            description: 'Description: ' + title,
            start: start,
            end: end,
            // allDay: allDay,
            className: 'label-info'
          },
          true //make the event "stick"
        );
      }
    });
  },
  eventRender: function(event, element) {
    element.tooltip({
      title: event.description,
      placement: "top"
    });
  },
  allDaydefault: true,
  eventClick: function(calEvent, jsEvent, view) {

    //display a modal
    var modal =
    '<div class="modal fade">\
      <div class="modal-dialog">\
       <div class="modal-content">\
       <div class="modal-body">\
         <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
         <form class="no-margin form-horizontal" role="form">\
         <div class="form-group">\
             <label class="col-sm-3 control-label no-padding-right" for="form-field-1">Event Title</label>\
             <div class="col-sm-9">\
               <input type="text" id="form-field-1" placeholder="Even Title" class="col-xs-10 col-sm-5" value="' + calEvent.title + '" />\
             </div>\
           </div>\
           <div class="form-group">\
             <label class="col-sm-3 control-label no-padding-right" for="form-field-2">Description</label>\
             <div class="col-sm-9">\
               <textarea id="form-field-2" maxlength="50" placeholder="Event Name" class="col-xs-10 col-sm-10">' + calEvent.description + '</textarea>\
             </div>\
           </div>\
           <div class="form-group">\
             <label class="col-sm-3 control-label no-padding-right" for="form-field-2">Color</label>\
             <div class="col-sm-9">\
             <div data-toggle="buttons" class="btn-group">\
               <label class="btn btn-primary">\
                 <input type="radio" value="label-primary" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-info">\
                 <input type="radio" value="label-info" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-success">\
                 <input type="radio" value="label-success" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-warning">\
                 <input type="radio" value="label-warning" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-danger">\
                 <input type="radio" value="label-danger" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-inverse">\
                 <input type="radio" value="label-inverse" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-pink">\
                 <input type="radio" value="label-pink" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-purple">\
                 <input type="radio" value="label-purple" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-yellow">\
                 <input type="radio" value="label-yellow" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
               <label class="btn btn-grey">\
                 <input type="radio" value="label-grey" />\
                 <i class="icon-only ace-icon fa-fire"></i>\
               </label>\
            </div>\
             </div>\
           </div>\
          </form>\
       </div>\
       <div class="modal-footer">\
        <button type="button" class="btn btn-sm btn-success" data-action="submit"><i class="ace-icon fa fa-check"></i> Save</button>\
        <button type="button" class="btn btn-sm btn-danger" data-action="delete"><i class="ace-icon fa fa-trash-o"></i> Delete Event</button>\
        <button type="button" class="btn btn-sm" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
       </div>\
      </div>\
     </div>\
    </div>';

    //get event color and autoselect the color.
    var modal = $(modal).appendTo('body');
    var cname = calEvent.className.toString().replace("label", "btn");;
    var string = '.btn-group .' + cname;
    $(string).addClass('active');

    modal.find('form').on('submit', function(ev){
      ev.preventDefault();

      var title = $(this).find("input[type=text]").val();
      var desc = $(this).find("textarea").val();
      var className = $(this).find(".btn-group .active input").val();
      // console.log(className);
      var start = calEvent.start.format();
      var end = 0;

      try {
        end = calEvent.end.format();
      } catch (err) {
        end = start;
      }


      modal.modal("hide");

      $.ajax({
          type: "POST",
          url: "/calendar/save/" + calEvent.id,
          data: "title="+title+"&description="+desc+"&start="+start+"&end="+end+"&className="+className+"&allDay="+calEvent.allDay+"&_csrf="+TOKEN,
          success: function(id) {
            calEvent.id = id;
            calEvent.title = title;
            calEvent.description = desc;
            calEvent.className = className;
            calendar.fullCalendar('updateEvent', calEvent);
          }
      });
    });
    modal.find('button[data-action=submit]').on('click', function() {
      modal.find('form').submit();
    });
    modal.find('button[data-action=delete]').on('click', function() {

      modal.modal("hide");

      if (typeof calEvent.id === 'undefined') {
        calendar.fullCalendar('removeEvents' , function(ev){
          return (ev._id == calEvent._id);
        });
      } else {
        bootbox.confirm("Are you sure to Delete '" + calEvent.title + "' ?", function(result) {
          if (result) {

            $.ajax({
                type: "POST",
                url: "/calendar/delete/" + calEvent.id,
                data: "_csrf=" + TOKEN,
                success: function(id) {
                  calendar.fullCalendar('removeEvents' , function(ev){
                    return (ev._id == calEvent._id);
                  });
                }
            });

          }
        });

      }
    });

    modal.modal('show').on('hidden', function(){
      modal.remove();
    });


    console.log(calEvent);
    //console.log(jsEvent);
    //console.log(view);

    // change the border color just for fun
    // $(this).css('border-color', 'red');

  }

});

$('.btn-group .btn input').click(function() {
  console.log($(this).val());
});

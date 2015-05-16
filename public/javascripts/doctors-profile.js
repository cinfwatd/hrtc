jQuery(function($) {
  //display a modal
  $('button#request').on('click', function() {

    var modal =
    '<div class="modal fade">\
      <div class="modal-dialog">\
       <div class="modal-content">\
       <div class="modal-body">\
         <button type="button" class="close" data-dismiss="modal" style="margin-top:-10px;">&times;</button>\
         <form class="no-margin form-horizontal" role="form">\
           <div class="form-group">\
             <label class="col-sm-3 control-label no-padding-right" for="form-field-2">Period</label>\
             <div class="col-sm-9" id="rangeblock">\
               <div class="input-daterange input-group">\
                 <input type="text" class="input-sm form-control" name="start" />\
                 <span class="input-group-addon">\
                   <i class="fa fa-exchange"></i>\
                 </span>\
                 \
                 <input type="text" class="input-sm form-control" name="end" />\
               </div>\
               <span class="help-block red" ></span>\
             </div>\
           </div>\
           <div class="form-group">\
             <label class="col-sm-3 control-label no-padding-right" for="form-field-2">Message</label>\
             <div class="col-sm-9">\
               <textarea id="form-field-2" maxlength="140" name="message" placeholder=" Message" class="col-xs-10 col-sm-10">' + '</textarea>\
             </div>\
           </div>\
          </form>\
       </div>\
       <div class="modal-footer">\
        <button type="button" class="btn btn-sm btn-success" data-action="submit"><i class="ace-icon fa fa-check"></i> Save</button>\
        <button type="button" class="btn btn-sm" data-dismiss="modal"><i class="ace-icon fa fa-times"></i> Cancel</button>\
       </div>\
      </div>\
     </div>\
    </div>';

    var modal = $(modal).appendTo('body');
    $('.input-daterange').datepicker({autoclose:true});

    modal.find('form').on('submit', function(ev) {
      ev.preventDefault();

      var start = $(this).find('input[name=start]').val();
      var end = $(this).find('input[name=end]').val();
      var msg = $(this).find('textarea[name=message]').val();

      if (start.length < 10 || end.length < 10 || msg.length < 2)
        $('.help-block').text("Please, all fields are require...");
      else{
        console.log('start=' + start + "&end=" + end + "&msg=" + msg);
        $.ajax({
          type: "POST",
          url: "/doctors/request",
          data: 'start=' + start + "&end=" + end + "&msg=" + msg + "&_csrf=" + TOKEN + "&doc=" + DOC,
          success: function(data) {
            modal.modal("hide");
            last_gritter = $.gritter.add({
              title: 'Success!',
              text: 'A request has been sent.',
              class_name: 'gritter-success gritter-right'
            });

            var ht = '<span class="label label-lg label-grey arrowed-right">Request status</span>\
              <span class="label label-lg label-right arrowed-in arrowed-right">Pending</span>';
            $('div#message').empty().append(ht);
          },
          error: function(data) {
            last_gritter = $.gritter.add({
              title: ')-: Well, this is embarrassing!',
              text: 'Please try again. If it persist let us know.',
              class_name: 'gritter-error gritter-right'
            });
          }
        })
      }
    });

    modal.find('button[data-action=submit]').on('click', function() {
      modal.find('form').submit();
    });
    modal.modal('show').on('hidden', function() {
      modal.remove();
    });
  });
});

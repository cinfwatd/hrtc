jQuery(function($){

  $('ul.nav li a#message').parent().addClass('active');

  $('.inbox-menu a').each(function(){
    if($($(this))[0].href==String(window.location))
      $(this).addClass('active');
  });

  $('.chosen-select').chosen({allow_single_deselect:true,
  max_selected_options: 1, width: '150%'});

  //basic initializations
  $('.message-list .message-item input[type=checkbox]').removeAttr('checked');
  $('.message-list').on('click', '.message-item input[type=checkbox]' , function() {
    $(this).closest('.message-item').toggleClass('selected');
    if(this.checked) Inbox.display_bar(1);//display action toolbar when a message is selected
    else {
      Inbox.display_bar($('.message-list input[type=checkbox]:checked').length);
      //determine number of selected messages and display/hide action toolbar accordingly
    }
  });

  //check/uncheck all messages
  $('#id-toggle-all').removeAttr('checked').on('click', function(){
    if(this.checked) {
      Inbox.select_all();
    } else Inbox.select_none();
  });

  //select all
  $('#id-select-message-all').on('click', function(e) {
    e.preventDefault();
    Inbox.select_all();
  });

  //select none
  $('#id-select-message-none').on('click', function(e) {
    e.preventDefault();
    Inbox.select_none();
  });

  //select read
  $('#id-select-message-read').on('click', function(e) {
    e.preventDefault();
    Inbox.select_read();
  });

  //select unread
  $('#id-select-message-unread').on('click', function(e) {
    e.preventDefault();
    Inbox.select_unread();
  });

  $('#discard').on('click', function(e) {

    bootbox.confirm("Are you sure to discard the message?", function(result) {
      if (result) {
        Inbox.hide_form();
      }
    });

  });

  $('button#send').on('click', function() {
    $('input#message').val($('.message-form .wysiwyg-editor').html());

    $('#id-message-form').ajaxSubmit({
      beforeSubmit: validate,
      success: successFunc,
      url: '/message/compose',
      type: 'post',
      dataType: 'json'
    });


    // var message = $('input#message').val();
    // var subject = $('#form-field-subject').val();
    // var recipient = $('#form-field-recipient').val();
    // var attachment = $('input[type=file]').val();
    //
    // console.log("message: " + message);
    // console.log("subject: " + subject);
    // console.log("recipient: " + recipient);
    // console.log("attachment: " + attachment);
  });

  $('#delete').on('click', function() {
    bootbox.confirm("Are you sure to move message to trash?", function(result) {
      if (result) {
        var keys = [];
        // console.log(location.pathname);

        $('.selected').each(function(){
          var value = $(this).find('input[type=checkbox]').val();
          keys.push(value);
        });

        var path = '/message/delete';
        var soft = 1;
        if (location.pathname == '/message/trash') {
          soft = 0;
        }

        var numbMsg = parseInt($('#numberOfMessages').text());
        var msgToDel = keys.length;
        var newNumbMsg = numbMsg - msgToDel;
// console.log(typeof(keys));
        $.ajax({
          type: 'POST',
          url: path,
          data: 'messages=' + keys+'&_csrf=' + TOKEN + '&soft=' + soft,
          success: function(data) {

            if (newNumbMsg == 0) {
              var data = '<div>&nbsp;</div>\
              <span>&nbsp;&nbsp;There are no messages to display.</span>\
              <div>&nbsp;</div>';
              $('#message-list').html(data);
            } else {
              $('.selected').remove();
            }

            $('#numberOfMessages').text(newNumbMsg);

            // remove the delete header
            Inbox.display_bar(0);

            // announce it
            last_gritter = $.gritter.add({
              title: 'Success!',
              text: msgToDel + ((msgToDel == 1) ? ' message' : ' messages') + ' has been moved to trash.',
              class_name: 'gritter-success gritter-right'
            });
          },
          error: function(data) {
            last_gritter = $.gritter.add({
              title: ')-: This is embarrassing!',
              text: 'Please try again! If it persist contact us.',
              class_name: 'gritter-error gritter-right'
            });
          }
        });
        // alert(keys);
      }
    });
  });

  //display second message right inside the message list
  $('.message-list .message-item .text').on('click', function(){
    var message = $(this).closest('.message-item');
    var id = message.find('input[type=checkbox]').val();

    //if message is open, then close it
    if(message.hasClass('message-inline-open')) {
      message.removeClass('message-inline-open').find('.message-content').addClass('hide');
      return;
    }

    $('.message-container').append('<div class="message-loading-overlay"><i class="fa-spin ace-icon fa fa-spinner orange2 bigger-160"></i></div>');

    $.ajax({
      type: 'POST',
      url: '/message/getmessage',
      data: 'id=' + id + '&_csrf=' + TOKEN,
      success: function(data) {
        $('.message-container').find('.message-loading-overlay').remove();
        message
          .addClass('message-inline-open')
          .append('<div class="message-content" />');
        var content = message.find('.message-content:last').html(data);

        message.removeClass('message-unread');
        //remove scrollbar elements
        content.find('.scroll-track').remove();
        content.find('.scroll-content').children().unwrap();

        content.find('.message-body').ace_scroll({
          size: 150,
          mouseWheelLock: true,
          styleClass: 'scroll-visible'
        });
      },
      error: function(data) {
        $('.message-container').find('.message-loading-overlay').remove();
        last_gritter = $.gritter.add({
          title: ')-: This is embarrassing!',
          text: 'Please try again! If it persist contact us.',
          class_name: 'gritter-error gritter-right'
        });
      }
    })

  });

  //hide message list and display new message form
  //- /**
  $('.btn-new-mail').on('click', function(e){
    e.preventDefault();
    Inbox.show_form();
  });
  //- */

  var Inbox = {
    //displays a toolbar according to the number of selected messages
    display_bar : function (count) {
      if(count == 0) {
        $('#id-toggle-all').removeAttr('checked');
        $('#id-message-list-navbar .message-toolbar').addClass('hide');
        $('#id-message-list-navbar .message-infobar').removeClass('hide');
      }
      else {
        $('#id-message-list-navbar .message-infobar').addClass('hide');
        $('#id-message-list-navbar .message-toolbar').removeClass('hide');
      }
    }
    ,
    select_all : function() {
      var count = 0;
      $('.message-item input[type=checkbox]').each(function(){
        this.checked = true;
        $(this).closest('.message-item').addClass('selected');
        count++;
      });

      $('#id-toggle-all').get(0).checked = true;

      Inbox.display_bar(count);
    }
    ,
    select_none : function() {
      $('.message-item input[type=checkbox]').removeAttr('checked').closest('.message-item').removeClass('selected');
      $('#id-toggle-all').get(0).checked = false;

      Inbox.display_bar(0);
    }
    ,
    select_read : function() {
      $('.message-unread input[type=checkbox]').removeAttr('checked').closest('.message-item').removeClass('selected');

      var count = 0;
      $('.message-item:not(.message-unread) input[type=checkbox]').each(function(){
        this.checked = true;
        $(this).closest('.message-item').addClass('selected');
        count++;
      });
      Inbox.display_bar(count);
    }
    ,
    select_unread : function() {
      $('.message-item:not(.message-unread) input[type=checkbox]').removeAttr('checked').closest('.message-item').removeClass('selected');

      var count = 0;
      $('.message-unread input[type=checkbox]').each(function(){
        this.checked = true;
        $(this).closest('.message-item').addClass('selected');
        count++;
      });

      Inbox.display_bar(count);
    }
  }

  //show message list (back from writing mail or reading a message)
  Inbox.show_list = function() {
    $('.message-navbar').addClass('hide');
    $('#id-message-list-navbar').removeClass('hide');

    $('.message-footer').addClass('hide');
    $('.message-footer:not(.message-footer-style2)').removeClass('hide');

    $('.message-list').removeClass('hide').next().addClass('hide');
    //hide the message item / new message window and go back to list
    $('a#sent, a#trash').removeClass('active');
    $('a#inbox').addClass('active');
  }

  //show write mail form
  Inbox.show_form = function() {
    if($('.message-form').is(':visible')) return;
    if(!form_initialized) {
      initialize_form();
    }


    var message = $('.message-list');
    $('.message-container').append('<div class="message-loading-overlay"><i class="fa-spin ace-icon fa fa-spinner orange2 bigger-160"></i></div>');

    setTimeout(function() {
      message.next().addClass('hide');

      $('.message-container').find('.message-loading-overlay').remove();

      $('.message-list').addClass('hide');
      $('.message-footer').addClass('hide');
      $('.message-form').removeClass('hide').insertAfter('.message-list');

      $('.message-navbar').addClass('hide');
      $('#id-message-new-navbar').removeClass('hide');

      $('.chosen-select').each(function() {
         var $this = $(this);
         $this.next().css({'width': $this.parent().width()});
      });

      //reset form??
      $('.message-form .wysiwyg-editor').empty();

      $('.message-form .ace-file-input').closest('.file-input-container:not(:first-child)').remove();
      $('.message-form input[type=file]').ace_file_input('reset_input');

      $('.message-form').get(0).reset();

    }, 0);

    // $('a#inbox, a#sent, a#trash').removeClass('active');
  }

  Inbox.hide_form = function() {
    $('.message-list').next().removeClass('hide');
    $('.message-list').removeClass('hide');
    $('.message-footer').removeClass('hide');
    $('.message-form').addClass('hide');

    $('.message-navbar').removeClass('hide');
    $('#id-message-new-navbar').addClass('hide');
  }

  Inbox.show_sent = function() {
    $('#inbox-tabs a[href="#sent"]').tab('show');

    $('a#inbox, a#trash').removeClass('active');
    $('a#sent').addClass('active');
  }

  Inbox.show_trash = function() {
    $('#inbox-tabs a[href="#trash"]').tab('show');

    $('a#inbox, a#sent').removeClass('active');
    $('a#trash').addClass('active');
  }

  var form_initialized = false;
  function initialize_form() {
    if(form_initialized) return;
    form_initialized = true;

    //intialize wysiwyg editor
    $('.message-form .wysiwyg-editor').ace_wysiwyg({
      toolbar:
      [
        'undo',
        'redo',
        null,
        'bold',
        'italic',
        'strikethrough',
        'underline',
        null,
        'justifyleft',
        'justifycenter',
        'justifyright',
        null,
        null,
        null,
        null
      ]
    }).prev().addClass('wysiwyg-style1');



    //file input
    $('.message-form input[type=file]').ace_file_input()
    .closest('.ace-file-input')
    .addClass('width-90 inline')
    .wrap('<div class="form-group file-input-container"><div class="col-sm-7"></div></div>');

    //Add Attachment
    //the button to add a new file input
    $('#id-add-attachment')
    .on('click', function(){
      var file = $('<input type="file" name="attachment" />').appendTo('#form-attachments');
      file.ace_file_input({
        no_file:'No File ...',
        // allowExt:'png|jpg|jpeg|doc|docx|pdf',
        maxSize: 1048576,//2mb in bytes
        allowExt: ["jpeg", "jpg", "png", "gif", "doc", "pdf"],
        allowMime: ["image/jpg", "image/jpeg", "image/png", "image/gif", "application/pdf", "application/msword"]
      });

      file.on('file.error.ace', function(ev, info) {
        if(info.error_count['ext'] || info.error_count['mime']) {
          last_gritter = $.gritter.add({
            title: ')-: Invalid file type!',
            text: 'Only JPG, JPEG, PNG, GIF, DOC, PDF files are allowed.',
            class_name: 'gritter-error gritter-right'
          });
          // alert('Invalid file type! Please select an image!');
        }
        if(info.error_count['size']) {
          last_gritter = $.gritter.add({
            title: ')-: Invalid file size!',
            text: 'Maximum file size is 1MB.',
            class_name: 'gritter-error gritter-right'
          });
          // alert('Invalid file size! Maximum 1MB');
        }

        //you can reset previous selection on error
        //ev.preventDefault();
        //file_input.ace_file_input('reset_input');
      });

      file.closest('.ace-file-input')
      .addClass('width-90 inline')
      .wrap('<div class="form-group file-input-container"><div class="col-sm-7"></div></div>')
      .parent().append('<div class="action-buttons pull-right col-xs-1">\
        <a href="#" data-action="delete" class="middle">\
          <i class="ace-icon fa fa-trash-o red bigger-130 middle"></i>\
        </a>\
      </div>')
      .find('a[data-action=delete]').on('click', function(e){
        //the button that removes the newly inserted file input
        e.preventDefault();
        $(this).closest('.file-input-container').hide(300, function(){ $(this).remove() });
      });
    });
  }//initialize_form

  //turn the recipient field into a tag input field!
  /**
  var tag_input = $('#form-field-recipient');
  try {
    tag_input.tag({placeholder:tag_input.attr('placeholder')});
  } catch(e) {}


  //and add form reset functionality
  /**
  $('#id-message-form').on('reset', function(){
    $('.message-form .message-body').empty();

    $('.message-form .ace-file-input:not(:first-child)').remove();
    $('.message-form input[type=file]').ace_file_input('reset_input_ui');

    var val = tag_input.data('value');
    tag_input.parent().find('.tag').remove();
    $(val.split(',')).each(function(k,v){
      tag_input.before('<span class="tag">'+v+'<button class="close" type="button">&times;</button></span>');
    });
  });
  */

  if (String(window.location).indexOf('inbox') != -1) {
    var unread = $('.message-unread input[type=checkbox]').length;
    $('#unread-sidebar').text(unread);
  }



  if (unread > 0){
    $('#unread').text(' (' + unread + ' unread messages)');
  }

  $('[data-rel=tooltip]').tooltip();

  $('#masked').mask('9?9?9', {placeholder: " "});
  $('#inbox-search').search();
  $('#inbox-search').on('cleared.fu.search', function() {
    $('.message-item').each(function() {
      $(this).removeClass('hide');
    });
  });

  $('#inbox-search').on('searched.fu.search', function() {
    //- alert('search' + e);
    var data = $(this).find('input').val().toLowerCase();
    $('.message-item').each(function() {
      var sender = $(this).find('span[class=sender]').text().toLowerCase();
      var subj = $(this).find('span[class=text]').text().toLowerCase();
      var msg = $(this).find('.message-body > p').text().toLowerCase();

      if ((sender.indexOf(data) == -1) && (subj.indexOf(data) == -1) && (msg.indexOf(data) == -1)){
        $(this).addClass('hide');
      } else {
        $(this).removeClass('hide');
      }
    });
  });
});

function successFunc(data) {
  $('.message-list').next().removeClass('hide');
  $('.message-list').removeClass('hide');
  $('.message-footer').removeClass('hide');
  $('.message-form').addClass('hide');

  $('.message-navbar').removeClass('hide');
  $('#id-message-new-navbar').addClass('hide');

  last_gritter = $.gritter.add({
    title: 'Success!',
    text: 'Message was sent successfully.',
    class_name: 'gritter-success gritter-right'
  });
  // console.log(data);
  socket.emit('message', data);
}

function validate(formData, jqForm, options) {
  var form = jqForm[0];
  if (!form.recipient.value) {
    last_gritter = $.gritter.add({
      title: ')-: Validation error!',
      text: 'Please select the message Recipient.',
      class_name: 'gritter-error gritter-right'
    });
    return false;
  }

  if (!form.subject.value) {
    last_gritter = $.gritter.add({
      title: ')-: Validation error!',
      text: 'Please provide the message Subject.',
      class_name: 'gritter-error gritter-right'
    });
    return false;
  }

  if (!form.message.value) {
    last_gritter = $.gritter.add({
      title: ')-: Validation error!',
      text: 'Please provide the Message.',
      class_name: 'gritter-error gritter-right'
    });
    return false;
  }

  return true;
}

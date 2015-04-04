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
        $('.message-list').next().removeClass('hide');
        $('.message-list').removeClass('hide');
        $('.message-footer').removeClass('hide');
        $('.message-form').addClass('hide');

        $('.message-navbar').removeClass('hide');
        $('#id-message-new-navbar').addClass('hide');
        // $('a#inbox').addClass('active');
      }
    });

  });

  //display second message right inside the message list
  $('.message-list .message-item .text, .message-list .message-item .sender').on('click', function(){
    var message = $(this).closest('.message-item');

    //if message is open, then close it
    if(message.hasClass('message-inline-open')) {
      message.removeClass('message-inline-open').find('.message-content').addClass('hide');
      return;
    }

    $('.message-container').append('<div class="message-loading-overlay"><i class="fa-spin ace-icon fa fa-spinner orange2 bigger-160"></i></div>');
    setTimeout(function() {
      $('.message-container').find('.message-loading-overlay').remove();
      message
        .addClass('message-inline-open')
        .append('<div class="message-content" />')
      var content = message.find('.message-content:last').html( $('#id-message-content').html() );

      //remove scrollbar elements
      content.find('.scroll-track').remove();
      content.find('.scroll-content').children().unwrap();

      content.find('.message-body').ace_scroll({
        size: 150,
        mouseWheelLock: true,
        styleClass: 'scroll-visible'
      });

    }, 500 + parseInt(Math.random() * 500));

  });

  //hide message list and display new message form
  //- /**
  $('.btn-new-mail').on('click', function(e){
    e.preventDefault();
    Inbox.show_form();
  });
  //- */

  $('#inbox-more').on('click', function(e) {
    $(this).find('i').removeClass('fa-refresh').addClass('fa-spinner fa-spin fa-pulse');
  });


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

    }, 300 + parseInt(Math.random() * 300));

    // $('a#inbox, a#sent, a#trash').removeClass('active');
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
      var file = $('<input type="file" name="attachment[]" />').appendTo('#form-attachments');
      file.ace_file_input();

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

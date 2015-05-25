var express = require('express');
var path = require('path');
var socket = require('socket.io');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var flash = require('express-flash');
var helmet = require('helmet');
var colors = require('colors');
var methodOverride = require('method-override');
var csrf = require('csurf');
var multer = require('multer');
var validator = require('express-validator');
var mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/hrtc');
var db = mongoose.connection;
var paginate = require('express-paginate');
var moment =  require('moment');
var momentTwitter = require('moment-twitter');
var app = express();

db.on('error', console.error.bind(console, 'Connection Error:'.red));
db.once('open', function(callback) {
  console.log("connected.....".green.underline);

  app.use(function(request, response, next){
    request.db = db;
    next();
  });
});

var routes = require('./routes/index');
  users = require('./routes/users'),
  auth = require('./routes/auth'),
  calendar = require('./routes/calendar'),
  chat = require('./routes/chat'),
  doctors = require('./routes/doctors'),
  patients = require('./routes/patients'),
  message = require('./routes/message')
  admin = require('./routes/admin');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator({
  errorFormatter: function(param, msg, value) {
    // var namespace = param.split('.'),
    // root = namespace.shift(),
    // formParam = root;
    //
    // while(namespace.length) {
    //   formParam += '[' + namespace.shift() + ']';
    // }
    return msg;
  }
}));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  store: new redisStore({
    host: 'localhost',
    port: 6379
  }),
  secret: 'r00t-b1tr13nt',
  cookie: { path: '/', maxAge: 3600000 }
}));
app.use(flash());
app.use(methodOverride());
app.use(multer({
  dest: './public/uploads/',
  rename: function(fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
  },
  putSingleFilesInArray: true
}));
app.use(csrf());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

var authenticated = function(request, response, next) {
  if (request.session && request.session.authenticated) {
    return next();
  } else {
    console.log('setting flash message');
    request.flash('error', 'Permission Error, Please login');
    return response.redirect('/auth/login');
  }
}

var adminAuth = function(request, response, next){
  if (request.session.userGroup === 'Admin' ) {
    return next();
  } else {
    request.flash('error', 'Invalid user credentials. Please login');
    return response.redirect('/auth/login');
  }
}

app.use(function(request, response, next) {
  response.locals.csrftoken = request.csrfToken();
  response.locals.session = request.session;
  response.locals.moment = moment;
  response.locals.momentTwitter = momentTwitter;
  response.locals.siteTitle = "Telemonitoring System";
  response.locals.tagLine = "Patient / Doctor interactive portal";
  next();
});

app.use('/', routes);
// admin middlewares
app.use('/admin', authenticated);
app.use('/admin', adminAuth);
// --
app.use('/admin', admin);
app.use('/auth', auth);
app.use('/user', authenticated, users);
app.use('/chat', authenticated, chat);
app.use('/calendar', authenticated, calendar);
app.use('/doctors', authenticated, doctors);
app.use('/patients', authenticated, patients);
app.use(paginate.middleware(10, 50));
app.use('/message', authenticated, message);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('errors/error', {
      message: err.message,
      error: err,
      errorContainer: true
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('errors/error', {
    message: err.message,
    error: {},
    errorContainer: true
  });
});


module.exports = app;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/test');

require('./models/user');
require('./models/session');
require('./models/survey');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next){
  var cookie = req.cookies.userSession;
  if(cookie){
    let User = mongoose.model('User');
    let Session = mongoose.model('Session');
    Session.findOne({_id: cookie}, function(err, ses){
      if(err) return next(err);
      else if(!ses){
        res.clearCookie('userSession', {path: '/'});
        next();
      }
      else {
        User.findOne({_id: ses.user}, function(err, user){
          if(err) return next(err);
          else if(!user){
            res.clearCookie('userSession', {path: '/'});
          }
          else {
            res.cookie('userSession', cookie, {path: '/', httpOnly: true, maxAge: 1000*60*60})
            req.user = user;
          }
          next();
        });
      }
    })
  }
  else {
    next();
  }
});

app.use('/api', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error: 'Error'
  });
});

module.exports = app;

const mongoose = require("mongoose");

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log("------> Connected correctly to server <------");
}, (err) => { console.log(err); });

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/userRouter');
var dishRouter = require('./routes/dishRouter');
var leadRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');

var testRouter = require('./routes/testRouter');


var session = require('express-session');
var FileStore = require('session-file-store')(session);

var app = express();

app.use(session({
	name: 'session-id',
	secret: '12345-67890-09876-54321',
	saveUninitialized: false,
	resave: false,
    store: new FileStore()
}));

app.use('/', indexRouter);
app.use('/users', userRouter);

// Basic Authentication with route user

function auth (req, res, next) {
  console.log(req.session);
  console.log("-----auth method result-----");

  if(!req.session.user) {
	console.log("nao autenticado");
	var err = new Error('You are not authenticated!');
	err.status = 403;
	return next(err);
  }
  else{
	  if( req.session.user === "authenticated" ) {	
		  console.log("Usuario autenticado");
	  	  next();
	  }
	  else{
	      console.log("nao autenticado");
	  	  var err = new Error("You're not authenticated!'");
          err.status = 403;
		  return next(err);
      }
  }
}


app.use('/test', testRouter);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cookieParser('12345-67890-09876-54321'));
app.use(auth);

////app.use(logger('dev'));
////app.use(express.json());
////app.use(express.urlencoded({ extended: false }));
////app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("Page not found");
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

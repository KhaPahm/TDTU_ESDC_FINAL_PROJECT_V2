var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookie = require('cookie-parser')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var manageRouter = require('./routes/manage')
var cartRouter = require('./routes/cart');
var payRouter = require('./routes/pay');

var app = express();
const PORT = process.env.PORT || 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'uploads')));
app.use(cookie());


app.use('/manage', express.static(path.join(__dirname, 'public')))
app.use('/', indexRouter, );
app.use('/users', usersRouter);
app.use('/manage', manageRouter);
app.use('/cart', cartRouter);
app.use('/pay', payRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
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

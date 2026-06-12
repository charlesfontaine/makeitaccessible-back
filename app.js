require('dotenv').config();
require('./models/connection');

var express = require('express');
const passport = require('passport');
require('./config/passport');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var indexRouter = require('./routes/audit');
var authRouter = require('./routes/auth');


var app = express();
app.use(passport.initialize());

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/audits', usersRouter);
app.use('/auth', authRouter);

module.exports = app;

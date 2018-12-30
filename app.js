var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./config/database');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect(db.mongodb_url, { useNewUrlParser: true, useCreateIndex: true});

var indexRouter = require('./routes/index');

require('./config/passport');

var app = express();

app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', indexRouter);

module.exports = app;

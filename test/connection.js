var db = require('../config/database');
var mongoose = require('mongoose');

mongoose.connect("mongodb://mongo:27017/test_auth", {useNewUrlParser: true, useCreateIndex: true});

module.exports = mongoose.connection;

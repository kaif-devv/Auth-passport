var express = require('express');
var mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },

});
const User = mongoose.model('User', userSchema)
module.exports = User;
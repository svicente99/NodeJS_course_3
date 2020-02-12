var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passport_local_mongoose = require('passport-local-mongoose');

var User = new Schema({
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passport_local_mongoose);

module.exports = mongoose.model('User', User);


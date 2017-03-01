/**
 * Created by DragonQueen on 2/28/17.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;

var URLSchema = new schema({
    originalUrl : String,
    shortened : String,
    useableURL : String
})
module.exports = mongoose.model('Bear', URLSchema);
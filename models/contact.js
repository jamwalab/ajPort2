let mongoose = require('mongoose');

// create a model class
let ContactModel = mongoose.Schema({
    name: String,
    contact: String,
    email: String,
    user: String
},
{
    collection: "contact"
});

module.exports = mongoose.model('ContactModel', ContactModel);
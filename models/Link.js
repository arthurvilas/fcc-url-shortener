const mongoose = require('mongoose');

const LinkSchema = mongoose.Schema({
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Links', LinkSchema);
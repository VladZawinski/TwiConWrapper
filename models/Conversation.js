const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    sid: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('conversation', conversationSchema);
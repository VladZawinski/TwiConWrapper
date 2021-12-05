const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    sid: {
        type: String,
        required: true
    },
    chatServiceSid: {
        type: String,
        required: true
    },
    participants: [
        {
            type: String
        }
    ],

})


module.exports = mongoose.model('conversation', conversationSchema);
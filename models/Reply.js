const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const replySchema = new Schema({
    threadId: {
        type: String,
        required: true
    },
    threadAuthorId: {
        type: String,
        required: true
    },
    replyAuthorId: {
        type: String,
        required: true
    },
    replyAuthorName: {
        type: String,
        required: true
    },
    replyAuthorImage: {
        type: String,
        required: true
    },
    timeStamp: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model('Reply', replySchema);
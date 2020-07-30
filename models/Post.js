const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    timeStamp: {
        type: String,
        required: true
    },
    postAuthor: {
        type: String,
        required: true
    },
    authorImage: {
        type: String,
        required: true
    },
    header: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true})

module.exports = mongoose.model('Post', postSchema);
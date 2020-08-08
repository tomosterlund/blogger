const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postRatingSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    votingUsers: {
        type: Array
    }
});

module.exports = mongoose.model('Rating', postRatingSchema);
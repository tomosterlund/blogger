const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    posts: {
        items: [
            {
                postId: { type: Schema.Types.ObjectId, required: true },
                timeStamp: { type: String, required: true },
                header: { type: String, required: true },
                content: { type: String, required: true }
            }]
    }
})

module.exports = mongoose.model('User', userSchema);
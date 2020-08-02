const bcrypt = require('bcryptjs');
const User = require('./../models/User');
const Post = require('./../models/Post');
const Reply = require('./../models/Reply');

exports.getAddPost = (req, res) => {
    res.render('members/add-post', {
        user: req.session.user
    })
}

const getDate = () => {
    let d = new Date();
    let date = d.getDate();
    let month = d.getMonth();
    let monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let year = d.getFullYear();
    let hour = d.getHours();
    let min = d.getMinutes();

    if(hour < 10) {hour = `0${hour}`};
    if(min < 10) {min = `0${min}`};

    return fullDate = `${date} ${monthsArr[month]} ${year} - ${hour}:${min}`;
}

exports.postAddPost = (req, res) => {
    getDate();
    const newPost = new Post({
        postId: req.session.user._id,
        timeStamp: fullDate,
        postAuthor: req.session.user.name,
        authorImage: req.session.user.imageUrl,
        header: req.body.header,
        content: req.body.content
    })
    newPost.save()
        .then(() => {
            res.redirect('/add-post');
        })
        .catch(error => console.log(error));
}

exports.getEditPost = (req, res) => {
    const postId = req.params.postId;
    Post.findOne({ _id: postId })
        .then(postDocument => {
            res.render('members/edit-post', {
                user: req.session.user,
                header: postDocument.header,
                content: postDocument.content,
                post: postDocument
            })
        })
}

exports.postEditPost = (req, res) => {
    Post.findById(req.params.postId)
        .then(postDocument => {
            postDocument.header = req.body.header;
            postDocument.content = req.body.content;
            postDocument.postId = postDocument.postId;
            postDocument.timeStamp = postDocument.timeStamp;
            postDocument.save()
                .then(() => {
                    return res.redirect(`/posts/${req.params.postId}`);
                })
                .catch(error => console.log(error));
        })
}

exports.getDeletePost = (req, res) => {
    const postId = req.params.postId;
    Post.findByIdAndDelete(postId)
        .then(() => {
            res.redirect(`/profile/${req.session.user._id}`);
        })
}

exports.postAddReply = (req, res) => {
    getDate();
    const threadId = req.body.threadId;
    const threadAuthorId = req.body.threadAuthorId;
    const replyAuthorId = req.session.user._id;
    const replyAuthorName = req.session.user.name;
    const replyAuthorImage = req.session.user.imageUrl;
    const timeStamp = fullDate;
    const content = req.body.content;
    const reply = new Reply({
        threadId: threadId,
        threadAuthorId: threadAuthorId,
        replyAuthorId: replyAuthorId,
        replyAuthorName: replyAuthorName,
        replyAuthorImage: replyAuthorImage,
        timeStamp: timeStamp,
        content: content,
    })
    reply.save()
        .then(() => {
            res.redirect(`/posts/${threadId}`);
        })
        .catch(error => console.log(error));
}

exports.getDeleteReply = (req, res) => {
    const replyId = req.params.replyId;
    Reply.findById(replyId)
        .then(replyDoc => {
            const threadId = replyDoc.threadId;
            Reply.findByIdAndDelete(replyId)
                .then(() => {
                    res.redirect(`/posts/${threadId}`);
                })
                .catch(error => console.log(error));
        })
}

// exports.getEditUser = (req, res, next) => {
//     const userId = req.params.userId;
//     User.findById(userId)
//         .then(() => {
//             res.render('members/edit-user')
//         })
//         .catch(error => console.log(error));
// }

// exports.postEditUser = (req, res) => {
    
// }
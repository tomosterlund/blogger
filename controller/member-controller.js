const User = require('./../models/User');
const Post = require('./../models/Post');

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

    User.findById(req.session.user._id)
        .then(result => {
            const newPost = new Post({
                postId: result._id,
                timeStamp: fullDate,
                postAuthor: result.name,
                authorImage: result.imageUrl,
                header: req.body.header,
                content: req.body.content
            })
            newPost.save();
            console.log(newPost);
            result.name = result.name;
            result.email = result.email;
            result.password = result.password;
            result.imageUrl = result.imageUrl;
            result.posts.items.push(newPost);
            result.save()
                .then(() => {
                    res.redirect('/add-post');
                })
                .catch(error => console.log(error));
        })
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
const bcrypt = require('bcryptjs');
const User = require('./../models/User');
const Post = require('./../models/Post');
const Reply = require('./../models/Reply');
const { body, validationResult } = require('express-validator');

exports.getIndex = (req, res) => {
    res.render('public/index', {
        user: req.session.user
    });
}

exports.getLogin = (req, res) => {
    res.render('public/login');
}

exports.postLogin = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(userDoc => {
            if (!userDoc) {
                return res.redirect('/login');
            }
            bcrypt.compare(req.body.password, userDoc.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.user = userDoc;
                        return res.redirect(`/profile/${userDoc._id}`);
                    }
                    res.redirect('/login');
                })
                .catch(error => res.redirect('/login'))
        })
        .catch(error => console.log(error));
}

exports.postLogout = (req, res) => {
    req.session.destroy(error => {
        console.log(error);
        res.redirect('/');
    })
}

exports.getProfile = (req, res) => {
    User.findById(req.params.profileId)
        .then(result => {
            Post.find({ postId: result._id }).sort({ createdAt: -1 })
                .then(posts => {
                    res.render('public/profile.ejs', {
                        profileUser: result,
                        sortedPosts: posts,
                    })
                })
        })
        .catch(error => console.log(error));
}

exports.getPost = (req, res) => {
    Post.findById(req.params.postId)
        .then(result => {
            User.findById(result.postId)
                .then(userInDB => {
                    Reply.find({ threadId: result._id })
                        .then(replies => {
                            res.render('public/post-view', {
                                user: req.session.user || false,
                                profileUser: userInDB,
                                post: result,
                                replies: replies
                        })
                    });
                })
        })
}

exports.getRegistration = (req, res) => {
    res.render('public/registration', {
        validationErrors: false
    });
}

exports.postValidation = [
    //FORM VALIDATION
    body('name').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
    ];

exports.postRegistration = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let errorsArray = []
        for (error of errors.array()) {
            let param = error.param;
            let msgOutput = '';
            if(param === 'email') {msgOutput = 'Invalid e-mail address';}
            else if (param === 'password') {msgOutput = 'Password needs to contain at least 5 characters'}
            else if (param === 'name') {msgOutput = 'Name field is mandatory'}
            errorsArray.push(msgOutput);
        }
        return res.render('public/registration', { 
            validationErrors: errorsArray,
        });
    }
    User.findOne({ email: req.body.email })
        .then(userDoc => {
            if (userDoc) {
                let errorsArray = [];
                errorsArray.push('A user with this e-mail address already exists');
                return res.render('public/registration', {
                    validationErrors: errorsArray
                })
            }
            const password = req.body.password;
            return bcrypt.hash(password, 12)
            .then(encryptedPassword => {
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: encryptedPassword,
                    imageUrl: req.body.imageUrl || 'https://freesvg.org/img/abstract-user-flat-3.png',
                    description: req.body.description
                })
                user.save()
                    .then(() => {
                        res.redirect('/login');
                    })
                    .catch(error => console.log(error));
            })
        })
    }
    
exports.getLatestPosts = (req, res) => {
    Post.find().sort({ createdAt: -1 })
        .then(postsCollection => {
            res.render('public/latest-posts', {
                posts: postsCollection
            });
        })
        .catch(error => console.log(error));
}
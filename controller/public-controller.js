const bcrypt = require('bcryptjs');
const User = require('./../models/User');
const Post = require('./../models/Post');
const Reply = require('./../models/Reply');
const Rating = require('./../models/PostRating');
const { body, validationResult } = require('express-validator');
const { post } = require('../routes/routes');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}))

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
            let doesFollow = false;
            if (result.followers && req.session.user) {
                for (let follower of result.followers) {
                    if (follower === req.session.user._id) {
                        doesFollow = true;
                    }
                }
            }
            Post.find({ postId: result._id }).sort({ createdAt: -1 })
                .then(posts => {
                    res.render('public/profile.ejs', {
                        profileUser: result,
                        sortedPosts: posts,
                        doesFollow: doesFollow
                    })
                })
        })
        .catch(error => console.log(error));
}

exports.getPost = (req, res) => {
    Post.findById(req.params.postId)
        .then(result => {
            Rating.findOne({postId: result._id})
                .then(postRatingDoc => {
                    let votedBefore = false;
                    if (postRatingDoc) {
                        for (let user of postRatingDoc.votingUsers) {
                            user === req.session.user._id ? votedBefore = true : votedBefore = false;
                        }
                    }
                    User.findById(result.postId)
                        .then(userInDB => {
                            let doesFollow = false;
                            if (userInDB.followers && req.session.user) {
                                for (let follower of userInDB.followers) {
                                    if (follower === req.session.user._id) {
                                        doesFollow = true;
                                    }
                                }
                            }
                            Reply.find({ threadId: result._id })
                                .then(replies => {
                                    res.render('public/post-view', {
                                        user: req.session.user || false,
                                        profileUser: userInDB,
                                        post: result,
                                        replies: replies,
                                        rating: postRatingDoc,
                                        votedBefore: votedBefore,
                                        doesFollow: doesFollow
                                })
                            });
                        })
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
            else if (param === 'password') {msgOutput = 'Password needs to contain at least 5 characters, and the passwords need to match'}
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
                const image = req.file;
                const imageUrl = image.filename;
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: encryptedPassword,
                    imageUrl: imageUrl || 'https://freesvg.org/img/abstract-user-flat-3.png',
                    description: req.body.description
                })
                user.save()
                    .then(() => {
                        return res.redirect('/login');
                        // transporter.sendMail({
                        //     to: req.body.email,
                        //     from: 'tom.osterlund1@gmail.com',
                        //     subject: 'Signup succeeded',
                        //     html: '<h1>You successfully signed up with blogger!</h1>'
                        // })

                    })
                    .catch(error => console.log(error));
            })
        })
    }
    
exports.getLatestPosts = (req, res) => {
    Post.find().sort({ createdAt: -1 })
        .then(postsCollection => {
            let latestPosts = [];
            if (postsCollection.length < 20) {
                latestPosts = postsCollection;
            } else {
                for (let i = 0; i < 20; i++) {
                    latestPosts.push(postsCollection[i]);
                }
            }
            res.render('public/latest-posts', {
                posts: latestPosts
            });
        })
        .catch(error => console.log(error));
}

exports.postSearch = (req, res) => {
    const searchKey = req.body.search;
    User.find({ name: {$regex: searchKey, $options: 'i'} }).lean()
        .then(usersDoc => {
            res.render('public/search-results', {
                results: usersDoc,
                searchKey: searchKey                
            })
        })
}
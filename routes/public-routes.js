const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('./../models/User');
const Post = require('./../models/Post');
const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {
    res.render('public/index', {
        user: req.session.user
    });
})

//SIGNING IN AND OUT
router.get('/login', (req, res) => {
    res.render('public/login', {
        user: false
    });
})

router.post('/login', (req, res) => {
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
})

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        console.log(error);
        res.redirect('/');
    })
})

//VIEWING PROFILE
router.get('/profile/:profileId', (req, res) => {
    User.findById(req.params.profileId)
        .then(result => {
            Post.find({ postId: result._id }).sort({ createdAt: -1 })
                .then(posts => {
                    res.render('public/profile.ejs', {
                        user: req.session.user || false,
                        profileUser: result,
                        sortedPosts: posts
                    })
                })
        })
        .catch(error => console.log(error));
})

router.get('/posts/:postId', (req, res) => {
    Post.findById(req.params.postId)
        .then(result => {
            User.findById(result.postId)
                .then(userInDB => {
                    res.render('public/post-view', {
                        user: req.session.user || false,
                        profileUser: userInDB,
                        post: result
                    });
                })
        })
})

//REGISTRATION
router.get('/registration', (req, res) => {
    res.render('public/registration', {
        user: false,
        validationErrors: false
    });
})

router.post('/add-user', [
    //FORM VALIDATION
    body('name').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
    ],
    (req, res) => {
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
            user: false
        });
    }
    User.findOne({ email: req.body.email })
        .then(userDoc => {
            if (userDoc) {
                let errorsArray = [];
                errorsArray.push('A user with this e-mail address already exists');
                return res.render('public/registration', {
                    user: false,
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
    });

router.get('/add-post', (req, res) => {
    res.render('members/add-post', {
        user: req.session.user
    })
})

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

router.post('/add-post', (req, res) => {
    getDate();

    User.findById(req.session.user._id)
        .then(result => {
            const newPost = new Post({
                postId: result._id,
                timeStamp: fullDate,
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
})

module.exports = router;
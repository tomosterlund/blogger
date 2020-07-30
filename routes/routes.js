const router = require('express').Router();
const publicController = require('./../controller/public-controller');
const memberController = require('./../controller/member-controller');
const isAuthenticated = require('./../controller/is-authenticated');
const { body, validationResult } = require('express-validator');

router.get('/', publicController.getIndex);

//SIGNING IN AND OUT
router.get('/login', publicController.getLogin);

router.post('/login', publicController.postLogin);

router.get('/logout', publicController.postLogout);

//VIEWING PROFILE & PUBLIC ROUTES
router.get('/profile/:profileId', publicController.getProfile);

router.get('/posts/:postId', publicController.getPost);

router.get('/latest-posts', publicController.getLatestPosts);

//REGISTRATION
router.get('/registration', publicController.getRegistration);

router.post('/add-user', publicController.postValidation, publicController.postRegistration);

//MEMBER-ROUTES
router.get('/add-post', isAuthenticated, memberController.getAddPost);

router.post('/add-post', isAuthenticated, memberController.postAddPost);

router.get('/edit-post/:postId', memberController.getEditPost);

router.post('/edit-post/:postId', memberController.postEditPost);

router.get('/delete-post/:postId', memberController.getDeletePost);

module.exports = router;
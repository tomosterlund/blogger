const bcrypt = require('bcryptjs');
const User = require('./../models/User');
const Post = require('./../models/Post');
const Reply = require('./../models/Reply');
const Rating = require('./../models/PostRating');

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
        content: req.body.content,
    })
    newPost.save()
        .then(() => {
            res.redirect(`/profile/${req.session.user._id}`);
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

exports.getEditUser = (req, res, next) => {
    const userId = req.params.userId;
    User.findById(userId)
        .then(() => {
            res.render('members/edit-user')
        })
        .catch(error => console.log(error));
}

exports.postEditUser = (req, res) => {
    const userParam = req.params.userId;
    const updatedName = req.body.name;
    const updatedEmail = req.body.email;
    const updatedImage = req.file;
    const updatedDescription = req.body.description;
    return bcrypt.hash(req.body.password, 12)
        .then(encryptedPassword => {
            const updatedPassword = encryptedPassword;
            User.findById(userParam)
                .then(userDocument => {
                    userDocument.name = updatedName;
                    userDocument.email = updatedEmail;
                    if (updatedImage) {
                        userDocument.imageUrl = updatedImage.filename;
                    } else {
                        userDocument.imageUrl = userDocument.imageUrl;
                    }
                    userDocument.description = updatedDescription;
                    userDocument.password = updatedPassword;
                    userDocument.save()
                        .then(() => {
                            req.session.user = userDocument;
                            Post.updateMany(
                                { postId: userParam },
                                {"$set": { postAuthor: updatedName, authorImage: userDocument.imageUrl }}
                            )
                            .then(() => {
                                Reply.updateMany(
                                    { replyAuthorId: userParam },
                                    { "$set": { replyAuthorName: updatedName, replyAuthorImage: userDocument.imageUrl } }
                                )
                                .then(() => {
                                    res.redirect(`/profile/${userParam}`);
                                })
                                .catch(error => console.log(error));
                            })
                        })
                })
        })
}

exports.postPostRating = (req, res) => {
    const postParam = req.params.postId;
    const authorId = req.body.postId;
    Rating.findOne({postId: postParam})
        .then(ratingDoc => {
            if (!ratingDoc) {
                const rating = new Rating({
                    postId: postParam,
                    authorId: authorId,
                    rating: 0
                })
                rating.save()
                    .then(() => {
                        Rating.findOne({postId: postParam})
                            .then(rateDoc => {
                                rateDoc.postId = rateDoc.postId;
                                rateDoc.authorId = rateDoc.authorId;
                                rateDoc.rating = rateDoc.rating + parseInt(req.body.voteValue, 10);
                                rateDoc.votingUsers.push(req.session.user._id);
                                rateDoc.save()
                                    .then(() => {
                                        return res.redirect(`/posts/${postParam}`);
                                    })
                                    .catch(error => console.log(error));
                            })
                    })
                    .catch(error => console.log(error));
            } else if (ratingDoc) {
                    Rating.findOne({postId: postParam})
                        .then(rateDoc => {
                            rateDoc.postId = rateDoc.postId;
                            rateDoc.authorId = rateDoc.authorId;
                            rateDoc.rating = rateDoc.rating + parseInt(req.body.voteValue, 10);
                            rateDoc.votingUsers.push(req.session.user._id);
                            rateDoc.save()
                                .then(() => {
                                    res.redirect(`/posts/${postParam}`);
                                })
                                .catch(error => console.log(error));
                        })
            }
            
        })
}

exports.postFollow = (req, res) => {
    let profileParam = req.params.profileId;
    User.findById(profileParam)
        .then(userDoc => {
            userDoc.name = userDoc.name;
            userDoc.email = userDoc.email;
            userDoc.password = userDoc.password;
            userDoc.imageUrl = userDoc.imageUrl;
            userDoc.description = userDoc.description;
            userDoc.followers.push(req.session.user._id);
            userDoc.save()
                .then(() => {
                    User.findById(req.session.user._id)
                        .then(currentUser => {
                            currentUser.name = currentUser.name;
                            currentUser.email = currentUser.email;
                            currentUser.password = currentUser.password;
                            currentUser.imageUrl = currentUser.imageUrl;
                            currentUser.description = currentUser.description;
                            currentUser.following.push(userDoc._id);
                            currentUser.save()
                                .then(() => {
                                    res.redirect(`/profile/${userDoc._id}`)
                                })
                        })
                })
        })
}

exports.postFollowThruPost = (req, res) => {
    let profileParam = req.params.profileId;
    User.findById(profileParam)
        .then(userDoc => {
            userDoc.name = userDoc.name;
            userDoc.email = userDoc.email;
            userDoc.password = userDoc.password;
            userDoc.imageUrl = userDoc.imageUrl;
            userDoc.description = userDoc.description;
            userDoc.followers.push(req.session.user._id);
            userDoc.save()
                .then(() => {
                    User.findById(req.session.user._id)
                        .then(currentUser => {
                            currentUser.name = currentUser.name;
                            currentUser.email = currentUser.email;
                            currentUser.password = currentUser.password;
                            currentUser.imageUrl = currentUser.imageUrl;
                            currentUser.description = currentUser.description;
                            currentUser.following.push(userDoc._id);
                            currentUser.save()
                                .then(() => {
                                    res.redirect(`/posts/${req.body.postId}`)
                                })
                        })
                })
        })
}

exports.postUnfollow = (req, res) => {
    let profileParam = req.params.profileId;
    User.findById(profileParam)
        .then(userDoc => {
            userDoc.name = userDoc.name;
            userDoc.email = userDoc.email;
            userDoc.password = userDoc.password;
            userDoc.imageUrl = userDoc.imageUrl;
            userDoc.description = userDoc.description;
            let ind = userDoc.followers.indexOf(req.session.user._id);
            userDoc.followers.splice(ind, 1);
            userDoc.save()
                .then(() => {
                    User.findById(req.session.user._id)
                        .then(currentUser => {
                            currentUser.name = currentUser.name;
                            currentUser.email = currentUser.email;
                            currentUser.password = currentUser.password;
                            currentUser.imageUrl = currentUser.imageUrl;
                            currentUser.description = currentUser.description;
                            let indexOfUser = currentUser.following.indexOf(userDoc._id);
                            currentUser.following.splice(indexOfUser, 1);
                            currentUser.save()
                                .then(() => {
                                    res.redirect(`/profile/${userDoc._id}`);
                                })
                        })
                })
        })
}

exports.postUnfollowThruPost = (req, res) => {
    let profileParam = req.params.profileId;
    User.findById(profileParam)
        .then(userDoc => {
            userDoc.name = userDoc.name;
            userDoc.email = userDoc.email;
            userDoc.password = userDoc.password;
            userDoc.imageUrl = userDoc.imageUrl;
            userDoc.description = userDoc.description;
            let ind = userDoc.followers.indexOf(req.session.user._id);
            userDoc.followers.splice(ind, 1);
            userDoc.save()
                .then(() => {
                    User.findById(req.session.user._id)
                        .then(currentUser => {
                            currentUser.name = currentUser.name;
                            currentUser.email = currentUser.email;
                            currentUser.password = currentUser.password;
                            currentUser.imageUrl = currentUser.imageUrl;
                            currentUser.description = currentUser.description;
                            let indexOfUser = currentUser.following.indexOf(userDoc._id);
                            currentUser.following.splice(indexOfUser, 1);
                            currentUser.save()
                                .then(() => {
                                    res.redirect(`/posts/${req.body.postId}`);
                                })
                        })
                })
        })
}

exports.getFeed = (req, res) => {
    let userParam = req.params.userId;
    User.findById(req.session.user._id).lean()
        .then(userDoc => {
            User.find({_id: [...userDoc.following]}).lean()
                .then(relevantUsers => {
                    let relevantUsersIds = [];
                    for (let u of relevantUsers) {
                        relevantUsersIds.push(u._id);
                    }
                    Post.find({postId: [...relevantUsersIds]}).sort({ createdAt: -1 })
                        .then(relevantPosts => {
                            res.render('members/feed', {
                                posts: relevantPosts
                            });
                        })
                })
        })
}

exports.getSubscriptions = (req, res) => {
    const userId = req.params.userId;
    User.findById(userId).lean()
        .then(userDoc => {
            let subscriptionsIds = userDoc.following;
            User.find({_id: [...subscriptionsIds]}).lean()
                .then(subscriptionsDoc => {
                    Post.find({postId: [...subscriptionsIds]}).sort({ createdAt: -1 }).lean()
                        .then(postsFromSubs => {
                            let usersWithPosts = [];
                            for (let user of subscriptionsDoc) {
                                let userId = String(user._id)
                                let userWithPosts = { user: user, posts: [] };
                                for (let post of postsFromSubs) {
                                    let postId = String(post.postId)
                                    if (userId === postId) {
                                        userWithPosts.posts.push(post);
                                    }
                                }
                                usersWithPosts.push(userWithPosts);
                            }
                            console.log(usersWithPosts)
                            res.render('members/subscriptions', {
                                subsWithPosts: usersWithPosts
                            })
                        })
                })
        })
}

exports.getFollowers = (req, res) => {
    const userId = req.params.userId;
    User.findById(userId).lean()
        .then(userDoc => {
            let followersIds = userDoc.followers;
            User.find({_id: [...followersIds]}).lean()
                .then(followersDoc => {
                    console.log(followersDoc);
                    res.render('members/followers', {
                        followers: followersDoc
                    })
                })
                .catch(err => console.log(err));
})
}

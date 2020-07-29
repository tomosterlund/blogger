//importing
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
// const validator = require('express-validator');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

//initializing
const app = express();
app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');

//session
app.use(session({
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        collection: 'sessions'
    }),
    secret: 'shhhhh',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

//routes
const publicRoutes = require('./routes/public-routes');
app.use(publicRoutes);

//DB
dbUri = 'mongodb+srv://tommy:tommy123@cluster0.6ne0u.mongodb.net/blogger?retryWrites=true&w=majority'
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected');
        app.listen(process.env.PORT || 3000)
    })
    .catch(error => console.log(error));

app.use('/', (req, res, next) => {
    res.status(404).send('404')
})
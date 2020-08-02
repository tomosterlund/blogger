//importing
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const csrf = require('csurf');

//initializing
const app = express();
app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');
const csrfProtection = csrf({})

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
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.user = req.session.user || false;
    res.locals.csrfToken = req.csrfToken();
    next();
})

//routes
const publicRoutes = require('./routes/routes');
app.use(publicRoutes);

//DB
dbUri = 'MongoDB-string goes here'
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        console.log('connected');
        app.listen(process.env.PORT || 3000)
    })
    .catch(error => console.log(error));

app.use('/', (req, res, next) => {
    res.status(404).send('404')
})
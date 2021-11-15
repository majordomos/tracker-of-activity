import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import bodyParser from 'body-parser';
import {userModel, timeModel} from './model/model';
import routes from './routes/routes';
import secureRoute from './routes/secure-routes';

require('./auth/auth');
mongoose.connect('mongodb://127.0.0.1:27017/tracker-of-activity');
mongoose.connection.on('error', error => console.log(error));
mongoose.Promise = global.Promise;

const app = express();
const port = 3000;
app.use(passport.initialize());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', routes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoute);
app.listen(port, () => {
        console.log(`Server started at ${port}.`)
    });
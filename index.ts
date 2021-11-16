import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import bodyParser from 'body-parser';
import {userModel, trackModel} from './model/model';
import routes from './routes/routes';
import secureRoute from './routes/secure-routes';
import redis, { RedisClient } from 'redis';

require('./auth/auth');
mongoose.connect('mongodb://127.0.0.1:27017/tracker-of-activity');
mongoose.connection.on('error', error => console.log(error));
mongoose.Promise = global.Promise;

const redisClient = redis.createClient(6379);
redisClient.on('error', (error) => {
    console.error(error);
});
const app = express();
const port = 3000;
app.use(passport.initialize());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', routes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoute);
app.listen(port, () => {
        console.log(`Server started at ${port}.`)
    });
export default redisClient;
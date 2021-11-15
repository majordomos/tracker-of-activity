import express from 'express';
import moment from 'moment';
import jwt_decode from 'jwt-decode';
import {timeModel} from '../model/model';

interface IJWTtoken{
    user: IUser,
    iat: String
}
interface IUser{
    _id: String,
    username : String
}

const router = express.Router();
router.post(
    '/start-work',
    async (req, res, next) => {
        const token = req.body.secret_token;
        const decodedToken : IJWTtoken = jwt_decode(token);       
        const currentUser = decodedToken.user.username;
        const currentTime = moment().format("ddd MMM D YYYY kk:mm:ss");
        const endTime = ' ';
        const lastTrack = await timeModel.findOne({username: currentUser, end_time: endTime});
        if (!lastTrack){
            const time = await timeModel.create({start_time: currentTime, end_time: endTime, username: currentUser});
            res.status(200).send(`start moment: ${currentTime} for ${currentUser}`);
        }
        else {
            res.status(200).send(`You did not finished last track`);
        }
    }
);
router.post(
    '/end-work',
    async (req, res, next) => {
        const token = req.body.secret_token;
        const decodedToken : IJWTtoken = jwt_decode(token);       
        const currentUser = decodedToken.user.username;
        const currentTime = moment().format("ddd MMM D YYYY kk:mm:ss");
        const endTime = ' ';
        
        const lastTrack = await timeModel.findOne({ username: currentUser, end_time: endTime});
        if (lastTrack){
            const time = await timeModel.updateOne({end_time: {$eq:endTime}, username: {$eq:currentUser}}, {end_time: currentTime});
            res.status(200).send(`end moment: ${currentTime} for ${currentUser}`);

        }
        else {
            res.status(200).send(`You have no unfineshed tracks`);
        }
    }
);
router.get( 
    '/work-time',
    async (req, res, next) => {
        const fromDate = req.query['from-date'];
        const toDate = req.query['to-date'];
        const token = req.body.secret_token;
        const decodedToken : IJWTtoken = jwt_decode(token);       
        const currentUser = decodedToken.user.username;
        let allTracks = await timeModel.find({username: currentUser}); 
        let callTracks = [];

        if (toDate && fromDate){
            callTracks = allTracks.filter(track=>{
                console.log(`mom: ${moment(track.end_time, 'ddd MMM DD YYYY kk:mm:ss')} dad: ${moment(toDate.toString()).format('ddd MMM DD YYYY kk:mm:ss')}`);
                return moment(track.start_time, 'ddd MMM DD YYYY kk:mm:ss').isAfter(fromDate.toString()) 
                && moment(track.end_time, 'ddd MMM DD YYYY kk:mm:ss').isBefore(moment(toDate.toString()).format('ddd MMM DD YYYY kk:mm:ss'), 'day');
            }
            );
        }
        const sumOfHours:Number = callTracks.reduce( (prevTrack, currTrack) => {
            return moment.duration(moment(prevTrack.end_time.toString()).diff(moment(prevTrack.start_time.toString()))).asHours() +
                moment.duration(moment(currTrack.end_time.toString()).diff(moment(currTrack.start_time.toString()))).asHours();

        });
        console.log(`sum: ${sumOfHours}`);

        
        
        // if (toDate && fromDate)
        //     console.log(`diff: ${moment.duration(moment(toDate.toString()).diff(moment(fromDate.toString()))).asHours()}`);
        res.status(200);
    }
);


export default router;
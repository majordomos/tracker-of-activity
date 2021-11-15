import express from 'express';
import moment from 'moment';
import {timeModel} from '../model/model';

const router = express.Router();
router.get(
    '/user-info',
    (req, res, next) => {
        res.json({
            message: 'User info',
            user: req.user,
            token: req.query.secret_token
        })
    }  
);
router.post(
    '/start-work',
    async (req, res, next) => {
        const currentTime = moment().format("ddd MMM D YYYY kk:mm:ss");
        const currentUser = req.query.username;
        const endTime = ' ';
        res.send(`start moment: ${currentTime} for ${currentUser}`);
        const lastTrack = await timeModel.findOne({username: currentUser, end_time: endTime});
        // console.log(`last track: ${lastTrack}`);
        if (!lastTrack){
            const time = await timeModel.create({start_time: currentTime, end_time: endTime, username: currentUser});
        }
        else {
            console.log('You did not finished last track');
        }
    }
);
router.post(
    '/end-work',
    async (req, res, next) => {
        const currentTime = moment().format("ddd MMM D YYYY kk:mm:ss");
        const currentUser = req.query.username;
        const endTime = ' ';
        res.send(`end moment: ${currentTime} for ${currentUser}`);
        const lastTrack = await timeModel.findOne({ username: currentUser, end_time: endTime});
        if (lastTrack){
            const time = await timeModel.updateOne({end_time: {$eq:endTime}, username: {$eq:currentUser}}, {end_time: currentTime});
        }
        else {
            console.log('You have no unfineshed tracks');
        }
    }
);
router.get( 
    '/work-time',
    async (req, res, next) => {
        // const fromDate = req.query;
        // const toDate = req.query;
        const currentUser = req.query.username;
        const allTracks = await timeModel.find({username: currentUser}).sort({created_at: 1});
        
        console.log(`oldest track: ${allTracks[0]}`);
        console.log(`newest track: ${allTracks[allTracks.length-1]}`);
        console.log(`first time: ${allTracks[0].start_time}`);
        console.log(`last time: ${allTracks[allTracks.length-1].end_time}`);
        // let startTime = '2021-11-15T15:00:00';
        // let duration = moment().diff(startTime, 'hours');
        // console.log(duration.asHours());
    }
);


export default router;
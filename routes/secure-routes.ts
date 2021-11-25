import express from 'express';
import moment, { MomentInput } from 'moment';
import {trackModel, ITrack} from '../model/model';
import redisClient from '../index';

interface IUser{
    _id: string,
    username : string
}

const router = express.Router();
router.post(
    '/start-work',
    async (req, res) => {
        let currentUser: string = '';
        if (req){
            currentUser = (req.user as IUser).username;
        }
        const currentTime = moment().format("ddd MMM D YYYY kk:mm:ss");
        const endTime = new Date(0);
        const timeDiff: number = 0;
        if (!currentUser){
            return res.status(403).send('Unauthorized');
        }
        const lastTrack = await trackModel.findOne({end_time: endTime, username: currentUser});
        if (!lastTrack){
            const newTrack = await trackModel.create({start_time: currentTime, end_time: endTime, username: currentUser, time_diff: timeDiff});
            res.status(200).send(`start moment: ${currentTime} for ${currentUser}`);
        }
        else
            res.status(200).send(`You did not finished last track`);
    }
);
router.post(
    '/end-work',
    async (req, res) => {
        let currentUser: string = '';
        if (req){
            currentUser = (req.user as IUser).username;
        }
        const currentTime = new Date(moment().format("ddd MMM D YYYY kk:mm:ss"));
        const endTime = new Date(0);
        let timeDiff: number = 0;
        const workHours = (start_time:MomentInput, end_time:MomentInput) => {
            return moment.duration(moment(end_time, 'ddd MMM DD YYYY kk:mm:ss').diff(moment(start_time, 'ddd MMM DD YYYY kk:mm:ss'))).asHours()
        };
        if (currentUser){
            const lastTrack = await trackModel.findOne({end_time: endTime,  username: currentUser});
            if (lastTrack){
                timeDiff = workHours(lastTrack.start_time, currentTime);
                const time = await trackModel.updateOne({end_time: {$eq:endTime}, username: {$eq:currentUser}}, {end_time: currentTime, time_diff: timeDiff});
                res.status(200).send(`end moment: ${currentTime} for ${currentUser}`);
            }
            else
                res.status(200).send(`You have no unfineshed tracks`);
        }
    }
);
router.get( 
    '/work-time',
    async (req, res) => {
        const fromDate = (req.query['from-date'])?.toString();
        const toDate = (req.query['to-date'])?.toString();    
        let currentUser: string = '';
        if (req){
            currentUser = (req.user as IUser).username;
        }
        const keyValue = `${currentUser}${fromDate}${toDate}`;
        redisClient.get(
            keyValue,
            async (err, sum) => {
                if (sum){
                    return res.status(200).send(`number of hours: ${Math.floor(parseInt(sum))}`);
                }
                let allTracks: ITrack[] = [];
                if (toDate && fromDate){
                    const toDateFormatted = new Date(new Date(toDate).setHours(23, 59, 59));
                    const fromDateFormatted = new Date(new Date(fromDate).setHours(0, 0, 0));
                    allTracks = await trackModel.find({username: currentUser, start_time: {$gte: fromDateFormatted}, end_time: {$lte: toDateFormatted}}).lean(); 
                }
                const sumOfHours = allTracks.reduce((acc, currentTrack) => acc + currentTrack.time_diff, 0);
                redisClient.set(keyValue, JSON.stringify(sumOfHours));
                return res.status(200).send(`number of hours: ${Math.floor(sumOfHours)}`);
            }
        );
    }
);
export default router;
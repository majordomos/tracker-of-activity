import express from 'express';
import moment from 'moment';
import jwt_decode from 'jwt-decode';
import {timeModel} from '../model/model';
import redisClient from '../index';

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
        const token = req.header('authorization');
        if(token){
            const decodedToken : IJWTtoken = jwt_decode(token.toString());       
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
    }
);
router.post(
    '/end-work',
    async (req, res, next) => {
        const token = req.header('authorization');
        if(token){
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
    }
);
router.get( 
    '/work-time',
    async (req, res, next) => {
        const fromDate = req.query['from-date'];
        const toDate = req.query['to-date'];
        const token = req.header('authorization');
        if(token){
            const decodedToken : IJWTtoken = jwt_decode(token);       
            const currentUser = decodedToken.user.username;
            const keyValue = `${currentUser}${fromDate}${toDate}`;
            redisClient.get(
                keyValue,
                async (err, sum) => {
                    if (sum){
                        return res.status(200).send(`number of hours: ${sum}`);
                    }
                    else {
                        let allTracks = await timeModel.find({username: currentUser}); 
                        let callTracks = [];
                        if (toDate && fromDate){
                            callTracks = allTracks.filter(track=>{
                                return moment(track.start_time, 'ddd MMM DD YYYY kk:mm:ss').isAfter(fromDate.toString()) 
                                && moment(track.end_time, 'ddd MMM DD YYYY kk:mm:ss').isSameOrBefore(moment(toDate.toString()), 'day')
                            }
                            );
                        }
                        let sumOfHours = 0;
                        for (let currentTrack of callTracks){
                            sumOfHours += moment.duration(moment(currentTrack.end_time, 'ddd MMM DD YYYY kk:mm:ss').diff(moment(currentTrack.start_time, 'ddd MMM DD YYYY kk:mm:ss'))).asHours()
                        }
                        redisClient.set(keyValue, JSON.stringify(sumOfHours));
                        return res.status(200).send(`number of hours: ${(sumOfHours)}`);
                    }
                }
            );
        }   
    }
);


export default router;
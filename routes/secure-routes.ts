import express from 'express';
import moment from 'moment';
import jwt_decode from 'jwt-decode';
import {trackModel, ITrack} from '../model/model';
import redisClient from '../index';

interface IJWTtoken{
    user: ITokenUser,
    iat: String
}
interface ITokenUser{
    _id: String,
    username : String
}

const router = express.Router();
router.post(
    '/start-work',
    async (req, res) => {
        const token = req.header('authorization');
        if(token){
            const decodedToken : IJWTtoken = jwt_decode(token.toString());       
            const currentUser: string = String(decodedToken.user.username);
            const currentTime = moment().format("ddd MMM D YYYY kk:mm:ss");
            const endTime = ' ';
            if (currentUser){
                const lastTrack = await trackModel.findOne({end_time: endTime, username: currentUser});
                if (!lastTrack){
                    const newTrack = await trackModel.create({start_time: currentTime, end_time: endTime, username: currentUser});
                    res.status(200).send(`start moment: ${currentTime} for ${currentUser}`);
                }
                else {
                    res.status(200).send(`You did not finished last track`);
                }
            }
        }
    }
);
router.post(
    '/end-work',
    async (req, res) => {
        const token = req.header('authorization');
        if(token){
            const decodedToken : IJWTtoken = jwt_decode(token);       
            const currentUser: string = String(decodedToken.user.username);
            const currentTime = moment().format("ddd MMM D YYYY kk:mm:ss");
            const endTime = ' ';
            if (currentUser){
                const lastTrack = await trackModel.findOne({end_time: endTime,  username: currentUser});
                if (lastTrack){
                    const time = await trackModel.updateOne({end_time: {$eq:endTime}, username: {$eq:currentUser}}, {end_time: currentTime});
                    res.status(200).send(`end moment: ${currentTime} for ${currentUser}`);

                }
                else {
                    res.status(200).send(`You have no unfineshed tracks`);
                }
            }
        }
    }
);
router.get( 
    '/work-time',
    async (req, res) => {
        const fromDate = req.query['from-date'];
        const toDate = req.query['to-date'];
        const token = req.header('authorization');
        if(token){
            const decodedToken : IJWTtoken = jwt_decode(token);       
            const currentUser: string = String(decodedToken.user.username);
            const keyValue = `${currentUser}${fromDate}${toDate}`;
            redisClient.get(
                keyValue,
                async (err, sum) => {
                    if (sum){
                        return res.status(200).send(`number of hours: ${Math.floor(parseInt(sum))}`);
                    }
                    else {
                        let allTracks = await trackModel.find({username: currentUser}); 
                        let callTracks: ITrack[] = [];
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
                        return res.status(200).send(`number of hours: ${Math.floor(sumOfHours)}`);
                    }
                }
            );
        }   
    }
);


export default router;
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {userModel, IUser} from '../model/model';

const router = express.Router();

router.post(
    '/auth', 
    async(req, res, next) => {
        passport.authenticate(
            'auth',
            async(err, user:IUser) => {
                try{
                    if (err || !user){
                        const error = new Error('An error occurred.');
                        return next(error);
                    }
                    req.login(
                        user,
                        {session:false},
                        async(error) => {
                            if(error) return next(error);
                            const body = {_id:user._id, username: user.username};
                            const token = jwt.sign({user:body}, 'TOP_SECRET');
                            return res.status(200).json({token});
                        }
                    );
                }
                catch(error){
                    return next(error);
                }
            })
            (req, res, next);
        }
    );
export default router;
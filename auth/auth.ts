import passport from 'passport';
import {userModel} from '../model/model';
import * as passportLocal from 'passport-local';
import JWTstrategy from 'passport-jwt';
import ExtractJWT from 'passport-jwt';

const localStrategy = passportLocal.Strategy;

passport.use(
    'auth',
    new localStrategy(
        {
            usernameField: 'username',
            passwordField: 'password'
        },
        async (username, password, done) => {
            try{
                const user = await userModel.findOne({username});
                if (!user) {
                    return done(null, false, {message: 'User not found'});
                }
                const validate = await user.isValidPassword(password);
                if (!validate){
                    return done(null, false, {message: 'Wrong password'});
                }
                return done(null, user, {message: 'Logged successfully'});
            }
            catch(error) {
                console.log(`error: ${error}`);
                return done(error);
            }
        }
    )
);

passport.use(
    new JWTstrategy.Strategy(
        {
            secretOrKey: 'TOP_SECRET',
            jwtFromRequest: ExtractJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
        },
        async (token, done) => {
            try{
                return done(null, token.user);
            }
            catch(error){
                done(error);
            }
        }

    )
);
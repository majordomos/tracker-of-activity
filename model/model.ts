import {Schema, model, Document} from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document{
    username: string,
    password: string
}

export interface ITrack extends Document{
    start_time: Date,
    end_time: Date,
    username: string,
    time_diff: number
}

const userSchema = new Schema<IUser>({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        unique: true
    }
});
userSchema.methods.isValidPassword = async function(password){
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
    return compare;
}

userSchema.pre(
    'save',
    async function(next){
        const user = this;
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    }
);

const trackSchema = new Schema<ITrack>({
    start_time:{
        type: Date,
        required: true
    },
    end_time:{
        type: Date
    },
    username:{
        type: String,
        required: true
    },
    time_diff: {
        type: Number
    }
});
export const userModel = model<any, any, IUser>('user', userSchema);
export const trackModel = model<ITrack>('track', trackSchema);
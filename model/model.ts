import {Schema, model, Document} from 'mongoose';

export interface IUser extends Document{
    username: string,
    password: string
}

export interface ITrack extends Document{
    start_time: string,
    end_time: string,
    username: string | undefined
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
    let compare: Boolean = true;
    if (password !== user.password){
        compare = false;
    }
    return compare;
}

const trackSchema = new Schema<ITrack>({
    start_time:{
        type: String,
        required: true
    },
    end_time:{
        type: String
    },
    username:{
        type: String,
        required: true
    }
});

export const userModel = model<any, any, IUser>('user', userSchema);
export const trackModel = model<ITrack>('track', trackSchema);
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    let compare = true;
    if (password !== user.password){
        compare = false;
    }
    return compare;
}

const timeSchema = new Schema({
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

export const userModel = mongoose.model('user', userSchema);
export const timeModel = mongoose.model('time', timeSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: string;
}

const userSchema: Schema = new Schema({
    username: { type: String, required: true, unique : true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String,enum: ['admin', 'farmer', 'consumer', 'delivery_agent'], required: true },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;




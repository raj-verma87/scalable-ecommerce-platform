import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document{
    email: string;
    password: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    email: {type: String, required:true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ['USER', 'ADMIN' ], default: 'USER'},
    createdAt: {type: Date, default: Date.now}
});

const User = mongoose.model<IUser>('User',userSchema);
export default User;


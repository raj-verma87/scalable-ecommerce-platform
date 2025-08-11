import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  authUserId: string; // Reference to _id from Auth Service
  name?: string;
  address?: string;
  phone?: string;
}

const userSchema = new Schema<IUser>(
  {
    authUserId: {
      type: String, // stored as string for cross-service compatibility
      required: true,
      index: true
    },
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);

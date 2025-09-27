import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  authUserId: string;
  name?: string;
  address?: string;
  phone?: string;
  role: "USER" | "ADMIN";
}

const userSchema = new Schema<IUser>(
  {
    authUserId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);

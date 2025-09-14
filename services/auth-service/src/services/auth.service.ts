import { generateToken, generateRefreshToken } from '../utils/jwt';
import dotenv from "dotenv";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, {IUser} from '../models/user.model';
import { StatusCodes } from '../constants/statusCodes';
import { Messages } from '../constants/messages';
import mongoose from 'mongoose';
import axios from 'axios';

dotenv.config();

// Environment variables for internal user-service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:5002/api/users';

const USER_SERVICE_HEALTH_URL = process.env.USER_SERVICE_HEALTH_URL || 'http://user-service:5002/health';


export const registerUser = async (email: string, password: string)=> {
    // Fast-fail if user-service appears down
    try {
      await axios.get(USER_SERVICE_HEALTH_URL, { timeout: 2000 });
    } catch (err: any) {
      throw { statusCode: 503, message: 'User Service unavailable. Please try again later.' };
    }

    const existingUser = await User.findOne({email});
    console.log(existingUser);
    if(existingUser){
        throw {
            statusCode: StatusCodes.BAD_REQUEST,
            message: Messages.USER_ALREADY_EXISTS
        };
    }
    const hashPassword = await bcrypt.hash(password,10);
    // First user gets ADMIN role automatically
    const userCount = await User.countDocuments();
    const roleToAssign = userCount === 0 ? 'ADMIN' : 'USER';
    const user: IUser = await User.create({email, password:hashPassword, role: roleToAssign});
  // 🔹 Call User Service to create empty profile; fail and rollback if it doesn't work
  try {
    await axios.post(`${USER_SERVICE_URL}/profile`,
      { authUserId: user._id, name: '', address: '', phone: '', role: roleToAssign },
      {
        headers: {
          Authorization: `Bearer ${generateToken({ id: user._id, role: user.role })}`
        },
        timeout: 5000
      }
    );
    console.log('Empty profile created in User Service');
  } catch (err: any) {
    console.error('Failed to create profile in User Service:', err?.response?.data || err?.message || err);
    // rollback created auth user to keep data consistent
    try { await User.deleteOne({ _id: user._id }); } catch (_) {}
    throw { statusCode: 503, message: 'User Service unavailable. Registration aborted.' };
  }

    const userIdAsString = (user._id as mongoose.Types.ObjectId).toString();
 
    return {
        user,
        token: generateToken({id: userIdAsString, role: user.role}),
        refreshToken: generateRefreshToken({ id: userIdAsString })
    }
};

export const createAdminUser = async (email: string, password: string, creatorRole: string) => {
  // Fast-fail if user-service appears down
  try {
    await axios.get(USER_SERVICE_HEALTH_URL, { timeout: 2000 });
  } catch (err: any) {
    throw { statusCode: 503, message: 'User Service unavailable. Please try again later.' };
  }

  if (creatorRole !== 'ADMIN') {
    throw { statusCode: StatusCodes.FORBIDDEN, message: 'Only admins can create new admins' };
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw { statusCode: StatusCodes.BAD_REQUEST, message: Messages.USER_ALREADY_EXISTS };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user: IUser = await User.create({
    email,
    password: hashedPassword,
    role: 'ADMIN'
  });

  // 🔹 Call User Service to create empty profile; fail and rollback if it doesn't work
  try {
    await axios.post(`${USER_SERVICE_URL}/profile`,
      { authUserId: user._id, name: '', address: '', phone: '', role: 'ADMIN' },
      {
        headers: {
          Authorization: `Bearer ${generateToken({ id: user._id, role: user.role })}`
        },
        timeout: 5000
      }
    );
    console.log('Empty profile created in User Service');
  } catch (err: any) {
    console.error('Failed to create profile in User Service:', err?.response?.data || err?.message || err);
    // rollback created auth user to keep data consistent
    try { await User.deleteOne({ _id: user._id }); } catch (_) {}
    throw { statusCode: 503, message: 'User Service unavailable. Admin creation aborted.' };
  }

  const userIdAsString = (user._id as mongoose.Types.ObjectId).toString();

  return {
    user,
    token: generateToken({ id: userIdAsString, role: user.role }),
    refreshToken: generateRefreshToken({ id: userIdAsString })
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  const isMatch = user && (await bcrypt.compare(password, user.password));

  if (!user || !isMatch) {
    throw {
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Invalid email or password'
    };
  }
   const userIdAsString = (user._id as mongoose.Types.ObjectId).toString();
  return {
    user,
    token: generateToken({ id: userIdAsString, role: user.role }),
    refreshToken: generateRefreshToken({ id: userIdAsString })
  };
};

export const changeRole = async (authUserId: string, role: 'USER' | 'ADMIN'): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(authUserId,{ role },{ new: true, select: '-password -__v' });
};



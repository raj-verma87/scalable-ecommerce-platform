import { generateToken, generateRefreshToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, {IUser} from '../models/user.model';
import { StatusCodes } from '../constants/statusCodes';
import { Messages } from '../constants/messages';
import mongoose from 'mongoose';
import axios from 'axios';

// Environment variable for internal user-service URL
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5002/api/users';

export const registerUser = async (email: string, password: string)=> {
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
    console.log("userCount...",userCount, "roleToAssign...", roleToAssign);
  // 🔹 Call User Service to create empty profile
  try {
    await axios.post(`${USER_SERVICE_URL}/profile`, 
      { name: '', address: '', phone: '', role: roleToAssign }, 
      {
        headers: {
          Authorization: `Bearer ${generateToken({ id: user._id, role: user.role })}`
        }
      }
    );
    console.log('Empty profile created in User Service');
  } catch (err) {
    console.error('Failed to create profile in User Service:', err);
  }

    const userIdAsString = (user._id as mongoose.Types.ObjectId).toString();
 
    return {
        user,
        token: generateToken({id: userIdAsString, role: user.role}),
        refreshToken: generateRefreshToken({ id: userIdAsString })
    }
};

export const createAdminUser = async (email: string, password: string, creatorRole: string) => {
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

  // 🔹 Call User Service to create empty profile
  try {
    await axios.post(`${USER_SERVICE_URL}/profile`, 
      { name: '', address: '', phone: '', role: 'ADMIN' }, 
      {
        headers: {
          Authorization: `Bearer ${generateToken({ id: user._id, role: user.role })}`
        }
      }
    );
    console.log('Empty profile created in User Service');
  } catch (err) {
    console.error('Failed to create profile in User Service:', err);
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



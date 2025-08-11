import User, { IUser } from '../models/user.model';

// Get profile by Auth Service user ID
export const getUserByAuthId = async (authUserId: string): Promise<IUser | null> => {
  return await User.findOne({ authUserId }).select('-__v');
};

// Update profile by Auth Service user ID
export const updateUserProfile = async (
  authUserId: string,
  data: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findOneAndUpdate({ authUserId }, data, { new: true }).select('-__v');
};

// Change role by Auth Service user ID
export const changeUserRole = async (
  authUserId: string,
  role: 'USER' | 'ADMIN'
): Promise<IUser | null> => {
    console.log("changeRole service...",authUserId,role);
  return await User.findOneAndUpdate({ authUserId }, { role }, { new: true }).select('-__v');
};

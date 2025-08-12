import { Request, Response } from "express";
import * as userService from '../services/user.service';
import User from '../models/user.model';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name = '', address = '', phone = '' } = req.body;

    const existingProfile = await User.findOne({ authUserId: userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const profile = await User.create({ authUserId: userId, name, address, phone });

    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await userService.getUserByAuthId(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
};

export const updateMyProfile = async (req: Request, res: Response) => {
     const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const updatedUser = await userService.updateUserProfile(userId, req.body);
    if (!updatedUser) {
    return res.status(404).json({ message: 'User not found or update failed' });
  }

  res.json(updatedUser);
};

export const changeRole = async (req: Request, res: Response) => {
  
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const targetAuthId = req.params.id;          // auth-service user id
  const { role } = req.body;

  try {
    // pass admin token through so Auth Service can authorize
    const authHeader = req.headers.authorization;

    const { data } = await axios.patch(
      `${AUTH_SERVICE_URL}/api/auth/users/${targetAuthId}/role`,
      { role },
      { headers: { Authorization: authHeader } }
    );

     await userService.changeUserRole(targetAuthId, role);
     
    return res.json({ message: 'Role updated', authResponse: data });
  } catch (err: any) {
    console.error('Error changing role:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    return res.status(status).json({ message: err.response?.data?.message || 'Error updating role' });
  }
};


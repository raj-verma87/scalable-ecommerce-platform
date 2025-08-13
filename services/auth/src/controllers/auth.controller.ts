import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes";
import { Messages } from "../constants/messages";
import { registerUser, loginUser, createAdminUser, changeRole } from "../services/auth.service";
import path from "path";
import fs from "fs";
import { publishUserRoleUpdated } from "../events/publisher";
import nodemailer from 'nodemailer';

export const register = asyncHandler(async (req: Request, res: Response)=> {
    const {email, password} = req.body;

    const {user, token, refreshToken} = await registerUser(email,password);
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: Messages.USER_CREATED,
        token,
        refreshToken
    });
});

export const createAdmin = asyncHandler(async (req: Request, res: Response)=> {
    const {email, password, role} = req.body;

    const {user, token, refreshToken} = await createAdminUser(email,password,role);
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: Messages.ADMIN_CREATED,
        token,
        refreshToken
    });
});

export const login = asyncHandler(async (req: Request, res: Response)=> {
    const {email, password} = req.body;

    const {user, token, refreshToken} = await loginUser(email,password);

    res.status(StatusCodes.OK).json({
        success: true,
        message: "user successfully logged in",
        token,
        refreshToken
    });
});

export const getPublicKey = (req: Request, res: Response) => {
  try {
    const publicKeyPath = path.join(__dirname, '../../keys/public.key');
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    res.type('text/plain').send(publicKey);
  } catch (err: any) {
    res.status(500).json({ message: 'Error reading public key' });
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const authUserId = req.params.id;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid role' });
    }

    const updatedUser = await changeRole(authUserId, role);

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    // 📢 Publish event after DB update
    publishUserRoleUpdated(updatedUser.id, updatedUser.role);

    // Send email directly here
    await sendRoleChangeEmail("rajkumarin87@gmail.com", updatedUser.role);

    
    return res.status(StatusCodes.OK).json({
      message: 'Role updated successfully',
      user: updatedUser
    });
  } catch (err: any) {
    console.error('Auth.changeUserRole error:', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message || 'Server error'
    });
  }
};

// Email sender
const sendRoleChangeEmail = async (email: string, role: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Change to your SMTP
    port: 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your Role Has Changed',
    text: `Hello, your account role has been changed to ${role}.`,
    html: `<p>Hello, your account role has been changed to <strong>${role}</strong>.</p>`
  });

  console.log(`📧 Email sent to ${email} for role ${role}`);
};




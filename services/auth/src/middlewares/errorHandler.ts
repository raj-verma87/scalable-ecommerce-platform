import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "../constants/statusCodes";
import { Messages } from "../constants/messages";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction)=>{
    console.log(err.messages);
    res.status(err.statusCodes || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || Messages.SERVER_ERROR
    });
};

export default errorHandler;


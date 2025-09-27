import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { JwtPayload } from 'jsonwebtoken';
import { asyncHandler } from '@shared/middleware/asyncHandler';
import { ApiError } from '@shared/middleware/errorHandler';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { MESSAGES } from '@shared/constants/messages';
import { successResponse } from '@shared/helpers/responseBuilder';

/**
 * @desc Create a new order
 * @route POST /api/orders
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = (req.user as JwtPayload) || ({} as JwtPayload);
  const { products, totalAmount } = req.body;
  const userId = (user as any)?.id || (req.headers['x-user-id'] as string);

  if (!userId) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
  }

  const order = await orderService.createOrder(userId, products, totalAmount);
 // res.status(HTTP_STATUS.CREATED).json(order);
 return successResponse(res, MESSAGES.ORDER.CREATED, order, HTTP_STATUS.CREATED);
});

/**
 * @desc Get orders for the logged-in user
 * @route GET /api/orders/me
 */
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = (req.user as JwtPayload) || ({} as JwtPayload);
  const userId = (user as any)?.id || (req.headers['x-user-id'] as string);

  if (!userId) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED);
  }

  const orders = await orderService.getOrdersByUser(userId);
  res.status(HTTP_STATUS.OK).json(orders);
});

/**
 * @desc Get a single order by ID
 * @route GET /api/orders/:id
 */
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);

  if (!order) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.ORDER.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json(order);
});

/**
 * @desc Update order status (admin or internal services only)
 * @route PUT /api/orders/:id/status
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = (req as any).user as JwtPayload | undefined;
  const service = (req as any).service as {
    userId?: string;
    role?: string;
    name?: string;
  } | undefined;

  const role = user?.role || service?.role || (req.headers['x-user-role'] as string);
  const userId = user?.id || service?.userId;

  const isAdmin = role === 'ADMIN';
  const isInternalService = role === 'internal' && !!service?.userId;

  if (!isAdmin && !isInternalService) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, MESSAGES.AUTH.FORBIDDEN);
  }

  console.log(
    `[Order] Status update requested by ${isAdmin ? `ADMIN ${userId}` : `${service?.name} for user ${userId}`}`
  );

  const updatedOrder = await orderService.updateOrderStatus(id, status);

  if (!updatedOrder) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, MESSAGES.ORDER.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json(updatedOrder);
});

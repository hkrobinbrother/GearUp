import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "All users fetched", users);
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, "User not found.");
  if (user.role === "ADMIN") {
    throw new ApiError(400, "Cannot change status of an admin account.");
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  sendSuccess(res, 200, "User status updated", updated);
});

export const getAllGearAdmin = catchAsync(async (req: Request, res: Response) => {
  const gear = await prisma.gearItem.findMany({
    include: { category: true, provider: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "All gear listings fetched", gear);
});

export const getAllRentalsAdmin = catchAsync(async (req: Request, res: Response) => {
  const rentals = await prisma.rentalOrder.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      items: { include: { gearItem: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "All rental orders fetched", rentals);
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) throw new ApiError(409, "Category with this name already exists.");

  const category = await prisma.category.create({ data: { name, description } });

  sendSuccess(res, 201, "Category created successfully", category);
});

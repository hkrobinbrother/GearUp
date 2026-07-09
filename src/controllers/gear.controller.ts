import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { Prisma } from "@prisma/client";

// GET /api/gear?category=&minPrice=&maxPrice=&brand=&search=&page=&limit=
export const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const { category, brand, minPrice, maxPrice, search, page = "1", limit = "10" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));

  const where: Prisma.GearItemWhereInput = {
    status: "ACTIVE",
    ...(category && { categoryId: category as string }),
    ...(brand && { brand: { equals: brand as string, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ],
    }),
    ...((minPrice || maxPrice) && {
      pricePerDay: {
        ...(minPrice && { gte: parseFloat(minPrice as string) }),
        ...(maxPrice && { lte: parseFloat(maxPrice as string) }),
      },
    }),
  };

  const [gear, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      include: { category: true, provider: { select: { id: true, name: true } } },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    }),
    prisma.gearItem.count({ where }),
  ]);

  sendSuccess(res, 200, "Gear fetched successfully", {
    gear,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const getGearById = catchAsync(async (req: Request, res: Response) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      provider: { select: { id: true, name: true, email: true } },
      reviews: {
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!gear) {
    throw new ApiError(404, "Gear item not found.");
  }

  sendSuccess(res, 200, "Gear details fetched", gear);
});

export const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { gearItems: true } } },
  });

  sendSuccess(res, 200, "Categories fetched successfully", categories);
});

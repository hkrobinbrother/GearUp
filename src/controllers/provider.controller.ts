import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";

export const addGear = catchAsync(async (req: Request, res: Response) => {
  const { name, description, brand, pricePerDay, images, stock, specifications, categoryId } =
    req.body;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  const gear = await prisma.gearItem.create({
    data: {
      name,
      description,
      brand,
      pricePerDay,
      images,
      stock,
      availableStock: stock,
      specifications,
      categoryId,
      providerId: req.user!.id,
    },
  });

  sendSuccess(res, 201, "Gear added to inventory", gear);
});

const assertOwnership = async (gearId: string, providerId: string) => {
  const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });
  if (!gear) throw new ApiError(404, "Gear item not found.");
  if (gear.providerId !== providerId) {
    throw new ApiError(403, "You do not own this gear item.");
  }
  return gear;
};

export const updateGear = catchAsync(async (req: Request, res: Response) => {
  await assertOwnership(req.params.id, req.user!.id);

  const data = { ...req.body };
  // Keep availableStock in sync when stock is adjusted upward manually
  if (data.stock !== undefined) {
    const current = await prisma.gearItem.findUnique({ where: { id: req.params.id } });
    const diff = data.stock - (current?.stock ?? 0);
    data.availableStock = Math.max(0, (current?.availableStock ?? 0) + diff);
  }

  const gear = await prisma.gearItem.update({
    where: { id: req.params.id },
    data,
  });

  sendSuccess(res, 200, "Gear updated successfully", gear);
});

export const deleteGear = catchAsync(async (req: Request, res: Response) => {
  await assertOwnership(req.params.id, req.user!.id);

  await prisma.gearItem.delete({ where: { id: req.params.id } });

  sendSuccess(res, 200, "Gear removed from inventory", null);
});

export const getProviderGear = catchAsync(async (req: Request, res: Response) => {
  const gear = await prisma.gearItem.findMany({
    where: { providerId: req.user!.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "Provider gear fetched", gear);
});

// GET /api/provider/orders - orders that contain at least one of this provider's gear items
export const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await prisma.rentalOrder.findMany({
    where: { items: { some: { gearItem: { providerId: req.user!.id } } } },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      items: { include: { gearItem: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "Provider orders fetched", orders);
});

// PATCH /api/provider/orders/:id - confirm / mark picked up / mark returned
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;

  const order = await prisma.rentalOrder.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { gearItem: true } } },
  });

  if (!order) throw new ApiError(404, "Rental order not found.");

  const ownsOrder = order.items.some((item) => item.gearItem.providerId === req.user!.id);
  if (!ownsOrder) {
    throw new ApiError(403, "You do not have gear items in this order.");
  }

  const validTransitions: Record<string, string[]> = {
    PLACED: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CANCELLED"],
    PAID: ["PICKED_UP"],
    PICKED_UP: ["RETURNED"],
  };

  if (!validTransitions[order.status]?.includes(status)) {
    throw new ApiError(
      400,
      `Cannot transition order from ${order.status} to ${status}.`
    );
  }

  // Restock gear when items are returned
  if (status === "RETURNED") {
    await prisma.$transaction(
      order.items.map((item) =>
        prisma.gearItem.update({
          where: { id: item.gearItemId },
          data: { availableStock: { increment: item.quantity } },
        })
      )
    );
  }

  // Release stock if cancelled before pickup
  if (status === "CANCELLED") {
    await prisma.$transaction(
      order.items.map((item) =>
        prisma.gearItem.update({
          where: { id: item.gearItemId },
          data: { availableStock: { increment: item.quantity } },
        })
      )
    );
  }

  const updated = await prisma.rentalOrder.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: { include: { gearItem: true } } },
  });

  sendSuccess(res, 200, "Order status updated", updated);
});

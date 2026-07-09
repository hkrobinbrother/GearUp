import { z } from "zod";

export const createGearSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    brand: z.string().optional(),
    pricePerDay: z.number().positive("Price per day must be positive"),
    images: z.array(z.string().url("Each image must be a valid URL")).optional().default([]),
    stock: z.number().int().nonnegative("Stock cannot be negative"),
    specifications: z.record(z.any()).optional(),
    categoryId: z.string().uuid("Invalid category ID"),
  }),
});

export const updateGearSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    brand: z.string().optional(),
    pricePerDay: z.number().positive().optional(),
    images: z.array(z.string().url()).optional(),
    stock: z.number().int().nonnegative().optional(),
    specifications: z.record(z.any()).optional(),
    categoryId: z.string().uuid().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid gear ID"),
  }),
});

export const gearIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid gear ID"),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name is required"),
    description: z.string().optional(),
  }),
});

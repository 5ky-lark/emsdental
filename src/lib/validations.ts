import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Product validation schemas
export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  image: z.string().url('Invalid image URL'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  inclusions: z.array(z.object({
    name: z.string().min(1, 'Inclusion name is required'),
    description: z.string().optional(),
    price: z.number().positive('Inclusion price must be positive'),
  })).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// Order validation schemas
export const orderCreateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    price: z.number().positive('Price must be positive'),
    includedItems: z.array(z.object({
      name: z.string().min(1, 'Inclusion name is required'),
      description: z.string().optional(),
      price: z.number().positive('Inclusion price must be positive'),
    })).optional(),
  })).min(1, 'At least one item is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerAddress: z.string().min(1, 'Customer address is required'),
  customerMobile: z.string().min(1, 'Customer mobile is required'),
  customerZipCode: z.string().min(1, 'Customer zip code is required'),
  shippingInfo: z.string().min(1, 'Shipping info is required'),
  paymentInfo: z.string().min(1, 'Payment info is required'),
  total: z.number().positive('Total must be positive'),
});

// Cart validation schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  includedItems: z.array(z.object({
    name: z.string().min(1, 'Inclusion name is required'),
    description: z.string().optional(),
    price: z.number().positive('Inclusion price must be positive'),
  })).optional(),
});

// Inquiry validation schemas
export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Quotation validation schemas
export const quotationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  products: z.string().min(1, 'Products information is required'),
  quantity: z.string().optional(),
  message: z.string().optional(),
});

// Payment validation schemas
export const paymentVerificationSchema = z.object({
  payment_intent_id: z.string().min(1, 'Payment intent ID is required'),
  order_id: z.string().min(1, 'Order ID is required'),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, 'File is required'),
  type: z.enum(['image'], 'Invalid file type'),
});

// Search and filter validation
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Admin validation schemas
export const adminStatsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
});

// Type exports
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type QuotationInput = z.infer<typeof quotationSchema>;
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type AdminStatsInput = z.infer<typeof adminStatsSchema>;

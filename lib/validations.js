import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const checkoutAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(150),
  email: z.string().email("Enter a valid email"),
  line1: z.string().min(1, "Address is required").max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  zip: z.string().min(1, "ZIP/postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  phone: z.string().min(1, "Phone is required").max(30),
});

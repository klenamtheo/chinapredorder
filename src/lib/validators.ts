import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }).trim().toLowerCase(),
    password: z.string().min(1, { message: "Password is required." }),
});

export const signupSchema = z.object({
    fullName: z.string().min(3, { message: "Full name is required." })
        .refine(val => val.trim().split(/\s+/).length >= 2, {
            message: "Please enter at least two names."
        }),
    email: z.string().email({ message: "Please enter a valid email address." }).trim().toLowerCase(),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const checkoutSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters." }).trim(),
    phone: z.string().regex(/^(024|020|054|055|059|027|057|026|023)\d{7}$/, {
        message: "Please enter a valid Ghana phone number (10 digits starting with 02, 05)."
    }),
    location: z.string().min(5, { message: "Please enter a descriptive delivery location." }).trim(),
    email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
});

export const productSchema = z.object({
    name: z.string().min(3, { message: "Product name is required (min 3 chars)." }).trim(),
    price: z.coerce.number().positive({ message: "Price must be greater than 0." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }).trim(),
    images: z.string().url({ message: "Invalid image URL" }).array().min(1, { message: "At least one image URL is required." }),
    category: z.string().min(1, { message: "Category is required." }),
});

export type LoginCreate = z.infer<typeof loginSchema>;
export type SignupCreate = z.infer<typeof signupSchema>;
export type CheckoutCreate = z.infer<typeof checkoutSchema>;
export type ProductCreate = z.infer<typeof productSchema>;

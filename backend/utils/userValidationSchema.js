import { z } from 'zod';

export const userSignupSchema = z.object({
    fullName: z.string().min(3).max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    avatarUrl: z.string().url().optional(),
});

export const userLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});
    
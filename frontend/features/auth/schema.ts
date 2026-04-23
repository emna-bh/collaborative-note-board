import { z } from 'zod';

export const authSchema = z
  .object({
    mode: z.enum(['signin', 'signup']),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.mode !== 'signup') {
      return;
    }

    if (!values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Please confirm your password',
      });
      return;
    }

    if (values.confirmPassword !== values.password) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export type AuthFormValues = z.infer<typeof authSchema>;

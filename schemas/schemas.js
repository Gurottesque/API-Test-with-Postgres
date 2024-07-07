import { z } from 'zod';

const registerSchema = z.object({
    username: z.string({
        invalid_type_error: 'Username must be a string',
        required_error: 'Username field is required'
    }).max(20),
    passwd: z.string({
        invalid_type_error: 'Password must be a string',
        required_error: 'Password field is required'
    }).max(255),
    email: z.string({
        invalid_type_error: 'Email must be a string',
        required_error: 'Email field is required'
    }).max(40)
}

)

const loginSchema = z.object({
    username: z.string({
        invalid_type_error: 'Username must be a string',
        required_error: 'Username field is required'
    }).max(20),
    passwd: z.string({
        invalid_type_error: 'Password must be a string',
        required_error: 'Password field is required'
    }).max(255)
}

)

export function validateRegister(body){
   return registerSchema.safeParse(body);
}

export function validateLogin(body){
    return loginSchema.safeParse(body);
 }
 
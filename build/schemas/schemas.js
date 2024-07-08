"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = validateRegister;
exports.validateLogin = validateLogin;
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    username: zod_1.z.string({
        invalid_type_error: 'Username must be a string',
        required_error: 'Username field is required'
    }).max(20),
    passwd: zod_1.z.string({
        invalid_type_error: 'Password must be a string',
        required_error: 'Password field is required'
    }).max(255),
    email: zod_1.z.string({
        invalid_type_error: 'Email must be a string',
        required_error: 'Email field is required'
    }).max(40)
});
const loginSchema = zod_1.z.object({
    username: zod_1.z.string({
        invalid_type_error: 'Username must be a string',
        required_error: 'Username field is required'
    }).max(20),
    passwd: zod_1.z.string({
        invalid_type_error: 'Password must be a string',
        required_error: 'Password field is required'
    }).max(255)
});
function validateRegister(body) {
    return registerSchema.safeParse(body);
}
function validateLogin(body) {
    return loginSchema.safeParse(body);
}

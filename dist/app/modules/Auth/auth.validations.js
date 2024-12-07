"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidationSchemas = void 0;
const zod_1 = require("zod");
const LoginUser = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({
            required_error: "Email is required",
        })
            .email(),
        password: zod_1.z.string({
            required_error: "Password is required",
        }),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
    }),
});
const DeleteTables = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        }),
        individual: zod_1.z
            .boolean({
            invalid_type_error: "Individual must be a boolean value",
        })
            .optional(),
        role: zod_1.z
            .boolean({
            invalid_type_error: "Role must be a boolean value",
        })
            .optional(),
        weekend: zod_1.z
            .boolean({
            invalid_type_error: "Weekend must be a boolean value",
        })
            .optional(),
        roster: zod_1.z
            .boolean({
            invalid_type_error: "Roster must be a boolean value",
        })
            .optional(),
    }),
});
exports.AuthValidationSchemas = {
    LoginUser,
    DeleteTables,
};

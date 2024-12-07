"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidationSchemas = void 0;
const zod_1 = require("zod");
const createValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        }),
        email: zod_1.z
            .string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
        })
            .email(),
        password: zod_1.z
            .string({
            required_error: "Password is required",
        })
            .min(6, "Password must be at least 6 characters long")
            .max(40, "Password must not exceed 40 characters"),
        role: zod_1.z.enum(["SUPER_ADMIN", "ADMIN", "USER"], {
            required_error: "Role is required",
            invalid_type_error: "Role must be USER or ADMIN",
        }),
        status: zod_1.z
            .enum(["ACTIVE", "BLOCKED"], {
            required_error: "Status is required",
            invalid_type_error: "Status must be ACTIVE or BLOCKED",
        })
            .optional(),
    }),
});
const updateValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({
            invalid_type_error: "Name must be a string",
        })
            .optional(),
        password: zod_1.z
            .string({
            invalid_type_error: "Password must be a string",
        })
            .min(6, "Password must be at least 8 characters long")
            .max(20, "Password must not exceed 20 characters")
            .optional(),
        role: zod_1.z
            .enum(["SUPER_ADMIN", "ADMIN", "USER"], {
            invalid_type_error: "Role must be USER or ADMIN",
        })
            .optional(),
        status: zod_1.z
            .enum(["ACTIVE", "BLOCKED"], {
            invalid_type_error: "Status must be ACTIVE or BLOCKED",
        })
            .optional(),
    }),
});
const updateUserName = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        }),
    }),
});
const deleteMultipleUser = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string({
            required_error: "Ids is required",
            invalid_type_error: "Ids must be an array of strings",
        })),
    }),
});
exports.UserValidationSchemas = {
    createValidation,
    updateValidation,
    updateUserName,
    deleteMultipleUser,
};

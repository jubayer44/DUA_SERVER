"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRegistrationValidationSchemas = void 0;
const zod_1 = require("zod");
const createValidation = zod_1.z.object({
    body: zod_1.z.object({
        teamName: zod_1.z.string({
            required_error: "Team Name is required",
            invalid_type_error: "Team Name must be a string",
        }),
        division: zod_1.z.enum(["BEGINNER", "INTERMEDIATE", "OPEN"], {
            required_error: "Division is required",
            invalid_type_error: "Division must be BEGINNER or INTERMEDIATE or OPEN",
        }),
        player1Name: zod_1.z.string({
            required_error: "Player 1 Name is required",
            invalid_type_error: "Player 1 Name must be a string",
        }),
        player2Name: zod_1.z.string({
            required_error: "Player 2 Name is required",
            invalid_type_error: "Player 2 Name must be a string",
        }),
        player1Email: zod_1.z.string({
            required_error: "Player 1 Email is required",
            invalid_type_error: "Player 1 Email must be a string",
        }),
        player2Email: zod_1.z.string({
            required_error: "Player 2 Email is required",
            invalid_type_error: "Player 2 Email must be a string",
        }),
        player1Phone: zod_1.z
            .string({
            invalid_type_error: "Player 1 Phone must be a string",
        })
            .optional(),
        player2Phone: zod_1.z
            .string({
            invalid_type_error: "Player 2 Phone must be a string",
        })
            .optional(),
        memo: zod_1.z
            .string({
            invalid_type_error: "Memo must be a string",
        })
            .optional(),
        name: zod_1.z.string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        }),
        email: zod_1.z.string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
        }),
        phone: zod_1.z
            .string({
            required_error: "Phone is required",
            invalid_type_error: "Phone must be a string",
        })
            .optional(),
        address: zod_1.z
            .string({
            required_error: "Address is required",
            invalid_type_error: "Address must be a string",
        })
            .optional(),
        city: zod_1.z
            .string({
            required_error: "City is required",
            invalid_type_error: "City must be a string",
        })
            .optional(),
        state: zod_1.z
            .string({
            required_error: "State is required",
            invalid_type_error: "State must be a string",
        })
            .optional(),
        zip: zod_1.z
            .string({
            required_error: "Zip is required",
            invalid_type_error: "Zip must be a string",
        })
            .optional(),
        description: zod_1.z
            .string({
            required_error: "Description is required",
            invalid_type_error: "Description must be a string",
        })
            .optional(),
        paymentType: zod_1.z.enum(["1", "2"], {
            required_error: "Payment Type is required",
            invalid_type_error: "Payment Type must be 1 or 2",
        }),
    }),
});
const eventUpdateValidation = zod_1.z.object({
    body: zod_1.z.object({
        teamName: zod_1.z
            .string({
            invalid_type_error: "Team Name must be a string",
        })
            .optional(),
        division: zod_1.z
            .enum(["BEGINNER", "INTERMEDIATE", "OPEN"], {
            invalid_type_error: "Division must be BEGINNER or INTERMEDIATE or OPEN",
        })
            .optional(),
        player1Name: zod_1.z
            .string({
            invalid_type_error: "Player 1 Name must be a string",
        })
            .optional(),
        player2Name: zod_1.z
            .string({
            invalid_type_error: "Player 2 Name must be a string",
        })
            .optional(),
        player1Email: zod_1.z
            .string({
            invalid_type_error: "Player 1 Email must be a string",
        })
            .optional(),
        player2Email: zod_1.z
            .string({
            invalid_type_error: "Player 2 Email must be a string",
        })
            .optional(),
        player1Phone: zod_1.z
            .string({
            invalid_type_error: "Player 1 Phone must be a string",
        })
            .optional(),
        player2Phone: zod_1.z
            .string({
            invalid_type_error: "Player 2 Phone must be a string",
        })
            .optional(),
        memo: zod_1.z
            .string({
            invalid_type_error: "Memo must be a string",
        })
            .optional(),
        paymentStatus: zod_1.z
            .enum(["PAID", "UNPAID"], {
            invalid_type_error: "Payment Status must be PAID or UNPAID",
        })
            .optional(),
        registrationStatus: zod_1.z
            .enum(["COMPLETED", "PENDING", "CANCELLED"], {
            invalid_type_error: "Registration Status must be COMPLETED or PENDING or CANCELLED",
        })
            .optional(),
    }),
});
const paymentUpdateValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string({
            invalid_type_error: "Name must be a string",
        })
            .optional(),
        email: zod_1.z
            .string({
            invalid_type_error: "Email must be a string",
        })
            .optional(),
        phone: zod_1.z
            .string({
            invalid_type_error: "Phone must be a string",
        })
            .optional(),
        address: zod_1.z
            .string({
            invalid_type_error: "Address must be a string",
        })
            .optional(),
        city: zod_1.z
            .string({
            invalid_type_error: "City must be a string",
        })
            .optional(),
        state: zod_1.z
            .string({
            invalid_type_error: "State must be a string",
        })
            .optional(),
        zip: zod_1.z
            .string({
            invalid_type_error: "Zip must be a string",
        })
            .optional(),
        description: zod_1.z
            .string({
            invalid_type_error: "Description must be a string",
        })
            .optional(),
        paymentStatus: zod_1.z
            .string({
            invalid_type_error: "paymentStatus must be a string",
        })
            .optional(),
    }),
});
exports.EventRegistrationValidationSchemas = {
    createValidation,
    eventUpdateValidation,
    paymentUpdateValidation,
};

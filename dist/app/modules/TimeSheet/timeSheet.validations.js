"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSheetValidationSchemas = void 0;
const zod_1 = require("zod");
const createValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        tripId: zod_1.z.string({
            required_error: "Trip Id is required",
            invalid_type_error: "Trip Id must be a string",
        }),
        date: zod_1.z.string({
            required_error: "Date is required",
            invalid_type_error: "Date must be a string",
        }),
        tripStartTime: zod_1.z.string({
            required_error: "Trip Start Time is required",
            invalid_type_error: "Trip Start Time must be a string",
        }),
        tripEndTime: zod_1.z.string({
            required_error: "Trip End Time is required",
            invalid_type_error: "Trip End Time must be a string",
        }),
        hourlyRate: zod_1.z
            .number({
            required_error: "Hourly Rate is required",
            invalid_type_error: "Hourly Rate must be a number",
        })
            .optional(),
        customer: zod_1.z.string({
            required_error: "Customer Name is required",
            invalid_type_error: "Customer must be a string",
        }),
        memo: zod_1.z
            .string({
            invalid_type_error: "Memo must be a string",
        })
            .optional(),
        userId: zod_1.z
            .string({
            invalid_type_error: "User Id must be a string",
        })
            .optional(),
    })
        .refine((data) => {
        const tripStartDate = new Date(data.tripStartTime);
        const tripEndDate = new Date(data.tripEndTime);
        // Check if tripEndTime is after tripStartTime
        return tripEndDate > tripStartDate;
    }, {
        message: "Trip End Time must be later than Trip Start Time",
        path: ["body", "tripEndTime"], // The error will point to tripEndTime
    }),
});
const updateValidation = zod_1.z.object({
    body: zod_1.z
        .object({
        tripId: zod_1.z
            .string({
            required_error: "Trip Id is required",
            invalid_type_error: "Trip Id must be a string",
        })
            .optional(),
        date: zod_1.z
            .string({
            required_error: "Date is required",
            invalid_type_error: "Date must be a string",
        })
            .optional(),
        tripStartTime: zod_1.z.string({
            required_error: "Trip Start Time is required",
            invalid_type_error: "Trip Start Time must be a string",
        }),
        tripEndTime: zod_1.z.string({
            required_error: "Trip End Time is required",
            invalid_type_error: "Trip End Time must be a string",
        }),
        tripReceipt: zod_1.z
            .string({
            invalid_type_error: "Trip Receipt must be a string",
        })
            .optional(),
        hourlyRate: zod_1.z
            .number({
            invalid_type_error: "Hourly Rate must be a number",
        })
            .optional(),
        customer: zod_1.z
            .string({
            required_error: "Customer Name is required",
            invalid_type_error: "Customer must be a string",
        })
            .optional(),
        memo: zod_1.z
            .string({
            invalid_type_error: "Memo must be a string",
        })
            .optional(),
    })
        .refine((data) => {
        const tripStartDate = new Date(data.tripStartTime);
        const tripEndDate = new Date(data.tripEndTime);
        // Check if tripEndTime is after tripStartTime
        return tripEndDate > tripStartDate;
    }, {
        message: "Trip End Time must be later than Trip Start Time",
        path: ["body", "tripEndTime"], // The error will point to tripEndTime
    }),
});
exports.TimeSheetValidationSchemas = {
    createValidation,
    updateValidation,
};

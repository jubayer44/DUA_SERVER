"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const zod_1 = require("zod");
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || http_status_1.default.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Handling Prisma Client known request errors
        if (err.code === "P2002") {
            statusCode = 403;
            message = "Duplicate Error";
            error = err.meta;
        }
    }
    else if (err instanceof client_1.Prisma.PrismaClientInitializationError) {
        statusCode = 500;
        message = "Database Initialization Error";
    }
    else if (err instanceof client_1.Prisma.PrismaClientRustPanicError) {
        statusCode = 500;
        message = "Critical Database Error";
    }
    else if (err.name === "ValidationError") {
        statusCode = err.statusCode || 400;
        message = "Validation Error";
        error = err.errors;
    }
    else if (err instanceof zod_1.ZodError) {
        // Handling Zod validation errors
        statusCode = 400;
        message = "Zod Validation Error";
        error = err.errors.map((e) => ({
            path: e === null || e === void 0 ? void 0 : e.path[2],
            message: e === null || e === void 0 ? void 0 : e.message,
        }));
    }
    res.status(statusCode).json({
        success,
        message,
        error,
    });
};
exports.default = globalErrorHandler;

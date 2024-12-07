"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserExists = exports.isUserAlreadyExists = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const isUserAlreadyExists = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
    if (res) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, `${email} already exists`);
    }
    return;
});
exports.isUserAlreadyExists = isUserAlreadyExists;
const isUserExists = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield prisma_1.default.user.findUnique({
        where: {
            id,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!res) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, `User not found`);
    }
    return res;
});
exports.isUserExists = isUserExists;

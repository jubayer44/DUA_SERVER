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
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const jwtHelpers_1 = require("../../shared/jwtHelpers");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const auth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.headers.authorization;
        if (!token) {
            return res
                .status(http_status_1.default.UNAUTHORIZED)
                .json({ success: false, message: "No token provided" });
        }
        const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.JWT_SECRET);
        if (verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.error) {
            return res.status(http_status_1.default.UNAUTHORIZED).json({
                success: false,
                message: verifiedUser.error || "You are not authorized!",
            });
        }
        const user = yield prisma_1.default.user.findUnique({
            where: {
                id: verifiedUser.id,
                status: "ACTIVE",
            },
        });
        if (!user) {
            return res
                .status(http_status_1.default.UNAUTHORIZED)
                .json({ success: false, message: "User not found" });
        }
        if (user.passwordChangedAt) {
            const iat = verifiedUser.iat;
            const passwordChangedAt = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
            if (passwordChangedAt > iat) {
                return res.status(http_status_1.default.UNAUTHORIZED).json({
                    success: false,
                    message: "Token is invalid, password has been changed!",
                });
            }
        }
        req.user = verifiedUser;
        if (roles.length && !roles.includes(verifiedUser.role)) {
            return res.status(http_status_1.default.FORBIDDEN).json({
                success: false,
                message: "Forbidden access!",
            });
        }
        next();
    });
};
exports.default = auth;

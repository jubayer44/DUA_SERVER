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
exports.AuthServices = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_1 = __importDefault(require("http-status"));
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const config_1 = __importDefault(require("../../../config"));
const jwtHelpers_1 = require("../../../shared/jwtHelpers");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const resetPasswordHtml_1 = require("../../htmlTemplate/resetPasswordHtml");
const user_utils_1 = require("../User/user.utils");
const sendEmail_1 = __importDefault(require("./sendEmail"));
const loginUser = (payload, userAgent) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const parser = new ua_parser_js_1.default();
    const results = (_a = parser === null || parser === void 0 ? void 0 : parser.setUA(userAgent)) === null || _a === void 0 ? void 0 : _a.getResult();
    const browser = ((_b = results === null || results === void 0 ? void 0 : results.browser) === null || _b === void 0 ? void 0 : _b.name) || "Unknown Browser";
    const device = ((_c = results === null || results === void 0 ? void 0 : results.os) === null || _c === void 0 ? void 0 : _c.name) || "Unknown Device";
    const city = (payload === null || payload === void 0 ? void 0 : payload.city) || "Unknown City";
    const country = (payload === null || payload === void 0 ? void 0 : payload.country) || "Unknown Country";
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.password, userData.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Password incorrect!");
    }
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
    }, config_1.default.jwt.JWT_SECRET, config_1.default.jwt.JWT_EXPIRES_IN);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
    }, config_1.default.jwt.REFRESH_SECRET, config_1.default.jwt.REFRESH_EXPIRES_IN);
    const session = yield prisma_1.default.session.create({
        data: {
            userId: userData.id,
            city: city,
            country: country,
            browser,
            device,
        },
        select: {
            id: true,
        },
    });
    return {
        accessToken,
        refreshToken,
        session,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "No token provided!");
    }
    let decodedData;
    try {
        decodedData = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.REFRESH_SECRET);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
    }
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: decodedData === null || decodedData === void 0 ? void 0 : decodedData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
    }, config_1.default.jwt.JWT_SECRET, config_1.default.jwt.JWT_EXPIRES_IN);
    return {
        accessToken,
    };
});
const changePassword = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, user_utils_1.isUserExists)(userData.id);
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.oldPassword, user.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Old password is incorrect!");
    }
    const newPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.password_salt));
    const result = yield prisma_1.default.user.update({
        where: {
            id: userData.id,
        },
        data: {
            password: newPassword,
            passwordChangedAt: new Date(),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    });
    return result;
});
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findFirst({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const resetPassToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    }, config_1.default.jwt.RESET_PASS_TOKEN_SECRET, config_1.default.jwt.RESET_PASS_TOKEN_EXPIRES_IN);
    const resetPasswordLink = `${config_1.default.reset_password_link}/reset-password?id=${user.id}&token=${resetPassToken}`;
    const html = (0, resetPasswordHtml_1.resetPasswordHtml)(resetPasswordLink);
    yield (0, sendEmail_1.default)(user.email, "Reset Password Link", html);
    return;
});
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findFirst({
        where: {
            id: payload === null || payload === void 0 ? void 0 : payload.id,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const isTokenValid = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.RESET_PASS_TOKEN_SECRET);
    if (!isTokenValid) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token!");
    }
    if (isTokenValid.id !== (payload === null || payload === void 0 ? void 0 : payload.id)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token!");
    }
    if (user.passwordChangedAt) {
        const iat = isTokenValid.iat;
        const passwordChangedAt = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
        if (passwordChangedAt > iat) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Token is invalid, password has been changed!");
        }
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, Number(config_1.default.password_salt));
    yield prisma_1.default.user.update({
        where: {
            id: payload.id,
        },
        data: {
            password: hashedPassword,
            passwordChangedAt: new Date(),
        },
    });
    return;
});
const getMyLoggedInSession = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.session.findMany({
        where: {
            userId: user === null || user === void 0 ? void 0 : user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
});
const removeMySessionFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistsSession = yield prisma_1.default.session.findUnique({
        where: {
            id,
        },
    });
    if (!isExistsSession) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Session not found");
    }
    const result = yield prisma_1.default.session.delete({
        where: {
            id,
        },
    });
    return result;
});
const removeOtherSessionFromDb = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_utils_1.isUserExists)(user.id);
    const isExistsSession = yield prisma_1.default.session.findUnique({
        where: {
            id,
            userId: user.id,
        },
    });
    if (!isExistsSession) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Session not found");
    }
    const result = yield prisma_1.default.session.delete({
        where: {
            id,
            userId: user.id,
        },
    });
    return result;
});
exports.AuthServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    getMyLoggedInSession,
    removeMySessionFromDb,
    removeOtherSessionFromDb,
};

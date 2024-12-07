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
exports.AuthControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const auth_services_1 = require("./auth.services");
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userAgent = req.headers["user-agent"];
    const result = yield auth_services_1.AuthServices.loginUser(req.body, userAgent);
    if (result === null || result === void 0 ? void 0 : result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
            secure: true, // Set to true in production if using HTTPS
            httpOnly: true,
            sameSite: "lax",
            domain: "test.atnmt.com",
            path: "/",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
    }
    if ((_a = result === null || result === void 0 ? void 0 : result.session) === null || _a === void 0 ? void 0 : _a.id) {
        res.cookie("userSession", result.session.id, {
            secure: true, // Set to true in production if using HTTPS
            httpOnly: true,
            sameSite: "lax",
            domain: "test.atnmt.com",
            path: "/",
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User logged in successfully",
        data: {
            accessToken: result === null || result === void 0 ? void 0 : result.accessToken,
            sessionId: ((_b = result === null || result === void 0 ? void 0 : result.session) === null || _b === void 0 ? void 0 : _b.id) || null,
        },
    });
}));
const logoutUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clearCookie = (cookieName) => {
        res.clearCookie(cookieName, {
            secure: true, // Set to true in production if using HTTPS
            httpOnly: true,
            sameSite: "lax",
            domain: "test.atnmt.com",
            path: "/",
        });
    };
    clearCookie("refreshToken");
    clearCookie("userSession");
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User logged out successfully",
        data: null,
    });
}));
const refreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const result = yield auth_services_1.AuthServices.refreshToken(refreshToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Token generated successfully",
        data: result,
    });
}));
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;
    // const data = pickFunction(req.body, ["oldPassword", "newPassword"]);
    const result = yield auth_services_1.AuthServices.changePassword(user, {
        oldPassword,
        newPassword,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Password changed successfully",
        data: result,
    });
}));
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.AuthServices.forgotPassword(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password reset link sent to your email. Please check your inbox or spam folder.",
        data: result,
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || "";
    const result = yield auth_services_1.AuthServices.resetPassword(token, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password reset successfully",
        data: result,
    });
}));
const getMyLoggedInSession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.AuthServices.getMyLoggedInSession(req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User session retrieved successfully",
        data: result,
    });
}));
const removeMySession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userSession } = req.cookies;
    const result = yield auth_services_1.AuthServices.removeMySessionFromDb(userSession);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User session deleted successfully",
        data: result,
    });
}));
const removeOtherSessionFromDb = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
    const result = yield auth_services_1.AuthServices.removeOtherSessionFromDb(id, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User session deleted successfully",
        data: result,
    });
}));
exports.AuthControllers = {
    loginUser,
    logoutUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    getMyLoggedInSession,
    removeMySession,
    removeOtherSessionFromDb,
};

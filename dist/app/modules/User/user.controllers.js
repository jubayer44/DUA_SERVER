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
exports.UserControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_services_1 = require("./user.services");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const picFunction_1 = __importDefault(require("../../../shared/picFunction"));
const parsePaginationOptions_1 = require("../../../shared/parsePaginationOptions");
const constant_1 = require("../../constant");
const user_constant_1 = require("./user.constant");
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = (0, picFunction_1.default)(req.body, user_constant_1.createUserPayloadKeys);
    const result = yield user_services_1.UserServices.createUserIntoDb(data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Created successfully",
        data: result,
    });
}));
const getSingleUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_services_1.UserServices.getSingleUser((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Retrieved successfully",
        data: result,
    });
}));
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const sessionId = req.query.sessionId;
    const result = yield user_services_1.UserServices.getMyProfileFromDb(user, sessionId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User Profile Retrieved successfully",
        data: result,
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filtersField = (0, picFunction_1.default)(req === null || req === void 0 ? void 0 : req.query, ["searchTerm"]);
    const options = (0, parsePaginationOptions_1.parsePaginationOptions)((0, picFunction_1.default)(req === null || req === void 0 ? void 0 : req.query, constant_1.paginationOptions));
    const result = yield user_services_1.UserServices.getAllUsersFromDb(filtersField, options, req.user);
    const message = ((_a = result === null || result === void 0 ? void 0 : result.meta) === null || _a === void 0 ? void 0 : _a.total)
        ? "All users retrieved successfully"
        : "No individual found";
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message,
        meta: result === null || result === void 0 ? void 0 : result.meta,
        data: result === null || result === void 0 ? void 0 : result.data,
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_services_1.UserServices.deleteUserFromDb((_a = req.params) === null || _a === void 0 ? void 0 : _a.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Deleted successfully",
        data: result,
    });
}));
const deleteMultipleUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_services_1.UserServices.deleteMultipleUserFromDb((_a = req.body) === null || _a === void 0 ? void 0 : _a.ids);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Deleted successfully",
        data: result,
    });
}));
const updateUserWithAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = (0, picFunction_1.default)(req.body, user_constant_1.updateUserPayloadKeys);
    const result = yield user_services_1.UserServices.updateUserWithAdminIntoDb((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, data, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Updated successfully",
        data: result,
    });
}));
const updateUserName = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = (0, picFunction_1.default)(req.body, ["name"]);
    const result = yield user_services_1.UserServices.updateUserNameIntoDb((_a = req.params) === null || _a === void 0 ? void 0 : _a.id, data, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User Updated successfully",
        data: result,
    });
}));
const getAllEmployee = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_services_1.UserServices.getAllEmployeeFromDb();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All Employee Retrieve successfully",
        data: result,
    });
}));
exports.UserControllers = {
    createUser,
    getSingleUser,
    getMyProfile,
    getAllUsers,
    deleteUser,
    deleteMultipleUser,
    updateUserWithAdmin,
    updateUserName,
    getAllEmployee,
};

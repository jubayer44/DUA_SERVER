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
exports.UserServices = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const paginationHelpers_1 = require("../../../helpers/paginationHelpers");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const user_utils_1 = require("./user.utils");
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createUserIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.role === client_1.UserRole.ADMIN) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You can't create a Admin");
    }
    yield (0, user_utils_1.isUserAlreadyExists)(payload.email);
    const hashedPassword = yield bcryptjs_1.default.hash(payload.password, Number(config_1.default.password_salt));
    const result = yield prisma_1.default.user.create({
        data: Object.assign(Object.assign({}, payload), { password: hashedPassword }),
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            hourlyRate: true,
            status: true,
        },
    });
    return result;
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_utils_1.isUserExists)(id);
    const result = yield prisma_1.default.user.findUnique({
        where: {
            id,
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
const getMyProfileFromDb = (user, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
    }
    yield (0, user_utils_1.isUserExists)(user.id);
    let session = null;
    if (sessionId) {
        session = yield prisma_1.default.session.findUnique({
            where: {
                id: sessionId,
            },
            select: {
                id: true,
            },
        });
    }
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            id: user.id,
            email: user.email,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            hourlyRate: true,
            status: true,
        },
    });
    return Object.assign(Object.assign({}, userData), { session: (session === null || session === void 0 ? void 0 : session.id) ? true : false });
});
const getAllUsersFromDb = (params, options, user) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelpers_1.paginationHelpers.calculatePagination(options);
    const { searchTerm } = params;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: ["name", "email"].map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (user.role !== client_1.UserRole.ADMIN) {
        andConditions.push({
            OR: [
                { role: client_1.UserRole.USER },
                { id: user.id }, // Include the current user
            ],
        });
    }
    const whereConditions = { AND: andConditions };
    const result = yield prisma_1.default.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: (options === null || options === void 0 ? void 0 : options.sortBy) && (options === null || options === void 0 ? void 0 : options.sortOrder)
            ? {
                [options.sortBy]: options.sortOrder,
            }
            : {
                createdAt: "desc",
            },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    });
    const total = yield prisma_1.default.user.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total: total,
        },
        data: result,
    };
});
const deleteUserFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistsUser = yield prisma_1.default.user.findUnique({
        where: {
            id,
        },
    });
    if (!isExistsUser) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield prisma_1.default.user.delete({
        where: {
            id,
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
const deleteMultipleUserFromDb = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const superAdmins = yield prisma_1.default.user.findMany({
        where: {
            role: client_1.UserRole.ADMIN,
        },
        select: {
            id: true,
        },
    });
    // Extract the super_admin IDs into an array
    const superAdminIds = superAdmins.map((user) => user.id);
    // Check if any super_admin ID is in the ids array
    const foundSuperAdminId = superAdminIds.find((id) => ids.includes(id));
    if (foundSuperAdminId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You can't delete super admin users");
    }
    // Check if all specified users exist
    const isMultipleUsersExists = yield prisma_1.default.user.findMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
    if (isMultipleUsersExists.length !== ids.length) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Selected users not found");
    }
    // Proceed to delete the users
    const result = yield prisma_1.default.user.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    });
    return result;
});
const updateUserWithAdminIntoDb = (id, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.id === id) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You can't update your own profile");
    }
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            id,
        },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const result = yield prisma_1.default.user.update({
        where: {
            id,
        },
        data: payload,
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
const updateUserNameIntoDb = (id, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, user_utils_1.isUserExists)(id);
    const result = yield prisma_1.default.user.update({
        where: {
            id,
        },
        data: {
            name: payload.name,
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
const getAllEmployeeFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findMany({
        where: {
            role: client_1.UserRole.USER,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    return result;
});
exports.UserServices = {
    createUserIntoDb,
    getSingleUser,
    getMyProfileFromDb,
    getAllUsersFromDb,
    deleteUserFromDb,
    deleteMultipleUserFromDb,
    updateUserWithAdminIntoDb,
    updateUserNameIntoDb,
    getAllEmployeeFromDb,
};

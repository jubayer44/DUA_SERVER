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
exports.TimeSheetServices = void 0;
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const fileUploader_1 = require("../../../helpers/fileUploader");
const paginationHelpers_1 = require("../../../helpers/paginationHelpers");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const user_utils_1 = require("../User/user.utils");
const timeSheet_utils_1 = require("./timeSheet.utils");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createTimeSheetIntoDB = (file, payload, userData) => __awaiter(void 0, void 0, void 0, function* () {
    let userId = userData.id;
    if (userData.role === client_1.UserRole.ADMIN && payload.userId) {
        userId = payload.userId;
    }
    if (userData.role === client_1.UserRole.ADMIN && !payload.userId) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "User Id Required");
    }
    const user = yield (0, user_utils_1.isUserExists)(userId);
    if (file) {
        const uploadPhoto = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        payload.tripReceipt = (uploadPhoto === null || uploadPhoto === void 0 ? void 0 : uploadPhoto.secure_url) || null;
    }
    const durationAndPayment = (0, timeSheet_utils_1.DurationInNumberAndAmount)(payload);
    const tripData = Object.assign(Object.assign({}, payload), { name: user.name, date: new Date(payload.date), tripStartTime: new Date(payload.tripStartTime), tripEndTime: new Date(payload.tripEndTime), duration: (0, timeSheet_utils_1.getTimeDuration)(payload), durationInNumber: new library_1.Decimal(durationAndPayment.durationNumber), payment: new library_1.Decimal(durationAndPayment.tripAmount), hourlyRate: new library_1.Decimal(payload === null || payload === void 0 ? void 0 : payload.hourlyRate.toFixed(2)) || 0, userId: user.id });
    yield (0, timeSheet_utils_1.isTimeSheetAlreadyExists)(tripData);
    if (userData.role === client_1.UserRole.USER) {
        tripData.hourlyRate = new library_1.Decimal(0);
    }
    const result = yield prisma_1.default.time_Sheet.create({
        data: tripData,
    });
    return result;
});
const getAllTimeSheetsFromDB = (filtersField, options, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { page, limit, skip } = paginationHelpers_1.paginationHelpers.calculatePagination(options);
    const { searchTerm, startDate, endDate } = filtersField;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: (_a = ["name", "tripId"]) === null || _a === void 0 ? void 0 : _a.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    // Handle date filtering
    if (startDate && !endDate) {
        // Convert the provided date string to a Date object
        const targetDate = new Date(startDate);
        // Normalize the targetDate to midnight (00:00:00) for accurate comparison
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)); // Start of the day (00:00:00)
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)); // End of the day (23:59:59.999)
        // Add date range condition (from 00:00:00 to 23:59:59.999 of the target date)
        andConditions.push({
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        });
    }
    // Handle date range filtering when both startDate and endDate are provided
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Normalize both dates to start and end of the respective days
        const startOfDay = new Date(start.setHours(0, 0, 0, 0)); // Start of the startDate
        const endOfDay = new Date(end.setHours(23, 59, 59, 999)); // End of the endDate
        andConditions.push({
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        });
    }
    if (user.role === client_1.UserRole.USER) {
        andConditions.push({
            userId: user.id,
        });
    }
    const whereConditions = {
        AND: andConditions,
    };
    const select = Object.assign(Object.assign(Object.assign({ id: true, name: true, customer: true, tripId: true, date: true, tripStartTime: true, tripEndTime: true, tripReceipt: true, duration: true, hourlyRate: true, memo: true }, (user.role === client_1.UserRole.ADMIN && { durationInNumber: true })), (user.role === client_1.UserRole.ADMIN && { payment: true })), (user.role === client_1.UserRole.ADMIN && { userId: true }));
    const result = yield prisma_1.default.time_Sheet.findMany({
        where: whereConditions,
        skip,
        select,
        take: limit,
        orderBy: {
            date: options.sortOrder || "desc",
        },
    });
    const totalData = yield prisma_1.default.time_Sheet.count({
        where: whereConditions,
    });
    const totalPayment = yield prisma_1.default.time_Sheet.aggregate({
        _sum: {
            payment: true,
        },
        where: whereConditions, // Make sure whereConditions is defined correctly
    });
    return {
        meta: {
            total: totalData,
            page,
            limit,
        },
        data: { trips: result },
    };
});
const updateTimeSheetIntoDB = (id, file, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (file) {
        const uploadPhoto = yield fileUploader_1.fileUploader.uploadToCloudinary(file);
        payload.tripReceipt = (uploadPhoto === null || uploadPhoto === void 0 ? void 0 : uploadPhoto.secure_url) || null;
    }
    // Check if the trip exists
    const trip = yield (0, timeSheet_utils_1.isTimeSheetExists)(id);
    if (user.role === client_1.UserRole.USER && trip.userId !== user.id) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized to update this trip.");
    }
    const currentDate = new Date();
    const timePassed = currentDate.getTime() - new Date(trip.createdAt).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    // If more than 24 hours have passed, deny the update
    if (timePassed > oneDay && user.role !== client_1.UserRole.ADMIN) {
        // 24 hours in milliseconds
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You cannot update the trip after 24 hours.");
    }
    const durationAndPayment = (0, timeSheet_utils_1.DurationInNumberAndAmount)(payload);
    const updatePayload = {
        tripId: payload.tripId || trip.tripId,
        date: new Date(payload.date) || trip.date,
        tripStartTime: new Date(payload.tripStartTime) || trip.tripStartTime,
        tripEndTime: new Date(payload.tripEndTime) || trip.tripEndTime,
        tripReceipt: payload.tripReceipt || trip.tripReceipt,
        duration: (0, timeSheet_utils_1.getTimeDuration)(payload),
        durationInNumber: new library_1.Decimal(durationAndPayment.durationNumber),
        payment: new library_1.Decimal(durationAndPayment.tripAmount),
        hourlyRate: new library_1.Decimal(payload.hourlyRate.toFixed(2)) || trip.hourlyRate,
        memo: payload.memo || trip.memo,
        customer: payload.customer || trip.customer,
    };
    const { tripId, date, tripStartTime, tripEndTime } = payload;
    if (user.role === client_1.UserRole.USER) {
        updatePayload.hourlyRate = trip.hourlyRate;
    }
    // Step 1: Check if the tripId already exists (except for the current record being updated)
    if (tripId) {
        const tripIdExists = yield prisma_1.default.time_Sheet.findFirst({
            where: {
                tripId,
                NOT: {
                    id, // Exclude the current time sheet being updated
                },
            },
        });
        if (tripIdExists) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, "Duplicate tripId found. A time sheet with the same tripId already exists.");
        }
    }
    // Step 2: Check for overlapping times (if tripStartTime and tripEndTime are provided)
    if (tripStartTime || tripEndTime) {
        // If only one time is provided (either tripStartTime or tripEndTime), we don't need to check for overlap
        // But if both are provided, we will check for overlaps in existing records
        if (tripStartTime && tripEndTime) {
            const existingOverlappingTimes = yield prisma_1.default.time_Sheet.findFirst({
                where: {
                    date: new Date(date),
                    AND: [
                        {
                            tripStartTime: {
                                lt: updatePayload.tripEndTime, // Start time is before the new end time
                            },
                        },
                        {
                            tripEndTime: {
                                gt: updatePayload.tripStartTime, // End time is after the new start time
                            },
                        },
                    ],
                    NOT: {
                        tripId: trip.tripId, // Exclude the current time sheet being updated
                    },
                },
            });
            if (existingOverlappingTimes) {
                throw new AppError_1.default(http_status_1.default.CONFLICT, "The trip start and end times overlap with another time sheet for the same date.");
            }
        }
    }
    // Step 3: Proceed with the update if no conflicts
    const result = yield prisma_1.default.time_Sheet.update({
        where: {
            id,
        },
        data: updatePayload,
    });
    return result;
});
const deleteTimeSheetFromDB = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const trip = yield (0, timeSheet_utils_1.isTimeSheetExists)(id);
    if (user.role === client_1.UserRole.USER && trip.userId !== user.id) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized to delete this trip.");
    }
    const currentDate = new Date();
    const timePassed = currentDate.getTime() - new Date(trip.createdAt).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    // If more than 24 hours have passed, deny the update
    if (timePassed > oneDay && user.role !== client_1.UserRole.ADMIN) {
        // 24 hours in milliseconds
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You cannot delete the trip after 24 hours.");
    }
    const result = yield prisma_1.default.time_Sheet.delete({
        where: {
            id,
        },
    });
    if (trip.tripReceipt && (result === null || result === void 0 ? void 0 : result.id)) {
        const imageUrl = trip.tripReceipt;
        const publicId = (_b = (_a = imageUrl === null || imageUrl === void 0 ? void 0 : imageUrl.split("/")) === null || _a === void 0 ? void 0 : _a.pop()) === null || _b === void 0 ? void 0 : _b.split(".")[0];
        yield fileUploader_1.fileUploader.removeFromCloudinary(publicId);
    }
    return result;
});
const getMetaDataFromDB = (date, user) => __awaiter(void 0, void 0, void 0, function* () {
    let whereConditions = {};
    if (user.role === client_1.UserRole.USER) {
        whereConditions.userId = user.id;
    }
    if (date) {
        // Split the date string (MM/DD/YYYY) into month, day, and year
        const [day, month, year] = date.split("/").map(Number);
        // Create start and end date for the month
        const startOfMonth = new Date(Date.UTC(year, month - 1, 1)); // Month is 0-indexed
        const endOfMonth = new Date(Date.UTC(year, month, 0)); // End of the month (0th day of the next month)
        // Explicitly set the start and end times to 00:00:00 and 23:59:59 in UTC
        startOfMonth.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
        endOfMonth.setUTCHours(23, 59, 59, 999); // Set to end of the month, 23:59:59 UTC
        whereConditions.date = {
            gte: startOfMonth, // Greater than or equal to start of the month
            lte: endOfMonth, // Less than or equal to end of the month
        };
    }
    // Aggregate to get the sum of payment and durationInNumber, and count the total records
    const [totalTrip, totalPayment, totalWorkingHours] = yield Promise.all([
        prisma_1.default.time_Sheet.count({
            where: whereConditions,
        }),
        prisma_1.default.time_Sheet.aggregate({
            _sum: {
                payment: true,
            },
            where: whereConditions,
        }),
        prisma_1.default.time_Sheet.aggregate({
            _sum: {
                durationInNumber: true,
            },
            where: whereConditions,
        }),
    ]);
    const totalDurationFormatted = (0, timeSheet_utils_1.convertDecimalHoursToTime)(totalWorkingHours._sum.durationInNumber);
    const totalPaymentFormatted = (totalPayment._sum.payment || 0).toFixed(4);
    const totalEmployee = yield prisma_1.default.user.count({
        where: {
            role: client_1.UserRole.USER,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    return {
        totalTrip,
        totalDuration: totalDurationFormatted,
        totalPayment: totalPaymentFormatted,
        totalEmployee,
    };
});
exports.TimeSheetServices = {
    createTimeSheetIntoDB,
    getAllTimeSheetsFromDB,
    updateTimeSheetIntoDB,
    deleteTimeSheetFromDB,
    getMetaDataFromDB,
};

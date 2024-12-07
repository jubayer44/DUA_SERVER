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
exports.convertDecimalHoursToTime = exports.DurationInNumberAndAmount = exports.getTimeDuration = exports.isTimeSheetExists = exports.isTimeSheetAlreadyExists = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const isTimeSheetAlreadyExists = (tripData) => __awaiter(void 0, void 0, void 0, function* () {
    const tripIdExists = yield prisma_1.default.time_Sheet.findFirst({
        where: {
            tripId: tripData.tripId,
        },
    });
    if (tripIdExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Trip ID already exists in the database.");
    }
    const exists = yield prisma_1.default.time_Sheet.findFirst({
        where: {
            date: tripData.date, // Same date
            AND: [
                {
                    // New trip start time should not overlap with any existing trip
                    tripStartTime: {
                        lt: tripData.tripEndTime, // New trip start should be before the existing trip's end
                    },
                },
                {
                    // New trip end time should not overlap with any existing trip
                    tripEndTime: {
                        gt: tripData.tripStartTime, // New trip end should be after the existing trip's start
                    },
                },
            ],
        },
    });
    if (exists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "A trip already exists for this date and time.");
    }
    return false;
});
exports.isTimeSheetAlreadyExists = isTimeSheetAlreadyExists;
const isTimeSheetExists = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.time_Sheet.findUnique({
        where: {
            id,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "TimeSheet not found");
    }
    return result;
});
exports.isTimeSheetExists = isTimeSheetExists;
const getTimeDuration = (tripData) => {
    // Ensure tripStartTime and tripEndTime are valid Date objects
    let date1 = new Date(tripData.tripStartTime);
    let date2 = new Date(tripData.tripEndTime);
    // Check if the dates are valid (NaN means invalid Date)
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        throw new Error("Invalid date format");
    }
    // Set seconds and milliseconds to 0 for both dates
    date1.setSeconds(0);
    date1.setMilliseconds(0);
    date2.setSeconds(0);
    date2.setMilliseconds(0);
    // Calculate the time difference in milliseconds
    const timeDifference = date2.getTime() - date1.getTime();
    // Convert milliseconds to total minutes (without considering seconds)
    const totalMinutes = Math.floor(timeDifference / (1000 * 60)); // Total minutes
    // Calculate hours and remaining minutes
    const hours = Math.floor(totalMinutes / 60); // Hours
    const minutes = totalMinutes % 60; // Remaining minutes
    // Format the result
    let result;
    if (hours >= 1) {
        // If hours >= 1, show hours and minutes
        result = `${hours}:${minutes.toString().padStart(2, "0")}`;
    }
    else {
        // If less than 1 hour, show only minutes in "0:xx" format
        result = `0:${minutes.toString().padStart(2, "0")}`; // Showing minutes even if it's less than an hour
    }
    return result;
};
exports.getTimeDuration = getTimeDuration;
const DurationInNumberAndAmount = (tripData) => {
    const date1 = new Date(tripData.tripStartTime);
    const date2 = new Date(tripData.tripEndTime);
    // Set seconds and milliseconds to 0 for both dates
    date1.setSeconds(0);
    date1.setMilliseconds(0);
    date2.setSeconds(0);
    date2.setMilliseconds(0);
    // Calculate the time difference in milliseconds
    const timeDifference = date2.getTime() - date1.getTime();
    // Convert milliseconds to minutes
    const durationNumber = Number(timeDifference / (1000 * 60 * 60)).toFixed(5); // Total minutes
    const multiply = Number(durationNumber) * Number(tripData.hourlyRate);
    const tripAmount = multiply.toFixed(5);
    return { durationNumber, tripAmount };
};
exports.DurationInNumberAndAmount = DurationInNumberAndAmount;
const convertDecimalHoursToTime = (decimalHours) => {
    const hours = Math.floor(decimalHours); // Get the integer part (hours)
    const minutes = Math.round((decimalHours - hours) * 60); // Convert the decimal part to minutes
    // Ensure both hours and minutes are two digits
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
};
exports.convertDecimalHoursToTime = convertDecimalHoursToTime;

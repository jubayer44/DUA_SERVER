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
exports.TimeSheetControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const timeSheet_services_1 = require("./timeSheet.services");
const timeSheet_constant_1 = require("./timeSheet.constant");
const picFunction_1 = __importDefault(require("../../../shared/picFunction"));
const parsePaginationOptions_1 = require("../../../shared/parsePaginationOptions");
const constant_1 = require("../../constant");
const createTimeSheet = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield timeSheet_services_1.TimeSheetServices.createTimeSheetIntoDB(req.file || null, req.body.body, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Time Sheet created successfully",
        data: result,
    });
}));
const getAllTimeSheet = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filtersField = (0, picFunction_1.default)(req.query, timeSheet_constant_1.timeSheetPayloadKeys);
    const options = (0, parsePaginationOptions_1.parsePaginationOptions)((0, picFunction_1.default)(req === null || req === void 0 ? void 0 : req.query, constant_1.paginationOptions));
    const result = yield timeSheet_services_1.TimeSheetServices.getAllTimeSheetsFromDB(filtersField, options, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All Time Sheet retrieved successfully",
        data: result,
    });
}));
const updateTimeSheet = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield timeSheet_services_1.TimeSheetServices.updateTimeSheetIntoDB(req.params.id, req.file || null, req.body.body, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Time Sheet Updated Successfully",
        data: result,
    });
}));
const deleteTimeSheet = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield timeSheet_services_1.TimeSheetServices.deleteTimeSheetFromDB(req.params.id, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Time Sheet deleted Successfully",
        data: result,
    });
}));
const getMetaData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const date = req.query.date || "";
    const result = yield timeSheet_services_1.TimeSheetServices.getMetaDataFromDB(date, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Meta Data Retrieved Successfully",
        data: result,
    });
}));
exports.TimeSheetControllers = {
    createTimeSheet,
    getAllTimeSheet,
    updateTimeSheet,
    deleteTimeSheet,
    getMetaData,
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSheetRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const timeSheet_controllers_1 = require("./timeSheet.controllers");
const timeSheet_validations_1 = require("./timeSheet.validations");
const router = express_1.default.Router();
router.post("/create-time-sheet", (0, auth_1.default)(client_1.UserRole.USER, client_1.UserRole.ADMIN), fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    var _a;
    try {
        // Check if 'data' exists in the form-data
        if (!req.body.data) {
            return res.status(400).json({
                success: false,
                message: "'data' field is missing in the form-data",
            });
        }
        // Parse the 'data' field as JSON
        const parsedData = JSON.parse(req.body.data);
        // Validate the parsed data
        req.body = timeSheet_validations_1.TimeSheetValidationSchemas.createValidation.parse({
            body: parsedData,
        });
        // Proceed with the controller
        return timeSheet_controllers_1.TimeSheetControllers.createTimeSheet(req, res, next);
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: "Zod Validation Error",
            error: ((_a = error.errors) === null || _a === void 0 ? void 0 : _a.map((e) => e.message)) || error,
        });
    }
});
router.get("/time-sheet", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.USER), timeSheet_controllers_1.TimeSheetControllers.getAllTimeSheet);
router.put("/time-sheet/:id", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.USER), fileUploader_1.fileUploader.upload.single("file"), (req, res, next) => {
    var _a;
    try {
        // Check if 'data' exists in the form-data
        if (!req.body.data) {
            return res.status(400).json({
                success: false,
                message: "'data' field is missing in the form-data",
            });
        }
        // Parse the 'data' field as JSON
        const parsedData = JSON.parse(req.body.data);
        // Validate the parsed data
        req.body = timeSheet_validations_1.TimeSheetValidationSchemas.updateValidation.parse({
            body: parsedData,
        });
        // Proceed with the controller
        return timeSheet_controllers_1.TimeSheetControllers.updateTimeSheet(req, res, next);
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: "Zod Validation Error",
            error: ((_a = error.errors) === null || _a === void 0 ? void 0 : _a.map((e) => e.message)) || error,
        });
    }
});
router.delete("/time-sheet/:id", (0, auth_1.default)(client_1.UserRole.ADMIN, client_1.UserRole.USER), timeSheet_controllers_1.TimeSheetControllers.deleteTimeSheet);
router.get("/meta-data", (0, auth_1.default)(client_1.UserRole.ADMIN), timeSheet_controllers_1.TimeSheetControllers.getMetaData);
exports.TimeSheetRoutes = router;

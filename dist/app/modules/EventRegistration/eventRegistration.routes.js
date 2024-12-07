"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRegistrationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const eventRegistration_controllers_1 = require("./eventRegistration.controllers");
const validationRequest_1 = __importDefault(require("../../middlewares/validationRequest"));
const eventRegistration_validations_1 = require("./eventRegistration.validations");
const router = express_1.default.Router();
router.post("/create-event", (0, validationRequest_1.default)(eventRegistration_validations_1.EventRegistrationValidationSchemas.createValidation), eventRegistration_controllers_1.EventRegistrationControllers.createEvent);
router.get("/all-events", eventRegistration_controllers_1.EventRegistrationControllers.getAllEvents);
router.put("/update-event/:id", (0, validationRequest_1.default)(eventRegistration_validations_1.EventRegistrationValidationSchemas.eventUpdateValidation), eventRegistration_controllers_1.EventRegistrationControllers.updateEvent);
router.put("/update-payment/:id", (0, validationRequest_1.default)(eventRegistration_validations_1.EventRegistrationValidationSchemas.paymentUpdateValidation), eventRegistration_controllers_1.EventRegistrationControllers.updatePayment);
router.post("/create-checkout-session", eventRegistration_controllers_1.EventRegistrationControllers.createCheckoutSession);
router.get("/session-status", eventRegistration_controllers_1.EventRegistrationControllers.sessionStatus);
exports.EventRegistrationRoutes = router;

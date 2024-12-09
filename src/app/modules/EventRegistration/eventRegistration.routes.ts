import express from "express";
import validationRequest from "../../middlewares/validationRequest";
import { EventRegistrationControllers } from "./eventRegistration.controllers";
import { EventRegistrationValidationSchemas } from "./eventRegistration.validations";
const router = express.Router();

router.post(
  "/create-event",
  validationRequest(EventRegistrationValidationSchemas.createValidation),
  EventRegistrationControllers.createEvent
);

router.get("/all-events", EventRegistrationControllers.getAllEvents);

router.put(
  "/update-event/:id",
  validationRequest(EventRegistrationValidationSchemas.eventUpdateValidation),
  EventRegistrationControllers.updateEvent
);

router.put(
  "/update-payment/:id",
  validationRequest(EventRegistrationValidationSchemas.paymentUpdateValidation),
  EventRegistrationControllers.updatePayment
);

router.post(
  "/is-event-registered",
  EventRegistrationControllers.isEventRegistered
);

router.post(
  "/create-checkout-session",
  EventRegistrationControllers.createCheckoutSession
);

router.get("/session-status", EventRegistrationControllers.sessionStatus);

router.post("/generate-pdf", EventRegistrationControllers.generatePdf);

router.get(
  "/serve-pdf/:pdfFileName",
  EventRegistrationControllers.servePdfFile
);

export const EventRegistrationRoutes = router;

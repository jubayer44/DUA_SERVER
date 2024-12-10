import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validationRequest from "../../middlewares/validationRequest";
import { EventRegistrationControllers } from "./eventRegistration.controllers";
import { EventRegistrationValidationSchemas } from "./eventRegistration.validations";
const router = express.Router();

router.post(
  "/create-event",
  validationRequest(
    EventRegistrationValidationSchemas.createValidationWithZelle
  ),
  EventRegistrationControllers.createEvent
);

router.get("/all-events", EventRegistrationControllers.getAllEvents);

router.put(
  "/update-event/:id",
  auth(UserRole.ADMIN),
  validationRequest(EventRegistrationValidationSchemas.eventUpdateValidation),
  EventRegistrationControllers.updateEvent
);

router.put(
  "/update-payment/:id",
  auth(UserRole.ADMIN),
  validationRequest(EventRegistrationValidationSchemas.paymentUpdateValidation),
  EventRegistrationControllers.updatePayment
);

router.patch(
  "/update-zelle-payment-status/:id",
  auth(UserRole.ADMIN),
  validationRequest(EventRegistrationValidationSchemas.updateZelleStatus),
  EventRegistrationControllers.updateZellePaymentStatus
);

router.post(
  "/is-event-registered",
  EventRegistrationControllers.isEventRegistered
);

router.post(
  "/create-checkout-session",
  validationRequest(
    EventRegistrationValidationSchemas.createValidationWithCard
  ),
  EventRegistrationControllers.createCheckoutSession
);

router.get("/session-status", EventRegistrationControllers.sessionStatus);

// router.post("/generate-pdf", async (req, res) => {
//   await generateAndSavePdf(
//     "Royel Chalenger",
//     "jubayerahmed@gamail.com",
//     "0238348738343",
//     "VEGINNER",
//     "Sylhet, Bangladesh",
//     "Badminton Registration",
//     "120",
//     "CARD",
//     "UDS0001",
//     "10/12/2024"
//   );

//   res.send("PDF generated successfully");
// });

router.get(
  "/serve-pdf/:pdfFileName",
  EventRegistrationControllers.servePdfFile
);

router.delete(
  "/delete-event/:id",
  auth(UserRole.ADMIN),
  EventRegistrationControllers.deleteEvent
);

export const EventRegistrationRoutes = router;

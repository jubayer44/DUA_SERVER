import path from "path";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { EventRegistrationServices } from "./eventRegistration.services";
import { isEventAlreadyExists } from "./eventRegistration.utils";
import fs from "fs";
import { generateAndSavePdf } from "./pdfServices";

// Define the directory where the PDFs will be saved
const PDF_STORAGE_PATH = path.join(__dirname, "uploads");

if (!fs.existsSync(PDF_STORAGE_PATH)) {
  fs.mkdirSync(PDF_STORAGE_PATH); // Create the uploads folder if it doesn't exist
}

const createEvent = catchAsync(async (req, res) => {
  const result = await EventRegistrationServices.createEventIntoDb(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event created successfully",
    data: result,
  });
});

const getAllEvents = catchAsync(async (req, res) => {
  const result = await EventRegistrationServices.getAllEventsFromDb();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Events retrieved successfully",
    data: result,
  });
});

const updateEvent = catchAsync(async (req, res) => {
  const result = await EventRegistrationServices.updateEventIntoDb(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const updatePayment = catchAsync(async (req, res) => {
  const result = await EventRegistrationServices.updatePaymentIntoDb(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment updated successfully",
    data: result,
  });
});

const isEventRegistered = catchAsync(async (req, res) => {
  const { division, player1Email, player2Email } = req.body;
  const result = await isEventAlreadyExists(
    division,
    player1Email,
    player2Email
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event Available for Register",
    data: result,
  });
});

const createCheckoutSession = catchAsync(async (req, res) => {
  const result = await EventRegistrationServices.createCheckoutSession(
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Checkout session created successfully",
    data: result,
  });
});

const sessionStatus = catchAsync(async (req, res) => {
  const queryData = {
    sessionId: req.query.session_id,
    teamName: req.query.teamName,
    division: req.query.division,
    player1Name: req.query.player1Name,
    player2Name: req.query.player2Name,
    player1email: req.query.player1Email,
    player2email: req.query.player2Email,
    player1Phone: req.query.player1Phone,
    player2Phone: req.query.player2Phone,
    ...(req.query?.memo === "null" ? {} : { memo: req.query.memo }),
  };

  const result = await EventRegistrationServices.sessionStatus(queryData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Session status retrieved successfully",
    data: result,
  });
});

const generatePdf = catchAsync(async (req, res) => {
  // // After payment is successful, generate the modified PDF with payment details
  // const pdfLink = await generateAndSavePdf(
  //   "Jubayer Ahmed",
  //   "jubayer02@gmail.com",
  //   "0183849384378",
  //   "Beginner",
  //   "My Address",
  //   "Badminton Register",
  //   "$150",
  //   "Card"
  // );
  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   message: "PDF generated successfully",
  //   data: pdfLink,
  // });
});

// Serve the generated PDF files to the client
const servePdfFile = catchAsync(async (req, res) => {
  const pdfFileName = req.params.pdfFileName;
  const pdfFilePath = path.join(PDF_STORAGE_PATH, pdfFileName);

  if (fs.existsSync(pdfFilePath)) {
    res.sendFile(pdfFilePath);
  } else {
    res.status(404).json({ message: "PDF file not found" });
  }
});

export const EventRegistrationControllers = {
  createEvent,
  getAllEvents,
  updateEvent,
  updatePayment,
  isEventRegistered,
  createCheckoutSession,
  sessionStatus,
  generatePdf,
  servePdfFile,
};

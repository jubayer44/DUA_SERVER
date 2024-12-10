import fs from "fs";
import path from "path";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { EventRegistrationServices } from "./eventRegistration.services";
import { isEventAlreadyExists } from "./eventRegistration.utils";
import pickFunction from "../../../shared/picFunction";
import { parsePaginationOptions } from "../../../shared/parsePaginationOptions";
import { paginationOptions } from "../../constant";
import {
  eventQueryableField,
  updateEventData,
  updatePaymentData,
} from "./eventRegistration.constant";
import { Request, Response } from "express";

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
  const filtersField = pickFunction(req?.query, eventQueryableField);
  const options = parsePaginationOptions(
    pickFunction(req?.query, paginationOptions)
  );
  const result = await EventRegistrationServices.getAllEventsFromDb(
    filtersField,
    options
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Events retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateEvent = catchAsync(async (req, res) => {
  const filterData = pickFunction(req?.body, updateEventData);
  const result = await EventRegistrationServices.updateEventIntoDb(
    req.params.id,
    filterData
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const updatePayment = catchAsync(async (req, res) => {
  const filterData = pickFunction(req?.body, updatePaymentData);
  const result = await EventRegistrationServices.updatePaymentIntoDb(
    req.params.id,
    filterData
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment updated successfully",
    data: result,
  });
});

const updateZellePaymentStatus = catchAsync(async (req, res) => {
  const result = await EventRegistrationServices.updateZellePaymentStatus(
    req.body.paymentStatus,
    req.params.id
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment status updated successfully",
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
    eventName: req.query.eventName,
    ...(req.query?.player1Image === "null"
      ? {}
      : { memo: req.query.player1Image }),
    ...(req.query?.player2Image === "null"
      ? {}
      : { memo: req.query.player2Image }),
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

const deleteEvent = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await EventRegistrationServices.deleteEventFromDb(
      req.params.id,
      req?.user
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Event deleted successfully",
      data: result,
    });
  }
);

export const EventRegistrationControllers = {
  createEvent,
  getAllEvents,
  updateEvent,
  updatePayment,
  isEventRegistered,
  createCheckoutSession,
  sessionStatus,
  servePdfFile,
  updateZellePaymentStatus,
  deleteEvent,
};

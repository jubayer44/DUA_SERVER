import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { eventPaymentType } from "./eventRegistration.constant";
import prisma from "../../../shared/prisma";
import {
  generateTeamId,
  getEventAmount,
  isEventAlreadyExists,
  isEventExists,
  isEventOverlapped,
} from "./eventRegistration.utils";
import { PaymentStatus, RegistrationStatus } from "@prisma/client";
import Stripe from "stripe";
import config from "../../../config";

const stripe = new Stripe(
  "sk_test_51M65RLSIrCWJQylGZg0jIyfN7xrow2tH1dYroy8mnkxtzPZGQHtdDWU60WRM45WvmK418BHtdtQ06C8FSF6P5xcn00UYMw8vO8",
  {
    apiVersion: "2024-11-20.acacia",
  }
);

const createEventIntoDb = async (payload: any) => {
  const {
    teamName,
    division,
    player1Name,
    player2Name,
    sessionId,
    player1Phone,
    player2Phone,
    name,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    zip,
    memo,
    paymentType,
  } = payload;
  const player1Email = payload.player1Email || payload.player1email;
  const player2Email = payload.player1Email || payload.player2email;

  let paymentMethod: any;

  const amount = getEventAmount(division);

  if (amount === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Amount");
  }

  if (!paymentType) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment type is required");
  }

  const pType = Number(paymentType);

  await isEventAlreadyExists(division, player1Email, player2Email);

  const teamId = await generateTeamId();

  let result;

  if (pType === eventPaymentType.card) {
    paymentMethod = "CARD";

    result = await prisma.$transaction(async (tx) => {
      const event = await tx.event_Registration.create({
        data: {
          teamName,
          division,
          teamId,
          sessionId,
          player1Name: player1Name,
          player2Name: player2Name,
          player1Email: player1Email,
          player2Email: player2Email,
          player1Phone: player1Phone || null,
          player2Phone: player2Phone || null,
          paymentEmail: email,
          paymentStatus: PaymentStatus.PAID,
          registrationStatus: RegistrationStatus.COMPLETED,
        },
      });

      const payment = await tx.payment.create({
        data: {
          name,
          email,
          phone: phone || null,
          addressLine1: addressLine1 || null,
          addressLine2: addressLine2 || null,
          city: city || null,
          state: state || null,
          zip: zip || null,
          eventId: event.id,
          paymentStatus: PaymentStatus.PAID,
          amount,
          paymentMethod,
          memo,
        },
      });

      return { event, payment };
    });
  } else if (pType === eventPaymentType.zelle) {
    paymentMethod = "ZELLE";

    result = await prisma.$transaction(async (tx) => {
      const event = await tx.event_Registration.create({
        data: {
          teamName,
          division,
          teamId,
          sessionId,
          player1Name,
          player2Name,
          player1Email,
          player2Email,
          player1Phone: player1Phone || null,
          player2Phone: player2Phone || null,
          paymentEmail: email,
        },
      });

      const payment = await tx.payment.create({
        data: {
          name,
          email,
          eventId: event.id,
          amount,
          paymentMethod,
          memo,
        },
      });

      return { event, payment };
    });
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid payment type");
  }

  return result;
};

const getAllEventsFromDb = async () => {
  const result = await prisma.event_Registration.findMany({
    include: {
      payment: true,
    },
  });

  return result;
};

const updateEventIntoDb = async (id: string, payload: any) => {
  const existingEvent = await isEventExists(id);

  await isEventOverlapped(payload, id);

  let amount = Number(existingEvent.payment?.amount || 0);

  if (payload?.division !== existingEvent.division) {
    amount = getEventAmount(payload.division);
  }

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.event_Registration.update({
      where: {
        id,
      },
      data: payload,
    });

    const payment = await tx.payment.update({
      where: {
        eventId: id,
      },
      data: {
        amount: amount.toString(),
        paymentStatus: payload.paymentStatus,
      },
    });

    return { event, payment };
  });

  return result;
};

const updatePaymentIntoDb = async (id: string, payload: any) => {
  const {
    name,
    email,
    phone,
    address,
    city,
    state,
    zip,
    description,
    paymentStatus,
  } = payload;

  const { payment } = await isEventExists(id);

  const result = await prisma.$transaction(async (tx) => {
    const updatePayment = await tx.payment.update({
      where: {
        eventId: id,
      },
      data: {
        name: name || payment!.name,
        email: email || payment!.email,
        phone: phone || payment!.phone,
        addressLine1: address || payment!.addressLine1,
        addressLine2: address || payment!.addressLine2,
        city: city || payment!.city,
        state: state || payment!.state,
        zip: zip || payment!.zip,
        memo: description || payment!.memo,
        paymentStatus: paymentStatus || payment!.paymentStatus,
      },
    });

    const event = await tx.event_Registration.update({
      where: {
        id,
      },
      data: {
        paymentStatus,
      },
    });

    return { event, payment: updatePayment };
  });

  return result;
};

const createCheckoutSession = async (payload: any) => {
  const amount = getEventAmount(payload.division);

  if (amount === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Amount");
  }

  const event = await stripe.products.create({
    name: payload.event,
    description: `Division: ${payload.division}`,
  });

  const price = await stripe.prices.create({
    unit_amount: Number(amount * 100), // Amount in cents (5000 = $50.00)
    currency: "usd",
    product: event.id, // Use the product ID from the previous step
  });

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    payment_method_types: ["card"],
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: `${
      config.payment.return_url
    }/payment/payment-success?session_id={CHECKOUT_SESSION_ID}&teamName=${
      payload.teamName
    }&division=${payload.division}&player1Name=${
      payload.player1Name
    }&player2Name=${payload.player2Name}&player1Email=${
      payload.player1Email
    }&player2Email=${payload.player2Email}&player1Phone=${
      payload.player1Phone ? payload.player1Phone : null
    }&player2Phone=${payload.player2Phone ? payload.player2Phone : null}&memo=${
      payload.memo ? payload.memo : null
    }`,
  });

  return { clientSecret: session.client_secret };
};

const sessionStatus = async (queryData: any) => {
  const session = await stripe.checkout.sessions.retrieve(queryData.sessionId);

  const isSessionExists = await prisma.event_Registration.findFirst({
    where: {
      sessionId: queryData.sessionId,
    },
  });

  if (isSessionExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Session already exists");
  }

  if (session.payment_status === "paid") {
    const customerDetails = session.customer_details;
    queryData.email = customerDetails?.email;
    queryData.name = customerDetails?.name;
    queryData.city = customerDetails!.address?.city;
    queryData.addressLine1 = customerDetails?.address?.line1;
    queryData.addressLine2 = customerDetails?.address?.line2;
    queryData.phone = customerDetails?.phone;
    queryData.state = customerDetails?.address?.state;
    queryData.zip = customerDetails?.address?.postal_code;
    queryData.paymentType = 1;

    await createEventIntoDb(queryData);

    return {
      status: session.status,
    };
  } else {
    return {
      message: "something went wrong",
    };
  }
};

export const EventRegistrationServices = {
  createEventIntoDb,
  getAllEventsFromDb,
  updateEventIntoDb,
  updatePaymentIntoDb,
  createCheckoutSession,
  sessionStatus,
};

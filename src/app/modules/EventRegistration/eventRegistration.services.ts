import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import {
  eventPaymentType,
  eventSearchableField,
} from "./eventRegistration.constant";
import prisma from "../../../shared/prisma";
import {
  generateTeamId,
  getEventAmount,
  isEventAlreadyExists,
  isEventExists,
  isEventOverlapped,
} from "./eventRegistration.utils";
import {
  PaymentMethod,
  PaymentStatus,
  Prisma,
  RegistrationStatus,
} from "@prisma/client";
import Stripe from "stripe";
import config from "../../../config";
import { generateAndSavePdf } from "./pdfServices";
import sendEmail from "../Auth/sendEmail";
import { paymentSuccessTemplateAdmin } from "../../htmlTemplate/admin.paymentSuccessHtml";
import { paymentSuccessTemplate } from "../../htmlTemplate/user.paymentSuccessHtml";
import sendEmailWithAttach from "../Auth/sendEmailWithAttach";
import { TPagination } from "../../interfaces/common";
import { TEventParams } from "./eventRegistration.interface";
import { paginationHelpers } from "../../../helpers/paginationHelpers";
import { JwtPayload } from "jsonwebtoken";
import { isUserExists } from "../User/user.utils";

const MAX_RETRIES = 3; // Max retries for testing
const TIMEOUT = 40000; // Timeout for the transaction (40 seconds)
const MAX_WAIT = 15000; // Max wait for lock acquisition (15 seconds)

const stripe = new Stripe(
  "sk_test_51M65RLSIrCWJQylGZg0jIyfN7xrow2tH1dYroy8mnkxtzPZGQHtdDWU60WRM45WvmK418BHtdtQ06C8FSF6P5xcn00UYMw8vO8",
  {
    apiVersion: "2024-11-20.acacia",
  }
);

const today = new Date();
const day = String(today.getDate()).padStart(2, "0");
const month = String(today.getMonth() + 1).padStart(2, "0");
const year = today.getFullYear();
const date = `${month}/${day}/${year}`;

const getAllEventsFromDb = async (
  params: TEventParams,
  options: TPagination
) => {
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, paymentStatus, event, division } = params;

  const andConditions: Prisma.Event_RegistrationWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: eventSearchableField.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (paymentStatus) {
    andConditions.push({
      paymentStatus,
    });
  }

  if (event) {
    andConditions.push({
      eventName: event,
    });
  }

  if (division) {
    andConditions.push({
      division,
    });
  }

  const whereCondition: Prisma.Event_RegistrationWhereInput = {
    AND: andConditions,
  };

  const result = await prisma.event_Registration.findMany({
    where: whereCondition,
    include: {
      payment: true,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: options.sortOrder || "desc",
    },
  });

  const totalData = await prisma.event_Registration.count({
    where: whereCondition,
  });

  return {
    meta: {
      page,
      limit,
      total: totalData,
    },
    data: result,
  };
};

const updateEventIntoDb = async (id: string, payload: any) => {
  if (Object.keys(payload).length === 0) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, "Invalid Payload");
  }

  const existingEvent = await isEventExists(id);

  await isEventOverlapped(payload, id);

  let amount = Number(existingEvent.payment?.amount || 0);

  if (payload?.division && payload.division !== existingEvent.division) {
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
      },
    });

    return { event, payment };
  });

  return result;
};

const updatePaymentIntoDb = async (id: string, payload: any) => {
  const existingPayment = await prisma.payment.findUnique({
    where: {
      eventId: id,
    },
  });

  if (!existingPayment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found!");
  }

  const result = await prisma.payment.update({
    where: {
      id,
    },
    data: payload,
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
    }&player2Email=${payload.player2Email}&eventName=${
      payload.eventName
    }&player1Phone=${
      payload.player1Phone ? payload.player1Phone : null
    }&player2Phone=${
      payload.player2Phone ? payload.player2Phone : null
    }&player1Image=${
      payload.player1Image ? payload.player1Image : null
    }&player2Image=${payload.player2Image ? payload.player2Image : null}&memo=${
      payload.memo ? payload.memo : null
    }`,
  });

  return { clientSecret: session.client_secret };
};

const sessionStatus = async (queryData: any) => {
  const session = await stripe.checkout.sessions.retrieve(queryData.sessionId);
  // const session = {
  //   payment_status: "paid",
  //   status: "complete",
  //   customer_details: {
  //     name: "Jubayer Ahmed",
  //     email: "jubayerahmedshamim44@gmail.com",
  //     address: {
  //       line1: "123 Main St",
  //       line2: "Apt 4B",
  //       city: "Anytown",
  //       state: "CA",
  //       postal_code: "12345",
  //     },
  //     phone: "555-555-5555",
  //   },
  // };

  const isSessionExists = await prisma.event_Registration.findUnique({
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

const createEventIntoDb = async (payload: any) => {
  const {
    teamName,
    division,
    player1Name,
    player2Name,
    sessionId,
    player1Phone,
    player2Phone,
    player1Image,
    player2Image,
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
    eventName,
  } = payload;

  const player1Email = payload.player1Email || payload.player1email;
  const player2Email = payload.player2Email || payload.player2email;
  const pType = Number(paymentType);

  // Validate amount
  const amount = getEventAmount(division);
  if (amount === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid Amount");
  }

  // Validate payment type
  if (!paymentType) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment type is required");
  }

  // Check if event already exists
  await isEventAlreadyExists(division, player1Email, player2Email);

  // Generate team ID
  const teamId = await generateTeamId();

  let result: any;

  // Function to handle retries for both transaction types
  const handleTransactionWithRetry = async (
    transactionType: "card" | "zelle"
  ) => {
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        if (transactionType === "card") {
          result = await handleCardPaymentTransaction();
        } else if (transactionType === "zelle") {
          result = await handleZellePaymentTransaction();
        }

        // If transaction is successful, break the loop
        break;
      } catch (error: any) {
        if (error.code === "P2028" && retries < MAX_RETRIES) {
          // If timeout error occurs, retry the transaction
          console.log(
            `Transaction timed out. Retrying... (${retries + 1}/${MAX_RETRIES})`
          );
          retries++;
          continue;
        } else {
          // Log and throw error if it's not a timeout or retry limit reached
          console.error("Transaction failed:", error);
          throw error;
        }
      }
    }

    if (retries === MAX_RETRIES) {
      console.error("Transaction failed after maximum retries");
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Transaction failed after maximum retries"
      );
    }

    return result;
  };

  // Function to handle Card payment transaction
  const handleCardPaymentTransaction = async () => {
    let paymentMethod = PaymentMethod.CARD;

    return await prisma.$transaction(
      async (tx) => {
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
            player1Phone,
            player2Phone,
            player1Image: player1Image || null,
            player2Image: player2Image || null,
            paymentEmail: email,
            paymentStatus: PaymentStatus.PAID,
            registrationStatus: RegistrationStatus.COMPLETED,
            eventName,
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
            sendConfirmationMail: true,
            memo,
          },
        });

        const address = `Address: ${addressLine1}, ${city}, ${state}, ${zip}`;

        const pdf = await generateAndSavePdf(
          name,
          email,
          phone,
          division,
          address,
          eventName,
          amount.toString(),
          paymentMethod,
          teamId,
          date
        );

        // Send email to admin
        const paymentDetailsForAdmin = {
          name,
          email,
          amount: amount.toString(),
          date,
          teamName,
          teamId,
          status: "Success",
          paymentMethod,
          eventName,
        };

        const paymentDetailsForUser = {
          name,
          email,
          amount: amount.toString(),
          paymentMethod,
          date,
          teamName,
          teamId,
          eventName,
        };

        const adminHtml = paymentSuccessTemplateAdmin(paymentDetailsForAdmin);
        const userHtml = paymentSuccessTemplate(paymentDetailsForUser);

        // Asynchronously trigger email sending without waiting for them
        Promise.all([
          sendEmail(
            config.default_email as string,
            "New Payment with Card",
            adminHtml,
            teamId
          ),
          sendEmail(
            email as string,
            "Payment Success with Dulles United Association",
            userHtml,
            teamId
          ),
        ]);

        return { event, payment, receipt: pdf };
      },
      {
        maxWait: MAX_WAIT,
        timeout: TIMEOUT,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  };

  // Function to handle Zelle payment transaction
  const handleZellePaymentTransaction = async () => {
    let paymentMethod = PaymentMethod.ZELLE;

    return await prisma.$transaction(
      async (tx) => {
        const event = await tx.event_Registration.create({
          data: {
            teamName,
            division,
            teamId,
            player1Name,
            player2Name,
            player1Email,
            player2Email,
            player1Phone,
            player2Phone,
            player1Image: player1Image || null,
            player2Image: player2Image || null,
            paymentEmail: email,
            eventName,
          },
        });

        const payment = await tx.payment.create({
          data: {
            name,
            email,
            phone,
            eventId: event.id,
            amount,
            paymentMethod,
            memo,
          },
        });

        // Send email to admin
        const paymentDetails = {
          name,
          email,
          amount: amount.toString(),
          date,
          teamName,
          teamId,
          status: "Pending",
          paymentMethod,
          eventName,
        };

        const html = paymentSuccessTemplateAdmin(paymentDetails);

        // Trigger email sending asynchronously
        Promise.all([
          sendEmailWithAttach(
            config.default_email as string,
            html,
            "New Payment Request with Zelle"
          ),
        ]);

        return { event, payment };
      },
      {
        maxWait: MAX_WAIT,
        timeout: TIMEOUT,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  };

  // Determine payment type and call appropriate transaction handling function
  return await handleTransactionWithRetry(
    pType === eventPaymentType.card ? "card" : "zelle"
  );
};

const updateZellePaymentStatus = async (status: PaymentStatus, id: string) => {
  const existing = await isEventExists(id);

  const eventPayment = existing.payment!;

  if (existing && eventPayment?.paymentMethod === PaymentMethod.CARD) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You Can't Update Card Payment Status"
    );
  }

  if (eventPayment.paymentStatus === status) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Payment Status Already ${eventPayment.paymentStatus}`
    );
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const event = await tx.event_Registration.update({
        where: {
          id,
        },
        data: {
          paymentStatus: status,
        },
      });
      const payment = await tx.payment.update({
        where: {
          id: eventPayment!.id,
        },
        data: {
          paymentStatus: status,
          sendConfirmationMail: true,
        },
      });
      return { event, payment };
    },
    {
      maxWait: MAX_WAIT,
      timeout: TIMEOUT,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  if (
    eventPayment.sendConfirmationMail === false &&
    eventPayment.paymentStatus === "UNPAID"
  ) {
    const address = `Address: N/A`;

    await generateAndSavePdf(
      eventPayment.name,
      eventPayment.email,
      eventPayment.phone,
      existing.division,
      address,
      existing.eventName,
      eventPayment.amount!.toString(),
      eventPayment.paymentMethod,
      existing.teamId,
      date
    );

    // Send email to admin
    const paymentDetailsForAdmin = {
      name: eventPayment.name,
      email: eventPayment.email,
      amount: eventPayment.amount!.toString(),
      date,
      teamName: existing.teamName,
      teamId: existing.teamId,
      status: "Success",
      paymentMethod: eventPayment.paymentMethod,
      eventName: existing.eventName,
    };

    const paymentDetailsForUser = {
      name: eventPayment.name,
      email: eventPayment.email,
      amount: eventPayment.amount!.toString(),
      paymentMethod: eventPayment.paymentMethod,
      date,
      teamName: existing.teamName,
      teamId: existing.teamId,
      eventName: existing.eventName,
    };

    const adminHtml = paymentSuccessTemplateAdmin(paymentDetailsForAdmin);
    const userHtml = paymentSuccessTemplate(paymentDetailsForUser);

    Promise.all([
      sendEmail(
        config.default_email as string,
        "Event Registration - Dulles United Association",
        adminHtml,
        existing.teamId
      ),
      sendEmail(
        eventPayment.email as string,
        "Event Registration - Dulles United Association",
        userHtml,
        existing.teamId
      ),
    ]).catch((error) => {
      console.error("Email sending failed:", error);
    });
  }

  return result;
};

const deleteEventFromDb = async (id: string, user: JwtPayload) => {
  await isEventExists(id);
  await isUserExists(user.id);

  const result = await prisma.event_Registration.findUnique({
    where: {
      id,
    },
  });

  return result;
};

export const EventRegistrationServices = {
  createEventIntoDb,
  getAllEventsFromDb,
  updateEventIntoDb,
  updatePaymentIntoDb,
  createCheckoutSession,
  sessionStatus,
  updateZellePaymentStatus,
  deleteEventFromDb,
};

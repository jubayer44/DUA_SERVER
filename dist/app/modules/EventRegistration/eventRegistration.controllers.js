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
exports.EventRegistrationControllers = void 0;
const stripe_1 = __importDefault(require("stripe"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const eventRegistration_services_1 = require("./eventRegistration.services");
const stripe = new stripe_1.default("sk_test_51M65RLSIrCWJQylGZg0jIyfN7xrow2tH1dYroy8mnkxtzPZGQHtdDWU60WRM45WvmK418BHtdtQ06C8FSF6P5xcn00UYMw8vO8", {
    apiVersion: "2024-11-20.acacia",
});
const createEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield eventRegistration_services_1.EventRegistrationServices.createEventIntoDb(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Event created successfully",
        data: result,
    });
}));
const getAllEvents = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield eventRegistration_services_1.EventRegistrationServices.getAllEventsFromDb();
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All Events retrieved successfully",
        data: result,
    });
}));
const updateEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield eventRegistration_services_1.EventRegistrationServices.updateEventIntoDb(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Event updated successfully",
        data: result,
    });
}));
const updatePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield eventRegistration_services_1.EventRegistrationServices.updatePaymentIntoDb(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Payment updated successfully",
        data: result,
    });
}));
// const createCheckoutSession = catchAsync(async (req, res) => {
//   try {
//     // const { event, division, amount } = req.body; // Receive event, division, and amount
//     const event = "Badminton Registration";
//     const division = "Beginner";
//     const amount = 120;
//     // Create a new checkout session
//     const session = await stripe.checkout.sessions.create({
//       ui_mode: "embedded",
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: event, // Event name
//               description: division, // Division (e.g., Beginner)
//             },
//             unit_amount: amount * 100, // Amount in cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       // redirect_on_completion: "never",
//       // success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       // cancel_url: `http://localhost:5173/payment-cancel`,
//       metadata: {
//         event_name: event,
//         division: division,
//       },
//     });
//     // Send back the session ID to frontend
//     res.status(200).send({ sessionId: session.client_secret });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error creating Stripe Checkout session");
//   }
// });
const createCheckoutSession = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield stripe.products.create({
        name: "Badminton Registration",
        description: "Badminton Event",
    });
    const price = yield stripe.prices.create({
        unit_amount: 120 * 100, // Amount in cents (5000 = $50.00)
        currency: "usd",
        product: product.id, // Use the product ID from the previous step
    });
    const session = yield stripe.checkout.sessions.create({
        ui_mode: "embedded",
        payment_method_types: ["card"],
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                // price: '{{PRICE_ID}}',
                price: price.id,
                quantity: 1,
            },
        ],
        mode: "payment",
        // return_url: `http://localhost:5173/return?session_id={CHECKOUT_SESSION_ID}`,
        return_url: `https://newsite.ajkerkhobor.news/api/payment/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    });
    res.send({ clientSecret: session.client_secret });
}));
const sessionStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield stripe.checkout.sessions.retrieve(req.query.session_id);
    if (session.payment_status === "paid") {
        console.log(JSON.stringify(session.customer_details));
        res.send({
            status: session.status,
            customer_email: session.customer_details.email,
            customer_details: JSON.stringify(session.customer_details),
        });
    }
    else {
        res.send({
            message: "something went wrong",
        });
    }
}));
exports.EventRegistrationControllers = {
    createEvent,
    getAllEvents,
    updateEvent,
    updatePayment,
    createCheckoutSession,
    sessionStatus,
};

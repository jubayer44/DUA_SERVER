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
exports.EventRegistrationServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const eventRegistration_constant_1 = require("./eventRegistration.constant");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const eventRegistration_utils_1 = require("./eventRegistration.utils");
const client_1 = require("@prisma/client");
const createEventIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamName, division, player1Name, player2Name, player1Email, player2Email, player1Phone, player2Phone, memo, name, email, phone, address, city, state, zip, description, paymentType, } = payload;
    let paymentMethod;
    const amount = (0, eventRegistration_utils_1.getEventAmount)(division);
    if (amount === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid Amount");
    }
    if (!paymentType) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Payment type is required");
    }
    const pType = Number(paymentType);
    yield (0, eventRegistration_utils_1.isEventAlreadyExists)(payload);
    const teamId = yield (0, eventRegistration_utils_1.generateTeamId)();
    let result;
    if (pType === eventRegistration_constant_1.eventPaymentType.card) {
        paymentMethod = "CARD";
        result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const event = yield tx.event_Registration.create({
                data: {
                    teamName,
                    division,
                    teamId,
                    player1Name,
                    player2Name,
                    player1Email,
                    player2Email,
                    player1Phone: player1Phone || null,
                    player2Phone: player2Phone || null,
                    memo: memo || null,
                    paymentStatus: client_1.PaymentStatus.PAID,
                    registrationStatus: client_1.RegistrationStatus.COMPLETED,
                },
            });
            const payment = yield tx.payment.create({
                data: {
                    name,
                    email,
                    phone: phone || null,
                    address: address || null,
                    city: city || null,
                    state: state || null,
                    zip: zip || null,
                    paymentId: null,
                    teamId: event.teamId,
                    eventId: event.id,
                    paymentStatus: client_1.PaymentStatus.PAID,
                    amount,
                    paymentMethod,
                },
            });
            return { event, payment };
        }));
    }
    else if (pType === eventRegistration_constant_1.eventPaymentType.zelle) {
        paymentMethod = "ZELLE";
        result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const event = yield tx.event_Registration.create({
                data: {
                    teamName,
                    division,
                    teamId,
                    player1Name,
                    player2Name,
                    player1Email,
                    player2Email,
                    player1Phone: player1Phone || null,
                    player2Phone: player2Phone || null,
                    memo: memo || null,
                },
            });
            const payment = yield tx.payment.create({
                data: {
                    name,
                    email,
                    description,
                    teamId: event.teamId,
                    eventId: event.id,
                    amount,
                    paymentMethod,
                },
            });
            return { event, payment };
        }));
    }
    else {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid payment type");
    }
    return result;
});
const getAllEventsFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.event_Registration.findMany({
        include: {
            payment: true,
        },
    });
    return result;
});
const updateEventIntoDb = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existingEvent = yield (0, eventRegistration_utils_1.isEventExists)(id);
    yield (0, eventRegistration_utils_1.isEventOverlapped)(payload, id);
    let amount = Number(((_a = existingEvent.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0);
    if ((payload === null || payload === void 0 ? void 0 : payload.division) !== existingEvent.division) {
        amount = (0, eventRegistration_utils_1.getEventAmount)(payload.division);
    }
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const event = yield tx.event_Registration.update({
            where: {
                id,
            },
            data: payload,
        });
        const payment = yield tx.payment.update({
            where: {
                eventId: id,
            },
            data: {
                amount: amount.toString(),
                paymentStatus: payload.paymentStatus,
            },
        });
        return { event, payment };
    }));
    return result;
});
const updatePaymentIntoDb = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, address, city, state, zip, description, paymentStatus, } = payload;
    const { payment } = yield (0, eventRegistration_utils_1.isEventExists)(id);
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatePayment = yield tx.payment.update({
            where: {
                eventId: id,
            },
            data: {
                name: name || payment.name,
                email: email || payment.email,
                phone: phone || payment.phone,
                address: address || payment.address,
                city: city || payment.city,
                state: state || payment.state,
                zip: zip || payment.zip,
                description: description || payment.description,
                paymentStatus: paymentStatus || payment.paymentStatus,
            },
        });
        const event = yield tx.event_Registration.update({
            where: {
                id,
            },
            data: {
                paymentStatus,
            },
        });
        return { event, payment: updatePayment };
    }));
    return result;
});
exports.EventRegistrationServices = {
    createEventIntoDb,
    getAllEventsFromDb,
    updateEventIntoDb,
    updatePaymentIntoDb,
};

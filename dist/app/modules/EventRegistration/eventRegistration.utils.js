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
exports.isEventOverlapped = exports.isEventAlreadyExists = exports.isEventExists = exports.generateTeamId = exports.getEventAmount = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const getEventAmount = (event) => {
    if (!event)
        return 0;
    if (event === client_1.Division.BEGINNER) {
        return 120;
    }
    else if (event === client_1.Division.INTERMEDIATE) {
        return 150;
    }
    else if (event === client_1.Division.OPEN) {
        return 200;
    }
    return 0;
};
exports.getEventAmount = getEventAmount;
// Function to generate the next Team ID
const generateTeamId = () => __awaiter(void 0, void 0, void 0, function* () {
    let initialId = 1;
    const getBiggestTeamId = yield prisma_1.default.event_Registration.findMany({
        select: {
            teamId: true,
        },
    });
    if (getBiggestTeamId.length > 0) {
        const biggestId = getBiggestTeamId.map((team) => {
            const splitWIthNumber = team.teamId.split("S")[1];
            return Number(splitWIthNumber);
        });
        initialId = Math.max(...biggestId) + 1;
    }
    const teamPrefix = "UDS";
    const nextId = (initialId++).toString().padStart(4, "0"); // Pad the number to 4 digits
    return `${teamPrefix}${nextId}`;
});
exports.generateTeamId = generateTeamId;
const isEventExists = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield prisma_1.default.event_Registration.findUnique({
        where: {
            id: eventId,
        },
        include: {
            payment: true,
        },
    });
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Event not found");
    }
    return event;
});
exports.isEventExists = isEventExists;
const isEventAlreadyExists = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingRegistration = yield prisma_1.default.event_Registration.findFirst({
        where: {
            division: payload.division,
            OR: [
                { player1Email: payload.player1Email },
                { player2Email: payload.player1Email },
                { player1Email: payload.player2Email },
                { player2Email: payload.player2Email },
            ],
        },
    });
    if (existingRegistration) {
        // Check if player1Email or player2Email already exists in the division
        if (existingRegistration.player1Email === payload.player1Email ||
            existingRegistration.player2Email === payload.player1Email) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, `${payload.player1Email} is already registered for ${payload.division} division`);
        }
        if (existingRegistration.player1Email === payload.player2Email ||
            existingRegistration.player2Email === payload.player2Email) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, `${payload.player2Email} is already registered for ${payload.division} division`);
        }
    }
    return false;
});
exports.isEventAlreadyExists = isEventAlreadyExists;
const isEventOverlapped = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingRegistration = yield prisma_1.default.event_Registration.findFirst({
        where: {
            division: payload.division,
            OR: [
                { player1Email: payload.player1Email },
                { player2Email: payload.player1Email },
                { player1Email: payload.player2Email },
                { player2Email: payload.player2Email },
            ],
            NOT: {
                id,
            },
        },
    });
    if (existingRegistration) {
        // Check if player1Email or player2Email already exists in the division
        if (existingRegistration.player1Email === payload.player1Email ||
            existingRegistration.player2Email === payload.player1Email) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, `${payload.player1Email} is already registered for ${payload.division} division`);
        }
        if (existingRegistration.player1Email === payload.player2Email ||
            existingRegistration.player2Email === payload.player2Email) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, `${payload.player2Email} is already registered for ${payload.division} division`);
        }
    }
    return false;
});
exports.isEventOverlapped = isEventOverlapped;

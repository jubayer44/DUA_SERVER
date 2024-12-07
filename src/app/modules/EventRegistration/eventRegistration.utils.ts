import { Division } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";

export const getEventAmount = (event: string) => {
  if (!event) return 0;

  if (event === Division.BEGINNER) {
    return 120;
  } else if (event === Division.INTERMEDIATE) {
    return 150;
  } else if (event === Division.OPEN) {
    return 200;
  }
  return 0;
};

// Function to generate the next Team ID
export const generateTeamId = async () => {
  let initialId = 1;

  const getBiggestTeamId = await prisma.event_Registration.findMany({
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
};

export const isEventExists = async (eventId: string) => {
  const event = await prisma.event_Registration.findUnique({
    where: {
      id: eventId,
    },
    include: {
      payment: true,
    },
  });
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  return event;
};

export const isEventAlreadyExists = async (
  division: any,
  player1Email: string,
  player2Email: string
) => {
  const existingRegistration = await prisma.event_Registration.findFirst({
    where: {
      division,
      OR: [
        { player1Email: player1Email },
        { player2Email: player1Email },
        { player1Email: player2Email },
        { player2Email: player2Email },
      ],
    },
  });
  if (existingRegistration) {
    // Check if player1Email or player2Email already exists in the division
    if (
      existingRegistration.player1Email === player1Email ||
      existingRegistration.player2Email === player1Email
    ) {
      throw new AppError(
        httpStatus.CONFLICT,
        `${player1Email} is already registered for ${division} division`
      );
    }

    if (
      existingRegistration.player1Email === player2Email ||
      existingRegistration.player2Email === player2Email
    ) {
      throw new AppError(
        httpStatus.CONFLICT,
        `${player2Email} is already registered for ${division} division`
      );
    }
  }

  return false;
};

export const isEventOverlapped = async (payload: any, id: string) => {
  const existingRegistration = await prisma.event_Registration.findFirst({
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
    if (
      existingRegistration.player1Email === payload.player1Email ||
      existingRegistration.player2Email === payload.player1Email
    ) {
      throw new AppError(
        httpStatus.CONFLICT,
        `${payload.player1Email} is already registered for ${payload.division} division`
      );
    }

    if (
      existingRegistration.player1Email === payload.player2Email ||
      existingRegistration.player2Email === payload.player2Email
    ) {
      throw new AppError(
        httpStatus.CONFLICT,
        `${payload.player2Email} is already registered for ${payload.division} division`
      );
    }
  }

  return false;
};

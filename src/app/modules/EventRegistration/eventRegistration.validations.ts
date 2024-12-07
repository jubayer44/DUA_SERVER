import { z } from "zod";

const createValidation = z.object({
  body: z.object({
    teamName: z.string({
      required_error: "Team Name is required",
      invalid_type_error: "Team Name must be a string",
    }),
    division: z.enum(["BEGINNER", "INTERMEDIATE", "OPEN"], {
      required_error: "Division is required",
      invalid_type_error: "Division must be BEGINNER or INTERMEDIATE or OPEN",
    }),
    player1Name: z.string({
      required_error: "Player 1 Name is required",
      invalid_type_error: "Player 1 Name must be a string",
    }),
    player2Name: z.string({
      required_error: "Player 2 Name is required",
      invalid_type_error: "Player 2 Name must be a string",
    }),
    player1Email: z.string({
      required_error: "Player 1 Email is required",
      invalid_type_error: "Player 1 Email must be a string",
    }),
    player2Email: z.string({
      required_error: "Player 2 Email is required",
      invalid_type_error: "Player 2 Email must be a string",
    }),
    player1Phone: z
      .string({
        invalid_type_error: "Player 1 Phone must be a string",
      })
      .optional(),
    player2Phone: z
      .string({
        invalid_type_error: "Player 2 Phone must be a string",
      })
      .optional(),
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    }),
    email: z.string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    }),
    phone: z.string({
      required_error: "Phone is required",
      invalid_type_error: "Phone must be a string",
    }),
    memo: z
      .string({
        invalid_type_error: "Memo must be a string",
      })
      .optional(),
    paymentType: z.enum(["1", "2"], {
      required_error: "Payment Type is required",
      invalid_type_error: "Payment Type must be 1 or 2",
    }),
  }),
});

const createValidationWithCard = z.object({
  body: z.object({
    teamName: z.string({
      required_error: "Team Name is required",
      invalid_type_error: "Team Name must be a string",
    }),
    division: z.enum(["BEGINNER", "INTERMEDIATE", "OPEN"], {
      required_error: "Division is required",
      invalid_type_error: "Division must be BEGINNER or INTERMEDIATE or OPEN",
    }),
    player1Name: z.string({
      required_error: "Player 1 Name is required",
      invalid_type_error: "Player 1 Name must be a string",
    }),
    player2Name: z.string({
      required_error: "Player 2 Name is required",
      invalid_type_error: "Player 2 Name must be a string",
    }),
    player1Email: z.string({
      required_error: "Player 1 Email is required",
      invalid_type_error: "Player 1 Email must be a string",
    }),
    player2Email: z.string({
      required_error: "Player 2 Email is required",
      invalid_type_error: "Player 2 Email must be a string",
    }),
    player1Phone: z.string({
      invalid_type_error: "Player 1 Phone must be a string",
    }),
    player2Phone: z.string({
      invalid_type_error: "Player 2 Phone must be a string",
    }),
  }),
});

const eventUpdateValidation = z.object({
  body: z.object({
    teamName: z
      .string({
        invalid_type_error: "Team Name must be a string",
      })
      .optional(),
    division: z
      .enum(["BEGINNER", "INTERMEDIATE", "OPEN"], {
        invalid_type_error: "Division must be BEGINNER or INTERMEDIATE or OPEN",
      })
      .optional(),
    player1Name: z
      .string({
        invalid_type_error: "Player 1 Name must be a string",
      })
      .optional(),
    player2Name: z
      .string({
        invalid_type_error: "Player 2 Name must be a string",
      })
      .optional(),
    player1Email: z
      .string({
        invalid_type_error: "Player 1 Email must be a string",
      })
      .optional(),
    player2Email: z
      .string({
        invalid_type_error: "Player 2 Email must be a string",
      })
      .optional(),
    player1Phone: z
      .string({
        invalid_type_error: "Player 1 Phone must be a string",
      })
      .optional(),
    player2Phone: z
      .string({
        invalid_type_error: "Player 2 Phone must be a string",
      })
      .optional(),
    memo: z
      .string({
        invalid_type_error: "Memo must be a string",
      })
      .optional(),
    paymentStatus: z
      .enum(["PAID", "UNPAID"], {
        invalid_type_error: "Payment Status must be PAID or UNPAID",
      })
      .optional(),
    registrationStatus: z
      .enum(["COMPLETED", "PENDING", "CANCELLED"], {
        invalid_type_error:
          "Registration Status must be COMPLETED or PENDING or CANCELLED",
      })
      .optional(),
  }),
});

const paymentUpdateValidation = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: "Name must be a string",
      })
      .optional(),
    email: z
      .string({
        invalid_type_error: "Email must be a string",
      })
      .optional(),
    phone: z
      .string({
        invalid_type_error: "Phone must be a string",
      })
      .optional(),
    address: z
      .string({
        invalid_type_error: "Address must be a string",
      })
      .optional(),
    city: z
      .string({
        invalid_type_error: "City must be a string",
      })
      .optional(),
    state: z
      .string({
        invalid_type_error: "State must be a string",
      })
      .optional(),
    zip: z
      .string({
        invalid_type_error: "Zip must be a string",
      })
      .optional(),
    description: z
      .string({
        invalid_type_error: "Description must be a string",
      })
      .optional(),
    paymentStatus: z
      .string({
        invalid_type_error: "paymentStatus must be a string",
      })
      .optional(),
  }),
});

export const EventRegistrationValidationSchemas = {
  createValidation,
  createValidationWithCard,
  eventUpdateValidation,
  paymentUpdateValidation,
};

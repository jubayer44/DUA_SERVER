import { Division, PaymentStatus } from "@prisma/client";

export type TEventParams = {
  searchTerm?: string;
  paymentStatus?: PaymentStatus;
  event?: string;
  division?: Division;
};

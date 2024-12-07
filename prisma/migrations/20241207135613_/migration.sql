/*
  Warnings:

  - Added the required column `sessionId` to the `event_registrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_registrations" ADD COLUMN     "sessionId" TEXT NOT NULL;

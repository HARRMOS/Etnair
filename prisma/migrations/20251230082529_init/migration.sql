/*
  Warnings:

  - You are about to drop the column `arrivalDate` on the `Reservations` table. All the data in the column will be lost.
  - You are about to drop the column `departureDate` on the `Reservations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Annonces" ADD COLUMN     "Motif" TEXT NOT NULL DEFAULT 'Auncun';

-- AlterTable
ALTER TABLE "Reservations" DROP COLUMN "arrivalDate",
DROP COLUMN "departureDate",
ADD COLUMN     "ReservationDates" TIMESTAMP(3)[];

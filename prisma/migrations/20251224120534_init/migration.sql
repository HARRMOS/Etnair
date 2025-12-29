/*
  Warnings:

  - Added the required column `FirstDate` to the `Annonces` table without a default value. This is not possible if the table is not empty.
  - Added the required column `LastDate` to the `Annonces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Annonces" ADD COLUMN     "FirstDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "LastDate" TIMESTAMP(3) NOT NULL;

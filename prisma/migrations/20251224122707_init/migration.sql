/*
  Warnings:

  - You are about to drop the column `FirstDate` on the `Annonces` table. All the data in the column will be lost.
  - You are about to drop the column `LastDate` on the `Annonces` table. All the data in the column will be lost.
  - Added the required column `firstDate` to the `Annonces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Annonces" DROP COLUMN "FirstDate",
DROP COLUMN "LastDate",
ADD COLUMN     "dates" TIMESTAMP(3)[],
ADD COLUMN     "firstDate" TIMESTAMP(3) NOT NULL;

/*
  Warnings:

  - The `Covers` column on the `Annonces` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Annonces" DROP COLUMN "Covers",
ADD COLUMN     "Covers" TEXT[];

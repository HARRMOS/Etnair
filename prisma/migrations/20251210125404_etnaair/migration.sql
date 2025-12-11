/*
  Warnings:

  - You are about to drop the column `type` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "birthdate" DROP NOT NULL;

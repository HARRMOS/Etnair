/*
  Warnings:

  - Added the required column `birthdate` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "birthdate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isadmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "CompanyName" TEXT NOT NULL,
    "SiretNumber" TEXT NOT NULL,
    "CompanyPhone" TEXT NOT NULL,
    "CompanyEmail" TEXT NOT NULL,
    "LeaderName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_SiretNumber_key" ON "Company"("SiretNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Company_CompanyEmail_key" ON "Company"("CompanyEmail");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

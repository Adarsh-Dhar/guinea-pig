/*
  Warnings:

  - A unique constraint covering the columns `[ipId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "ipId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_ipId_key" ON "Project"("ipId");

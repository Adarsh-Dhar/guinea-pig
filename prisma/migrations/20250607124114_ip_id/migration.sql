/*
  Warnings:

  - You are about to drop the column `projectId` on the `RoyaltyToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ipId]` on the table `RoyaltyToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ipId` to the `RoyaltyToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoyaltyToken" DROP CONSTRAINT "RoyaltyToken_projectId_fkey";

-- DropIndex
DROP INDEX "RoyaltyToken_projectId_key";

-- AlterTable
ALTER TABLE "RoyaltyToken" DROP COLUMN "projectId",
ADD COLUMN     "ipId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyToken_ipId_key" ON "RoyaltyToken"("ipId");

-- AddForeignKey
ALTER TABLE "RoyaltyToken" ADD CONSTRAINT "RoyaltyToken_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "Project"("ipId") ON DELETE RESTRICT ON UPDATE CASCADE;

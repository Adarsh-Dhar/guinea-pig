/*
  Warnings:

  - Changed the type of `amount` on the `Investment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tokens` on the `Investment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `totalFunding` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `initialPrice` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currentFunding` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tokenPrice` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(18,4) NOT NULL,
DROP COLUMN "tokens",
ADD COLUMN     "tokens" DECIMAL(18,4) NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "totalFunding",
ADD COLUMN     "totalFunding" DECIMAL(18,4) NOT NULL,
DROP COLUMN "initialPrice",
ADD COLUMN     "initialPrice" DECIMAL(18,4) NOT NULL,
DROP COLUMN "currentFunding",
ADD COLUMN     "currentFunding" DECIMAL(18,4) NOT NULL,
DROP COLUMN "tokenPrice",
ADD COLUMN     "tokenPrice" DECIMAL(18,4) NOT NULL;

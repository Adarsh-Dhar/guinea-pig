-- CreateTable
CREATE TABLE "RoyaltyToken" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoyaltyToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoyaltyToken_projectId_key" ON "RoyaltyToken"("projectId");

-- AddForeignKey
ALTER TABLE "RoyaltyToken" ADD CONSTRAINT "RoyaltyToken_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

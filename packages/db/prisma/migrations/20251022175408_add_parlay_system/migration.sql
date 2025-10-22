-- CreateEnum
CREATE TYPE "BetMode" AS ENUM ('SIMPLE', 'PARLAY');

-- AlterTable
ALTER TABLE "bets" ADD COLUMN     "betMode" "BetMode" NOT NULL DEFAULT 'SIMPLE',
ADD COLUMN     "isParent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "multiplier" DECIMAL(10,2),
ADD COLUMN     "parentBetId" INTEGER,
ALTER COLUMN "gameId" DROP NOT NULL,
ALTER COLUMN "betType" DROP NOT NULL;

-- CreateTable
CREATE TABLE "bet_type_configs" (
    "id" SERIAL NOT NULL,
    "betType" "BetType" NOT NULL,
    "baseMultiplier" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bet_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bet_type_configs_betType_key" ON "bet_type_configs"("betType");

-- CreateIndex
CREATE INDEX "bets_parentBetId_idx" ON "bets"("parentBetId");

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_parentBetId_fkey" FOREIGN KEY ("parentBetId") REFERENCES "bets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

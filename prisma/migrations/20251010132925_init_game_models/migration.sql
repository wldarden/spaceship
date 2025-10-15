-- CreateTable
CREATE TABLE "public"."Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentMission" INTEGER NOT NULL DEFAULT 1,
    "credits" INTEGER NOT NULL DEFAULT 1000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mission" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "missionNumber" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shipType" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,
    "firepower" INTEGER NOT NULL,
    "health" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "unlockMission" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Ship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerShip" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerShip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_key" ON "public"."Player"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_playerId_missionNumber_key" ON "public"."Mission"("playerId", "missionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerShip_playerId_shipId_key" ON "public"."PlayerShip"("playerId", "shipId");

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerShip" ADD CONSTRAINT "PlayerShip_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerShip" ADD CONSTRAINT "PlayerShip_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "public"."Ship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

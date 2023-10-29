/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roll` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RefugeeRegion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "orderlyGeneration" INTEGER NOT NULL,
    "disorderlyGeneration" INTEGER NOT NULL,
    "panicGeneration" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "RefugeeNode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "refugeeRegionId" INTEGER NOT NULL,
    "foodLevel" INTEGER NOT NULL,
    "healthcareLevel" INTEGER NOT NULL,
    "administrationLevel" INTEGER NOT NULL,
    "newRefugees" INTEGER NOT NULL,
    "totalRefugees" INTEGER NOT NULL,
    "uncontrollableRefugees" INTEGER NOT NULL,
    CONSTRAINT "RefugeeNode_refugeeRegionId_fkey" FOREIGN KEY ("refugeeRegionId") REFERENCES "RefugeeRegion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RefugeeGeneration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "refugeeNodeId" INTEGER NOT NULL,
    "generationType" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "turnsRemaining" INTEGER NOT NULL,
    "refugeeCampId" INTEGER,
    CONSTRAINT "RefugeeGeneration_refugeeCampId_fkey" FOREIGN KEY ("refugeeCampId") REFERENCES "RefugeeCamp" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RefugeeGeneration_refugeeNodeId_fkey" FOREIGN KEY ("refugeeNodeId") REFERENCES "RefugeeNode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RefugeeCamp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "foodLevel" INTEGER NOT NULL,
    "healthcareLevel" INTEGER NOT NULL,
    "housingLevel" INTEGER NOT NULL,
    "administrationLevel" INTEGER NOT NULL,
    "inDanger" BOOLEAN NOT NULL,
    "inCrisis" BOOLEAN NOT NULL,
    "totalRefugeesPresent" INTEGER NOT NULL,
    "refugeeCapacity" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roll" TEXT NOT NULL
);
INSERT INTO "new_User" ("email", "id") SELECT "email", "id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

/*
  Warnings:

  - You are about to drop the `RefugeeCamp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefugeeGeneration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefugeeNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefugeeRegion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RefugeeCamp";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RefugeeGeneration";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RefugeeNode";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RefugeeRegion";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DeployableRegion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "food" INTEGER NOT NULL DEFAULT 0,
    "healthcare" INTEGER NOT NULL DEFAULT 0,
    "housing" INTEGER NOT NULL DEFAULT 0,
    "admin" INTEGER NOT NULL DEFAULT 0,
    "refugueesPresent" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "RefugeeGen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "genType" TEXT NOT NULL DEFAULT 'ORDERLY',
    "food" INTEGER NOT NULL DEFAULT 0,
    "healthcare" INTEGER NOT NULL DEFAULT 0,
    "admin" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Route" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

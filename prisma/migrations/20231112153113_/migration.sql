/*
  Warnings:

  - You are about to drop the column `refugueesPresent` on the `DeployableRegion` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeployableRegion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "food" INTEGER NOT NULL DEFAULT 0,
    "healthcare" INTEGER NOT NULL DEFAULT 0,
    "housing" INTEGER NOT NULL DEFAULT 0,
    "admin" INTEGER NOT NULL DEFAULT 0,
    "refugeesPresent" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_DeployableRegion" ("admin", "food", "healthcare", "housing", "id") SELECT "admin", "food", "healthcare", "housing", "id" FROM "DeployableRegion";
DROP TABLE "DeployableRegion";
ALTER TABLE "new_DeployableRegion" RENAME TO "DeployableRegion";
CREATE TABLE "new_Route" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "supplyCap" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Route" ("id", "isOpen") SELECT "id", "isOpen" FROM "Route";
DROP TABLE "Route";
ALTER TABLE "new_Route" RENAME TO "Route";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

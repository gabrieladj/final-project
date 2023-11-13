-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RefugeeGen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "genType" TEXT NOT NULL DEFAULT 'ORDERLY',
    "totalRefugees" INTEGER NOT NULL DEFAULT 0,
    "newRefugees" INTEGER NOT NULL DEFAULT 0,
    "food" INTEGER NOT NULL DEFAULT 0,
    "healthcare" INTEGER NOT NULL DEFAULT 0,
    "admin" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_RefugeeGen" ("admin", "food", "genType", "healthcare", "id") SELECT "admin", "food", "genType", "healthcare", "id" FROM "RefugeeGen";
DROP TABLE "RefugeeGen";
ALTER TABLE "new_RefugeeGen" RENAME TO "RefugeeGen";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

/*
  Warnings:

  - You are about to drop the `SubmissionCache` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `total_submissions` to the `Option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_submissions` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "total_submissions" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "total_submissions" INTEGER NOT NULL;

-- DropTable
DROP TABLE "SubmissionCache";

/*
  Warnings:

  - You are about to drop the column `option_id` on the `Option` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Option" DROP COLUMN "option_id";

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'Select the most clickable thumbnail',
ALTER COLUMN "amount" SET DATA TYPE TEXT;

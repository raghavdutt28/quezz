-- CreateEnum
CREATE TYPE "TxnStatus" AS ENUM ('Processing', 'Success', 'Failure');

-- CreateTable
CREATE TABLE "Payouts" (
    "id" SERIAL NOT NULL,
    "worker_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "status" "TxnStatus" NOT NULL,

    CONSTRAINT "Payouts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payouts" ADD CONSTRAINT "Payouts_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { TOTAL_DECIMALS, WORKER_JWT_SECRET } from "../config";
import { workerauthMiddleware } from "../middleware";
import { getNextTask } from "../db";
import { createSubmissionInput, signingBitArray } from "../types";
import nacl from "tweetnacl";
import { Connection, Keypair, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { privateKey } from "../privateKeys";
import { decode } from "bs58";


const TOTAL_SUBMISSIONS = 100;
const que$$PublicKey = "EWPnvsmjvpvuy5X9BrPzKT8zsamKu6tF4u4vGH25CTvr";
const connection = new Connection(process.env.RPC_URL ?? "");
const router = Router();

const prismaClient = new PrismaClient();

router.post("/payout", workerauthMiddleware, async (req, res) => {
    //@ts-ignore
    const workerId = req.workerId;
    const worker = await prismaClient.worker.findFirst({
        where: {
            id: Number(workerId),
        }
    });

    if (!worker) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const address = worker?.address;
    const fromPubkey = new PublicKey(que$$PublicKey);
    const toPubkey = new PublicKey(address);

    const transferInstruction = SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: 1000_000_000 * (worker.pending_amount / TOTAL_DECIMALS),
    });

    const blockhash = await connection.getLatestBlockhash();
    const message = new TransactionMessage({
        payerKey: fromPubkey,
        recentBlockhash: blockhash.blockhash,
        instructions: [transferInstruction],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);
    const keypair = Keypair.fromSecretKey(decode(privateKey));

    transaction.sign([keypair]);

    const signature = await connection.sendTransaction(transaction, { skipPreflight: false });

    // Polling for transaction status using getSignatureStatus
    let confirmed = false;
    let retries = 0;
    const maxRetries = 6;

    while (!confirmed && retries < maxRetries) {
        const status = await connection.getSignatureStatus(signature, {
            searchTransactionHistory: true,
        });

        if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
            confirmed = true;
            //console.log('Transaction confirmed:', status.value);
        } else if (status.value?.err) {
            //console.error('Transaction failed:', status.value.err);
            return res.status(500).json({
                message: 'Transaction failed',
                error: status.value.err
            });
        } else {
            //console.log('Transaction not yet confirmed, checking again...');
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        retries++;
    }

    if (!confirmed) {
        return res.status(408).json({
            message: 'Transaction confirmation timed out',
            signature: signature
        });
    }

    // Only update the database if the transaction was confirmed successfully
    await prismaClient.$transaction(async tx => {
        await tx.worker.update({
            where: {
                id: Number(workerId)
            },
            data: {
                pending_amount: {
                    decrement: worker.pending_amount,
                },
                locked_amount: {
                    increment: worker.pending_amount
                }
            }
        });

        await tx.payouts.create({
            data: {
                worker_id: Number(workerId),
                amount: worker.pending_amount,
                status: "Processing",
                signature: signature
            }
        });
    }, {
        maxWait: 5000,
        timeout: 10000,
    });

    res.json({
        message: "Processing payout",
        amount: worker.pending_amount,
        signature: signature
    });
});

router.get("/balance", workerauthMiddleware, async (req, res) => {
    //@ts-ignore
    const workerId = req.workerId;
    const worker = await prismaClient.worker.findFirst({
        where: {
            id: workerId
        }
    })
    res.json({
        pendingAmount: worker?.pending_amount,
        lockedAmount: worker?.locked_amount
    })
})

router.post("/submission", workerauthMiddleware, async (req, res) => {
    // @ts-ignore
    const workerId = req.workerId;
    const body = req.body;
    const parsedBody = createSubmissionInput.safeParse(body);

    if (parsedBody.success) {
        const task = await getNextTask(Number(workerId));
        if (!task || task?.id !== Number(parsedBody.data.taskId)) {
            return res.status(411).json({
                message: "Incorrect task id"
            })
        }

        const amount = task.amount / TOTAL_SUBMISSIONS;

        const submission = await prismaClient.$transaction(async tx => {
            const submission = await tx.submission.create({
                data: {
                    option_id: Number(parsedBody.data.selection),
                    worker_id: workerId,
                    task_id: Number(parsedBody.data.taskId),
                    amount: amount,
                }
            })
            await tx.option.update({
                where: {
                    id: Number(parsedBody.data.selection),
                },
                data: {
                    total_submissions: {
                        increment: 1
                    }
                }
            })
            await tx.task.update({
                where: {
                    id: Number(parsedBody.data.taskId),
                },
                data: {
                    total_submissions: {
                        increment: 1
                    }
                }
            })

            await tx.worker.update({
                where: {
                    id: workerId,
                },
                data: {
                    pending_amount: {
                        increment: amount
                    }
                }
            })

            return submission;
        }, {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
        })

        const nextTask = await getNextTask(Number(workerId));
        if (!nextTask) {
            res.json({
                message: "All tasks completed, Come back later for more"
            })
        } else {
            res.status(200).json({
                nextTask,
                amount
            })
        }


    } else {
        res.status(411).json({
            message: "Incorrect inputs"
        })

    }

})

router.get("/nextTask", workerauthMiddleware, async (req, res) => {
    //@ts-ignore
    const workerId = req.workerId;

    const task = await getNextTask(Number(workerId));

    if (!task) {
        res.json({
            message: "All tasks completed, Come back later for more"
        })
    } else {
        res.status(200).json({
            task
        })
    }
})

router.post("/signIn", async (req, res) => {
    const { signature, publicKey } = req.body;
    const validatedData = signingBitArray.safeParse({ signature, publicKey })
    if (!validatedData.success) {
        return res.json({
            message: "Invalid signature or public key"
        })
    }
    const message = new TextEncoder().encode("Sign in to Que$$ as a worker");
    const result = nacl.sign.detached.verify(
        message,
        new Uint8Array(validatedData.data.signature.data),
        new PublicKey(validatedData.data.publicKey).toBytes(),
    )
    if (!result) {
        return res.status(401).json({
            message: "Invalid signature"
        })
    }
    const existingWorker = await prismaClient.worker.findFirst({
        where: {
            address: validatedData.data.publicKey
        }
    })

    if (existingWorker) {
        const token = jwt.sign({
            workerId: existingWorker.id
        }, WORKER_JWT_SECRET)

        res.json({
            token,
            amount: (existingWorker.pending_amount / TOTAL_DECIMALS)
        })
    }

    else {
        const worker = await prismaClient.worker.create({
            data: {
                address: validatedData.data.publicKey,
                pending_amount: 0,
                locked_amount: 0

            }
        })
        const token = jwt.sign({
            workerId: worker.id
        }, WORKER_JWT_SECRET)

        res.json({
            token,
            amount: 0
        })
    }


});

export default router;
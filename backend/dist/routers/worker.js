"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const middleware_1 = require("../middleware");
const db_1 = require("../db");
const types_1 = require("../types");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const web3_js_1 = require("@solana/web3.js");
const privateKeys_1 = require("../privateKeys");
const bs58_1 = require("bs58");
const TOTAL_SUBMISSIONS = 100;
const que$$PublicKey = "EWPnvsmjvpvuy5X9BrPzKT8zsamKu6tF4u4vGH25CTvr";
const connection = new web3_js_1.Connection((_a = process.env.RPC_URL) !== null && _a !== void 0 ? _a : "");
const router = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
router.post("/payout", middleware_1.workerauthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    //@ts-ignore
    const workerId = req.workerId;
    const worker = yield prismaClient.worker.findFirst({
        where: {
            id: Number(workerId),
        }
    });
    if (!worker) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    const address = worker === null || worker === void 0 ? void 0 : worker.address;
    const fromPubkey = new web3_js_1.PublicKey(que$$PublicKey);
    const toPubkey = new web3_js_1.PublicKey(address);
    const transferInstruction = web3_js_1.SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: 1000000000 * (worker.pending_amount / config_1.TOTAL_DECIMALS),
    });
    const blockhash = yield connection.getLatestBlockhash();
    const message = new web3_js_1.TransactionMessage({
        payerKey: fromPubkey,
        recentBlockhash: blockhash.blockhash,
        instructions: [transferInstruction],
    }).compileToV0Message();
    const transaction = new web3_js_1.VersionedTransaction(message);
    const keypair = web3_js_1.Keypair.fromSecretKey((0, bs58_1.decode)(privateKeys_1.privateKey));
    transaction.sign([keypair]);
    const signature = yield connection.sendTransaction(transaction, { skipPreflight: false });
    // Polling for transaction status using getSignatureStatus
    let confirmed = false;
    let retries = 0;
    const maxRetries = 6;
    while (!confirmed && retries < maxRetries) {
        const status = yield connection.getSignatureStatus(signature, {
            searchTransactionHistory: true,
        });
        if (((_a = status.value) === null || _a === void 0 ? void 0 : _a.confirmationStatus) === 'confirmed' || ((_b = status.value) === null || _b === void 0 ? void 0 : _b.confirmationStatus) === 'finalized') {
            confirmed = true;
            //console.log('Transaction confirmed:', status.value);
        }
        else if ((_c = status.value) === null || _c === void 0 ? void 0 : _c.err) {
            //console.error('Transaction failed:', status.value.err);
            return res.status(500).json({
                message: 'Transaction failed',
                error: status.value.err
            });
        }
        else {
            //console.log('Transaction not yet confirmed, checking again...');
            yield new Promise((resolve) => setTimeout(resolve, 5000));
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
    yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.worker.update({
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
        yield tx.payouts.create({
            data: {
                worker_id: Number(workerId),
                amount: worker.pending_amount,
                status: "Processing",
                signature: signature
            }
        });
    }), {
        maxWait: 5000,
        timeout: 10000,
    });
    res.json({
        message: "Processing payout",
        amount: worker.pending_amount,
        signature: signature
    });
}));
router.get("/balance", middleware_1.workerauthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const workerId = req.workerId;
    const worker = yield prismaClient.worker.findFirst({
        where: {
            id: workerId
        }
    });
    res.json({
        pendingAmount: worker === null || worker === void 0 ? void 0 : worker.pending_amount,
        lockedAmount: worker === null || worker === void 0 ? void 0 : worker.locked_amount
    });
}));
router.post("/submission", middleware_1.workerauthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const workerId = req.workerId;
    const body = req.body;
    const parsedBody = types_1.createSubmissionInput.safeParse(body);
    if (parsedBody.success) {
        const task = yield (0, db_1.getNextTask)(Number(workerId));
        if (!task || (task === null || task === void 0 ? void 0 : task.id) !== Number(parsedBody.data.taskId)) {
            return res.status(411).json({
                message: "Incorrect task id"
            });
        }
        const amount = task.amount / TOTAL_SUBMISSIONS;
        const submission = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const submission = yield tx.submission.create({
                data: {
                    option_id: Number(parsedBody.data.selection),
                    worker_id: workerId,
                    task_id: Number(parsedBody.data.taskId),
                    amount: amount,
                }
            });
            yield tx.option.update({
                where: {
                    id: Number(parsedBody.data.selection),
                },
                data: {
                    total_submissions: {
                        increment: 1
                    }
                }
            });
            yield tx.task.update({
                where: {
                    id: Number(parsedBody.data.taskId),
                },
                data: {
                    total_submissions: {
                        increment: 1
                    }
                }
            });
            yield tx.worker.update({
                where: {
                    id: workerId,
                },
                data: {
                    pending_amount: {
                        increment: amount
                    }
                }
            });
            return submission;
        }), {
            maxWait: 5000, // default: 2000
            timeout: 10000, // default: 5000
        });
        const nextTask = yield (0, db_1.getNextTask)(Number(workerId));
        if (!nextTask) {
            res.json({
                message: "All tasks completed, Come back later for more"
            });
        }
        else {
            res.status(200).json({
                nextTask,
                amount
            });
        }
    }
    else {
        res.status(411).json({
            message: "Incorrect inputs"
        });
    }
}));
router.get("/nextTask", middleware_1.workerauthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const workerId = req.workerId;
    const task = yield (0, db_1.getNextTask)(Number(workerId));
    if (!task) {
        res.json({
            message: "All tasks completed, Come back later for more"
        });
    }
    else {
        res.status(200).json({
            task
        });
    }
}));
router.post("/signIn", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { signature, publicKey } = req.body;
    const validatedData = types_1.signingBitArray.safeParse({ signature, publicKey });
    if (!validatedData.success) {
        return res.json({
            message: "Invalid signature or public key"
        });
    }
    const message = new TextEncoder().encode("Sign in to Que$$ as a worker");
    const result = tweetnacl_1.default.sign.detached.verify(message, new Uint8Array(validatedData.data.signature.data), new web3_js_1.PublicKey(validatedData.data.publicKey).toBytes());
    if (!result) {
        return res.status(401).json({
            message: "Invalid signature"
        });
    }
    const existingWorker = yield prismaClient.worker.findFirst({
        where: {
            address: validatedData.data.publicKey
        }
    });
    if (existingWorker) {
        const token = jsonwebtoken_1.default.sign({
            workerId: existingWorker.id
        }, config_1.WORKER_JWT_SECRET);
        res.json({
            token,
            amount: (existingWorker.pending_amount / config_1.TOTAL_DECIMALS)
        });
    }
    else {
        const worker = yield prismaClient.worker.create({
            data: {
                address: validatedData.data.publicKey,
                pending_amount: 0,
                locked_amount: 0
            }
        });
        const token = jsonwebtoken_1.default.sign({
            workerId: worker.id
        }, config_1.WORKER_JWT_SECRET);
        res.json({
            token,
            amount: 0
        });
    }
}));
exports.default = router;

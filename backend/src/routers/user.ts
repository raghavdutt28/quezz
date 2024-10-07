import { Router } from "express";
import nacl from "tweetnacl";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import authMiddleware from "../middleware";
import { JWT_SECRET, TOTAL_DECIMALS } from "../config";
import { createTaskInput, signingBitArray } from "../types";
import { Connection, PublicKey } from "@solana/web3.js"

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.ACCESS_SECRET ?? "",
    },
    region: "us-east-1"
});

const DEFAULT_TITLE = "Select the most clickable thumbnail";
const prismaClient = new PrismaClient();
const connection = new Connection(process.env.RPC_URL ?? "");
const PARENT_WALLET_ADDRESS = "EWPnvsmjvpvuy5X9BrPzKT8zsamKu6tF4u4vGH25CTvr";

const router = Router();

router.get("/myTasks", authMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const tasks = await prismaClient.task.findMany({
        where: {
            user_id: userId,
        },
    });

    if (tasks.length === 0) {
        return res.status(404).json({
            message: "No tasks found for the user."
        });
    }
    
    res.status(200).json({
        tasks
    });

});

router.get("/task", authMiddleware, async (req, res) => {
    //@ts-ignore
    const taskId: String = req.query.taskId;
    //@ts-ignore
    const userId: String = req.userId;
    const taskDetails = await prismaClient.task.findFirst({
        where: {
            user_id: Number(userId),
            id: Number(taskId)
        },
        include: {
            options: true
        }
    })
    if (!taskDetails) {
        return res.status(404).json({
            message: "Task not found."
        })
    }

    //todo: Make this faster
    const responses = await prismaClient.submission.findMany({
        where: {
            task_id: Number(taskId)
        }
    });

    const result: Record<string, {
        count: number;
        option: {
            imageUrl: string
        }
    }> = {};


    taskDetails.options.forEach(option => {
        result[option.id] = {
            count: option.total_submissions,
            option: {
                imageUrl: option.image_url
            }
        }
    });

    res.json({
        result,
        taskDetails
    })
});

router.post("/task", authMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedData = createTaskInput.safeParse(body);
    const user = await prismaClient.user.findFirst({
        where: {
            id: userId,
        }
    });

    if (!parsedData.success) {
        return res.status(411).json({
            message: "You've sent the wrong inputs."
        })
    }

    const transaction = await connection.getTransaction(parsedData.data.signature, {
        maxSupportedTransactionVersion: 1
    });

    if((transaction?.meta?.postBalances?.[1] ?? 0) - (transaction?.meta?.preBalances?.[1] ?? 0) !== 100000000){
        return res.status(411).json({
            message: "You've sent the wrong Amount."
        })
    }
    if(transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
        return res.status(411).json({
            message: "You've sent to wrong address."
        })
    }
    if(transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address){
        return res.status(411).json({
            message: "This amount was not sent by you."
        })
    }

    let response = await prismaClient.$transaction(async (tx) => {
        const response = await tx.task.create({
            data: {
                title: parsedData.data.title ?? DEFAULT_TITLE,
                signature: parsedData.data.signature,
                amount: 0.1 * TOTAL_DECIMALS,
                user_id: userId,
            }
        });
        await tx.option.createMany({
            data: parsedData.data.options.map(x => ({
                image_url: x.imageUrl,
                task_id: response.id,
            }))
        })
        return response;
    }, {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
    })
    res.json({
        id: response.id
    })
});

router.get("/preSignedUrl", authMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: 'decentalized-quezz',
        Key: `decentralized-quezz/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Fields: {
            'Content-Type': 'image/jpg'
        },
        Expires: 3600
    })

    res.json({
        preSignedUrl: url,
        fields
    });
});

//sign in with wallet
router.post("/signIn", async (req, res) => {
    const {signature, publicKey} = req.body;
    const validatedData = signingBitArray.safeParse({ signature, publicKey });
    if (!validatedData.success) {
        return res.status(411).json({
            message: "You've sent the wrong inputs."
        })
    }
    const message = new TextEncoder().encode("Sign in to Que$$");
    const result = nacl.sign.detached.verify(
        message,
        new Uint8Array(validatedData.data.signature.data),
        new PublicKey(validatedData.data.publicKey).toBytes(),
    );
    if (!result) {
        return res.status(401).json({
            message: "Invalid signature"
        })
    }

    const existingUser = await prismaClient.user.findFirst({
        where: {
            address: validatedData.data.publicKey
        }
    })

    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id
        }, JWT_SECRET)

        res.json({
            token
        })
    }

    else {
        const user = await prismaClient.user.create({
            data: {
                address: validatedData.data.publicKey,
            }
        })
        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET)

        res.json({
            token
        })
    }


});

export default router;
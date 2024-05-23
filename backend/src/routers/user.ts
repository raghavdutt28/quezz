import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import authMiddleware from "../middleware";
import {JWT_SECRET} from "../index";
import { createTaskInput } from "../types";

const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: "AKIA47CRWHAWR4JO2D66",
        secretAccessKey: "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"
    }
});

const DEFAULT_TITLE = "Select the most clickable thumbnail";

const prismaClient = new PrismaClient();



const router = Router();

router.post("/task", authMiddleware, async (req, res) => {
    //validate the inputs from the user
    //@ts-ignore
    const userId = req.userId;
    const body = req.body;
    const paresedData = createTaskInput.safeParse(body);

    if(!paresedData.success){
        return res.status(411).json({
            message: "You've sent the wrong inputs."
        })
    }

    let response = await prismaClient.$transaction(async (tx) => {
        const response = await tx.task.create({
            data: {
                title: paresedData.data.title ?? DEFAULT_TITLE,
                signature: paresedData.data.signature,
                amount: "1",
                user_id: userId,
            }
        });
        await tx.option.createMany({
            data: paresedData.data.options.map(x => ({
                image_url: x.imageUrl,
                task_id: response.id,
            }))
        })
        return response;
    })
    res.json({
        id: response.id
    })
})

router.get("/preSignedUrl", authMiddleware, async (req, res) =>{
    //@ts-ignore
    const userId = req.userId;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: "decentalized-quezz",
        Key: `/decentralized-quezz/${userId}/${Math.random()}/image.jpg`,
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
      })
      
      console.log({ url, fields })
})

//sign in with wallet
router.post("/signin", async (req, res) =>{
//todo: add signin verification logic
const hardcodedWalletAddress = "0x0947CBF702b1420FD54113463131C13eD46178ac";

const existingUser = await prismaClient.user.findFirst({
    where: {
        address: hardcodedWalletAddress
    }
})

if(existingUser) {
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
            address: hardcodedWalletAddress,
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
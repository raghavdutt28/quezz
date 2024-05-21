import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import authMiddleware from "../middleware";
import {JWT_SECRET} from "../index";

const s3Client = new S3Client();


const prismaClient = new PrismaClient();



const router = Router();

router.get("/preSignedUrl", authMiddleware, async (req, res) =>{
    //@ts-ignore
    const userId = req.userId;
    const command = new PutObjectCommand({
        Bucket: "decentalized-quezz",
        Key: "/decentralised-quezz/${}"
    })
    const preSignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600
    })
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
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const middleware_1 = __importDefault(require("../middleware"));
const config_1 = require("../config");
const types_1 = require("../types");
const web3_js_1 = require("@solana/web3.js");
const s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: (_a = process.env.ACCESS_KEY_ID) !== null && _a !== void 0 ? _a : "",
        secretAccessKey: (_b = process.env.ACCESS_SECRET) !== null && _b !== void 0 ? _b : "",
    },
    region: "us-east-1"
});
const DEFAULT_TITLE = "Select the most clickable thumbnail";
const prismaClient = new client_1.PrismaClient();
const connection = new web3_js_1.Connection((_c = process.env.RPC_URL) !== null && _c !== void 0 ? _c : "");
const PARENT_WALLET_ADDRESS = "EWPnvsmjvpvuy5X9BrPzKT8zsamKu6tF4u4vGH25CTvr";
const router = (0, express_1.Router)();
router.get("/myTasks", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const tasks = yield prismaClient.task.findMany({
        where: {
            user_id: userId,
        },
    });
    if (tasks.length === 0) {
        return res.status(404).json({
            message: "No tasks found for the user."
        });
    }
    console.log(tasks);
    res.status(200).json({
        tasks
    });
}));
router.get("/task", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const taskId = req.query.taskId;
    //@ts-ignore
    const userId = req.userId;
    const taskDetails = yield prismaClient.task.findFirst({
        where: {
            user_id: Number(userId),
            id: Number(taskId)
        },
        include: {
            options: true
        }
    });
    if (!taskDetails) {
        return res.status(404).json({
            message: "Task not found."
        });
    }
    //todo: Make this faster
    const responses = yield prismaClient.submission.findMany({
        where: {
            task_id: Number(taskId)
        }
    });
    const result = {};
    taskDetails.options.forEach(option => {
        result[option.id] = {
            count: option.total_submissions,
            option: {
                imageUrl: option.image_url
            }
        };
    });
    res.json({
        result,
        taskDetails
    });
}));
router.post("/task", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f, _g, _h, _j, _k, _l;
    //@ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedData = types_1.createTaskInput.safeParse(body);
    const user = yield prismaClient.user.findFirst({
        where: {
            id: userId,
        }
    });
    if (!parsedData.success) {
        return res.status(411).json({
            message: "You've sent the wrong inputs."
        });
    }
    const transaction = yield connection.getTransaction(parsedData.data.signature, {
        maxSupportedTransactionVersion: 1
    });
    if (((_f = (_e = (_d = transaction === null || transaction === void 0 ? void 0 : transaction.meta) === null || _d === void 0 ? void 0 : _d.postBalances) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0) - ((_j = (_h = (_g = transaction === null || transaction === void 0 ? void 0 : transaction.meta) === null || _g === void 0 ? void 0 : _g.preBalances) === null || _h === void 0 ? void 0 : _h[1]) !== null && _j !== void 0 ? _j : 0) !== 100000000) {
        return res.status(411).json({
            message: "You've sent the wrong Amount."
        });
    }
    if (((_k = transaction === null || transaction === void 0 ? void 0 : transaction.transaction.message.getAccountKeys().get(1)) === null || _k === void 0 ? void 0 : _k.toString()) !== PARENT_WALLET_ADDRESS) {
        return res.status(411).json({
            message: "You've sent to wrong address."
        });
    }
    if (((_l = transaction === null || transaction === void 0 ? void 0 : transaction.transaction.message.getAccountKeys().get(0)) === null || _l === void 0 ? void 0 : _l.toString()) !== (user === null || user === void 0 ? void 0 : user.address)) {
        return res.status(411).json({
            message: "This amount was not sent by you."
        });
    }
    let response = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _m;
        const response = yield tx.task.create({
            data: {
                title: (_m = parsedData.data.title) !== null && _m !== void 0 ? _m : DEFAULT_TITLE,
                signature: parsedData.data.signature,
                amount: 0.1 * config_1.TOTAL_DECIMALS,
                user_id: userId,
            }
        });
        yield tx.option.createMany({
            data: parsedData.data.options.map(x => ({
                image_url: x.imageUrl,
                task_id: response.id,
            }))
        });
        return response;
    }), {
        maxWait: 5000, // default: 2000
        timeout: 10000, // default: 5000
    });
    res.json({
        id: response.id
    });
}));
router.get("/preSignedUrl", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
        Bucket: 'decentalized-quezz',
        Key: `decentralized-quezz/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Fields: {
            'Content-Type': 'image/jpg'
        },
        Expires: 3600
    });
    res.json({
        preSignedUrl: url,
        fields
    });
}));
//sign in with wallet
router.post("/signIn", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { signature, publicKey } = req.body;
    const validatedData = types_1.signingBitArray.safeParse({ signature, publicKey });
    if (!validatedData.success) {
        return res.status(411).json({
            message: "You've sent the wrong inputs."
        });
    }
    const message = new TextEncoder().encode("Sign in to Que$$");
    const result = tweetnacl_1.default.sign.detached.verify(message, new Uint8Array(validatedData.data.signature.data), new web3_js_1.PublicKey(validatedData.data.publicKey).toBytes());
    if (!result) {
        return res.status(401).json({
            message: "Invalid signature"
        });
    }
    const existingUser = yield prismaClient.user.findFirst({
        where: {
            address: validatedData.data.publicKey
        }
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id
        }, config_1.JWT_SECRET);
        res.json({
            token
        });
    }
    else {
        const user = yield prismaClient.user.create({
            data: {
                address: validatedData.data.publicKey,
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id
        }, config_1.JWT_SECRET);
        res.json({
            token
        });
    }
}));
exports.default = router;

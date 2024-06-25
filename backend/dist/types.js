"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signingBitArray = exports.createSubmissionInput = exports.createTaskInput = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTaskInput = zod_1.default.object({
    options: zod_1.default.array(zod_1.default.object({
        imageUrl: zod_1.default.string()
    })).min(2),
    title: zod_1.default.string().optional(),
    signature: zod_1.default.string()
});
exports.createSubmissionInput = zod_1.default.object({
    taskId: zod_1.default.string(),
    selection: zod_1.default.string(),
});
exports.signingBitArray = zod_1.default.object({
    signature: zod_1.default.object({
        type: zod_1.default.string(),
        data: zod_1.default.array(zod_1.default.number())
    }),
    publicKey: zod_1.default.string(),
});

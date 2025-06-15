"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authMiddleware;
exports.workerauthMiddleware = workerauthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
function authMiddleware(req, res, next) {
    var _a;
    const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
    try {
        const decoded = jsonwebtoken_1.default.verify(authHeader, config_1.JWT_SECRET);
        //@ts-ignore
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            return next();
        }
        else {
            return res.status(403).json({
                message: "You are not logged in."
            });
        }
    }
    catch (error) {
        return res.status(403).json({
            message: "You are not logged in."
        });
    }
}
function workerauthMiddleware(req, res, next) {
    var _a;
    const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
    try {
        const decoded = jsonwebtoken_1.default.verify(authHeader, config_1.WORKER_JWT_SECRET);
        //@ts-ignore
        if (decoded.workerId) {
            //@ts-ignore
            req.workerId = decoded.workerId;
            return next();
        }
        else {
            return res.status(403).json({
                message: "You are not logged in."
            });
        }
    }
    catch (error) {
        return res.status(403).json({
            message: "You are not logged in."
        });
    }
}

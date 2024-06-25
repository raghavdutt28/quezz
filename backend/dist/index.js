"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routers/user"));
const worker_1 = __importDefault(require("./routers/worker"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
//expecting the user to provide some data
app.use(express_1.default.json());
app.use((0, cors_1.default)());
console.log(window.location.href);
// Mount the routers with the specified base paths
app.use("/v1/user", user_1.default);
app.use("/v1/worker", worker_1.default);
// Start the server and handle errors
app.listen(port, () => {
    console.log("Server listening on port" + { port });
})
    .on('error', (err) => {
    console.error("Error starting server:", err);
});

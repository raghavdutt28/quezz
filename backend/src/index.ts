export const JWT_SECRET = "1234";
import express from 'express';
import userRouter from "./routers/user";
import workerRouter from "./routers/worker";

const app = express();

// Mount the routers with the specified base paths
app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

// Start the server and handle errors
app.listen(8080)

import express from 'express';
import userRouter from "./routers/user";
import workerRouter from "./routers/worker";
import testingRouter from "./routers/testing";
import cors from "cors";

const app = express();
//const port = process.env.PORT || 8888;

//expecting the user to provide some data
app.use(express.json());
app.use(cors());
app.use("/v1/testing", testingRouter)
// Mount the routers with the specified base paths
app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

// Start the server and handle errors
app.listen(8080, () => {
    console.log("Server listening on port 8080");
  })
  .on('error', (err) => {
    console.error("Error starting server:", err);
  });

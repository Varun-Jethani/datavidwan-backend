import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const corsOptions = {
  origin: ["http://localhost:5173"],
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";
import webRouter from "./routes/web.router.js";
import blogRouter from "./routes/blog.routes.js";
import CommentRouter from "./routes/comment.routes.js";
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/web",webRouter);
app.use("/blog", blogRouter);
app.use("/comment", CommentRouter);
app.use("/", (req, res) => {
  res.json("Hell");
});

export default app;

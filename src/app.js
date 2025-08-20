import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const corsOptions = {
  origin: ["http://localhost:5173","http://localhost:5174","http://localhost:3000",process.env.FRONTEND_URL, process.env.ADMIN_URL],
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
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
import aboutRouter from "./routes/about.routes.js";
import contactRouter from "./routes/contact.routes.js";
import consultRouter from "./routes/consult.route.js";
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/web",webRouter);
app.use("/blog", blogRouter);
app.use("/comment", CommentRouter);
app.use("/about", aboutRouter)
app.use("/contactus", contactRouter);
app.use("/consult", consultRouter);
app.use("/", (req, res) => {
  res.json("Hell");
});

export default app;

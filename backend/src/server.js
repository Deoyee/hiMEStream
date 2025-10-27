import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import path from "path";

const __dirname = path.resolve();

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // allow frontend send req
}));
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoute);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
    }
    );
}

app.listen(PORT, () => {
    console.log("hiMEStream Server Running", PORT);
    connectDB();
});
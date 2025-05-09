import express from 'express';
// import cors from 'cors';
import "dotenv/config";
import dogRoutes from './routes/dogRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import walkRoutes from "./routes/walkRoutes.js";
import leagueRoutes from "./routes/leagueRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import { connectDB } from './lib/db.js';

// import job from "./lib/cron.js";
const app = express();
const PORT = process.env.PORT || 3000

// job.start();
// app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/walks", walkRoutes);
app.use("/api/dogs", dogRoutes);
app.use("/api/league", leagueRoutes);
app.use("/api/photo", photoRoutes)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();

})

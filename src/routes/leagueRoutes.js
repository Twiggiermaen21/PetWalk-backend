import express from "express";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, async (req, res) => {
    try {
        const users = await User.find()
            .select('username profileImage rank') // wybieramy tylko potrzebne pola
            .sort({ rank: -1 }) // sortujemy malejąco po rank
            .limit(50);

        res.send({ users });

    } catch (error) {
        console.log("Error in get all Wals route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
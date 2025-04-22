import express from "express";
import Walk from "../models/Walk.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {

    try {

        const { time, speed, distance, path, dogs } = req.body;

        const newWalk = new Walk({
            time,
            speed,
            distance,
            path,
            user: req.user._id,
            dogs
        });

        await newWalk.save();

        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { rank: 1 } }, // zwiększamy pole rank o 1
            { new: true }
        );
        res.status(201).json(newWalk);

    } catch (error) {
        console.log('Error creating Walk', error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/", protectRoute, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const walks = await Walk.find({ user: req.user.id }).sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("dogs");

        const totalPages = await Walk.countDocuments({ user: req.user.id });

        res.send({
            walks,
            currentPage: page,
            totalPages: Math.ceil(totalPages / limit),
        });

    } catch (error) {
        console.log("Error in get all Wals route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const walk = await Walk.findById(req.params.id);
        if (!walk) return res.status(400).json({ message: "Book not found" });

        //check if user is the creator of the walk
        if (walk.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorized" });

        await walk.deleteOne();

        res.json({ message: "Walk deleted succesfully" })
    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;
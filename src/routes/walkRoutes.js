import express from "express";
import Walk from "../models/Walk.js";
import User from "../models/User.js";
import protectRoute from "../middleware/auth.middleware.js";
import Dog from "../models/Dog.js";
import cloudinary from "../lib/cloudinary.js"
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
        if (!walk) return res.status(400).json({ message: "Walk not found" });

        if (walk.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorized" });

        // 1. Znajdź psy oznaczone jako usunięte w tym spacerze
        const deletedDogs = await Dog.find({
            _id: { $in: walk.dogs },
            isDeleted: true
        });

        if (deletedDogs.length > 0) {
            const deletedDogIds = deletedDogs.map(dog => dog._id);

            // 2. Znajdź inne spacery, w których występują te usunięte psy (poza aktualnym)
            const walksWithDeletedDogs = await Walk.find({
                _id: { $ne: walk._id }, // pomijamy aktualny spacer
                dogs: { $in: deletedDogIds }
            });

            // 3. Jeśli nie ma innych spacerów, usuń zdjęcia i psy
            if (walksWithDeletedDogs.length === 0) {
                for (const dog of deletedDogs) {
                    try {
                        if (dog.dogImage) {
                            const publicId = dog.dogImage.split("/").pop().split(".")[0];
                            await cloudinary.uploader.destroy(publicId);
                        }
                        await dog.deleteOne();
                    } catch (err) {
                        console.log("Error deleting dog or image:", err);
                    }
                }
            }
        }

        // 4. Usuń spacer
        await walk.deleteOne();
        res.json({ message: "Walk deleted successfully" });

    } catch (error) {
        console.log("Error deleting walk", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/upload-image", protectRoute, async (req, res) => {
    try {
        const data = new Date().toLocaleDateString();
        const { image, user } = req.body;
        if (!image) return res.status(400).json({ message: "No image provided" });

        const uploaded = await cloudinary.uploader.upload(image, {
            folder: `PetWalk/${user.id}/${data}`
        });

        res.json({ imageUrl: uploaded.secure_url });
    } catch (error) {
        console.error("Upload failed", error);
        res.status(500).json({ message: "Upload error" });
    }
});

export default router;
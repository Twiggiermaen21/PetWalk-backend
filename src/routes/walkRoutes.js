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

        //check if user is the creator of the walk
        if (walk.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorized" });

        const deletedDog = await Dog.findOne({
            _id: { $in: walk.dogs },  // Szukamy psów, które są w tablicy `dogs` w tym spacerze
            isDeleted: true            // i mają isDeleted ustawione na true
        });

        // Jeśli znaleźliśmy psa z isDeleted: true, to nie wykonujemy usuwania zdjęcia
        if (deletedDog) {
            return res.status(400).json({ message: "One of the dogs in this walk is marked as deleted." });


        }
        console.log(deletedDog);
        // Jeśli żaden pies nie jest oznaczony jako usunięty, sprawdzamy, czy mamy jakiekolwiek zdjęcie do usunięcia
        const dog = await Dog.findById(walk.dogs[0]); // Załóżmy, że chcesz sprawdzić pierwszy pies w tablicy dogs
        if (!dog) return res.status(400).json({ message: "Dog not found" });

        // Jeśli pies nie ma innych spacerów, wykonaj operację usuwania zdjęcia z Cloudinary
        try {
            if (dog.dogImage) {
                const publicId = dog.dogImage.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (deleteError) {
            console.log("Error deleting image from cloudinary", deleteError);
        }

        // Usunięcie spaceru
        await walk.deleteOne();

        res.json({ message: "Walk deleted successfully" });
    } catch (error) {
        console.log("Error deleting walk", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;
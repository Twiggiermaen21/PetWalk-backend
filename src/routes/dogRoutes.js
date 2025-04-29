import express from "express";
import Dog from "../models/Dog.js";  // Model psa
import cloudinary from "../lib/cloudinary.js"
import protectRoute from "../middleware/auth.middleware.js";
const router = express.Router();

// Endpoint do dodawania psa do użytkownika
router.post("/add-dog", protectRoute, async (req, res) => {
    try {
        const { name, breed, weight, age, height, image } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Dog name is required" });
        }
        let imageUrl = "";
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }


        // Tworzymy nowego psa
        const newDog = new Dog({
            name,
            breed: breed || "",
            weight: weight || 0,
            age: age || 0,
            height: height || 0,
            dogImage: imageUrl,
            owner: req.user._id

        });

        // Zapisujemy psa do bazy danych
        await newDog.save();

        // Dodajemy psa do tablicy psów użytkownika


        res.status(200).json({ message: "Dog added successfully", name });
    } catch (error) {
        console.error("Error in add-dog route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get("/get-dog", protectRoute, async (req, res) => {
    try {
        const dogs = await Dog.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.send({ dogs });
    } catch (error) {
        console.log("Error in get user dogs route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.patch("/:id", protectRoute, async (req, res) => {
    try {
        const dog = await Dog.findById(req.params.id);
        if (!dog) return res.status(400).json({ message: "Dog not found" });

        //check if user is the creator of the walk
        if (dog.owner.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorized" });

        // try {
        //     if (dog.dogImage) {
        //         const publicId = dog.dogImage.split("/").pop().split(".")[0];
        //         await cloudinary.uploader.destroy(publicId);
        //     }
        // } catch (deleteError) {
        //     console.log("Error deleting image from cloudinary", deleteError);
        // }

        // await dog.deleteOne();


        dog.isDeleted = true;
        await dog.save();
        res.json({ message: "Dog deleted succesfully" })
    } catch (error) {
        console.log("Error deleting Dog", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
export default router;

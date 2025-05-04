import express from "express";
import Walk from "../models/Walk.js";

import protectRoute from "../middleware/auth.middleware.js";
import Dog from "../models/Dog.js";
import Photo from "../models/Photos.js";
import cloudinary from "../lib/cloudinary.js"
const router = express.Router();



router.get("/", protectRoute, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 18;
        const skip = (page - 1) * limit;
        console.log("page:", page);
        console.log("skip:", skip);
        console.log("limit:", limit);

        const photos = await Photo.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)


        const totalPages = await Photo.countDocuments({ user: req.user.id });

        res.send({
            photos,
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
        const photo = await Photo.findById(req.params.id);
        if (!photo) return res.status(400).json({ message: "Walk not found" });

        if (photo.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorized" });

        const publicId = photo.photo.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);


        // 4. Usuń spacer
        await photo.deleteOne();
        res.json({ message: "Photo deleted successfully" });

    } catch (error) {
        console.log("Error deleting Photo", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/upload-image", protectRoute, async (req, res) => {
    try {
        const data = new Date().toLocaleDateString();
        const { image, user } = req.body;
        if (!image || !user) {
            console.log(image);
            console.log(user);
            return res.status(400).json({ message: "No image provided" });
        }

        let imageUrl = "";
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: `PetWalk/${user.id}/${data}`
            });
            imageUrl = uploadResponse.secure_url;
        }

        const newPhoto = new Photo({
            photo: imageUrl,
            user: req.user._id
        })


        await newPhoto.save();
        res.status(200).json({ message: "Photo added successfully" });
    } catch (error) {
        console.error("Upload failed", error);
        res.status(500).json({ message: "Upload error" });
    }
});



export default router;
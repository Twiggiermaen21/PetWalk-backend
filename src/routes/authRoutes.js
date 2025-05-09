import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
}
router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters long" });
        }

        const existingEmail = await User.findOne({ email: email });
        if (existingEmail) return res.status(400).json({ message: "Email already exists" });

        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: "Username already exists" });

        //get random avatar
        const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

        const user = new User({
            email,
            username,
            password,
            profileImage,

        })

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.log("Error in register route", error);
        res.status(500).json({ message: "Internal server error" });
    }

});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });


        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });


        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
                createdAt: user.createdAt

            }
        });

    } catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.put("/update-user", protectRoute, async (req, res) => {
    try {
        const { username, email, password, profileImage } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username) {
            if (username.length < 3) {
                return res.status(400).json({ message: "Username must be at least 3 characters long" });
            }
            user.username = username;
        }

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
                return res.status(409).json({ message: "Email already in use" });
            }
            user.email = email;
        }

        if (profileImage) {
            user.profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profileImage}`;
        }

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: "Password must be at least 8 characters long" });
            }
            user.password = password;
        }
        await user.save();

        return res.status(200).json({
            message: "User updated successfully",
        });

    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


export default router;
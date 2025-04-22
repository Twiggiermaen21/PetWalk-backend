import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    role: {
        type: String,
        default: "user"
    },

    profileImage: {
        type: String,
        default: ""
    },
    rank: {
        type: Number,
        default: 0,
    },


}, { timestamps: true });

// Hashowanie hasła przed zapisaniem użytkownika do bazy
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
})

// Funkcja porównująca hasła
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

// Eksportowanie modelu użytkownika
const User = mongoose.model('User', userSchema);

export default User;

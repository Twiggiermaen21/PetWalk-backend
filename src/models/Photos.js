import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
    photo: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
   
}, { timestamps: true });

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;
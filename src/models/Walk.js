import mongoose from "mongoose";

const walkSchema = new mongoose.Schema({
    time: {
        type: Number, // np. czas w sekundach
        required: true,
    },
    speed: {
        type: Number, // np. km/h
        required: true,
    },
    distance: {
        type: Number, // np. w metrach
        required: true,
    },

    path: [
        {
            latitude: {
                type: Number,
                required: true,
            },
            longitude: {
                type: Number,
                required: true,
            },
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    dogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dog",
        required: true
    }],
    photos: [{
        type: String,
        default: ""
    }]
}, { timestamps: true });

const Walk = mongoose.model('Walk', walkSchema);

export default Walk;
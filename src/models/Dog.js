import mongoose from "mongoose";

// Schemat dla psa
const dogSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, // Imię psa jest wymagane
        },
        breed: {
            type: String,
            default: "", // Rasa psa, domyślnie pusta
        },
        weight: {
            type: Number,
            default: 0, // Waga psa, domyślnie 0
        },
        age: {
            type: Number,
            default: 0, // Wiek psa, domyślnie 0
        },
        height: {
            type: Number,
            default: 0, // Wysokość psa, domyślnie 0
        }, dogImage: {
            type: String,
            default: ""
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true

        }
    },
    { timestamps: true } // Dodanie automatycznych timestampów dla każdego dokumentu
);

// Tworzymy model na podstawie schematu
const Dog = mongoose.model("Dog", dogSchema);

export default Dog;

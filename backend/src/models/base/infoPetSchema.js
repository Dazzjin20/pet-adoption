const mongoose = require("mongoose");
const { createPetSchema } = require("./basePet.schema.js");

function createInfoPetSchema() {
  const baseSchema = createPetSchema(); 
  return new mongoose.Schema({
    ...baseSchema.obj,
    status: {
      type: String,
      enum: ["available", "pending"],
      required: true
    },
    pet_type: {
      type: String,
      enum: ["dog", "cat"],
      required: true
    },
    sex: {
      type: String,
      enum: ["female", "male"],
      required: true
    },
    arrival_date: { type: Date, required: true },
    location: { type: String, required: true },
    vaccinated: { type: Boolean, default: false },
    personality: {
      type: String,
      enum: [
        "Friendly",
        "Energetic",
        "Calm",
        "Playful",
        "Shy",
        "Loyal",
        "Independent",
        "Affectionate",
        "Protective",
        "Curious"
      ],
      required: true
    },
    about_pet: { type: String, required: true }
  });
}

const Pet = mongoose.model('Pet', createInfoPetSchema());

module.exports = {
  Pet
};

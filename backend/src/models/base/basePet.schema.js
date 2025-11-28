import mongoose from "mongoose";

export function createPetSchema() {
  return new mongoose.Schema({
    afterImage: { type: String, required: true },
    beforeImage: { type: String, required: true },
    petname: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
  });
}

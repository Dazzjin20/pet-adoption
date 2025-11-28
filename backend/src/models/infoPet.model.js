import mongoose from "mongoose";
import { createInfoPetSchema } from "./infoPet.schema.js";

const InfoPet = mongoose.model("InfoPet", createInfoPetSchema());
export default InfoPet;

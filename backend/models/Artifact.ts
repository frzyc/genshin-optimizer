import mongoose from "mongoose";

export const Artifact = mongoose.model(
  "Artifact",
  new mongoose.Schema({
    database: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Database"
    },
    index: Number,
    name: String,
    uid: Number,
    gender: {
      type: String,
      enum: ["F", "M"],
      default: "F"
    },
  })
);

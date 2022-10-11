import mongoose from "mongoose";

export const Database = mongoose.model(
  "Database",
  new mongoose.Schema({
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

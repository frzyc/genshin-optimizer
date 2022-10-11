import * as dotenv from 'dotenv'
import express from "express";
import mongoose from 'mongoose';
import authRoutes from './routes/api/auth';
import cors from "cors";

dotenv.config()

const app = express();
app.use(cors({ origin: "http://localhost:3000" }))

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Why are you here?" });
});

//auto
authRoutes(app)

// set port, listen for requests
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
})

require("dotenv").config();
const MONGODB_URL = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_DB_HASH}@${process.env.MONGODB_URI}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB}?authSource=${process.env.MONGODB_DB_AUTH}&directConnection=true`;
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const router = require("./router/index");
const cookieParser = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser("secret"));
app.options("*", cors({ origin: true, credentials: true }));
app.use("/api", router);

async function start() {
  console.log("Starting");
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

start();

app.get("/", (req, res) => {
  res.status(200).json("API is running");
});

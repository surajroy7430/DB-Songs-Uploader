require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/db");
const songRouter = require("./routes/song.routes")

const app = express();

app.use(express.json());
app.use(cors());

app.use("/minxs-music", songRouter);
connectToDB();

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(4000, () => console.log(`Server running on port - ${4000}`));

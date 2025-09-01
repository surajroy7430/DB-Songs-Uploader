require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/db");
const songRouter = require("./routes/song.routes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/minxs-music/api", songRouter);

let isDBConnected = false;
const PORT = process.env.PORT || 4000;

connectToDB().then((status) => {
  isDBConnected = status;

  app.listen(PORT, () => console.log(`Server running on port - ${PORT}`));
});

app.get("/", (req, res) => {
  res.send({
    message: `Server running on port - ${PORT}`,
    db: isDBConnected ? "Connected to MongoDB" : "Failed to connect to MongoDB",
  });
});

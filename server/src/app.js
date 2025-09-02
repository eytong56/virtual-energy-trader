import "dotenv/config";
import express from "express";
import bidsRouter from "./routes/bids.js";
import contractsRouter from "./routes/contracts.js";
import settlementsRouter from "./routes/settlements.js";
import pricesRouter from "./routes/prices.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Hello world!"));

// Routes
app.use("/api/bids", bidsRouter);
app.use("/api/contracts", contractsRouter);
app.use("/api/settlements", settlementsRouter);
app.use("/api/prices", pricesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

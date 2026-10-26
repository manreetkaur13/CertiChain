const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CertiChain Backend is running!");
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Backend is working!"
    });
});

app.listen(PORT, () => {
    console.log("CertiChain server running at http://localhost:5000");
});

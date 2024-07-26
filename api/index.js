const express = require("express");
const app = express();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the API!" });
});

app.listen(4444, () => {
  console.log("API server is running on http://localhost:5000");
});

const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(__dirname + "/"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "/") });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

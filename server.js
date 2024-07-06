"use strict";

const app = require("./app");
const { PORT } = require("./config");


app.listen(PORT, function () {
    console.log(`Product_Management Started on http://localhost:${PORT}`);
});
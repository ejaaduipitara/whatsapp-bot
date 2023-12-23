"use strict";
const express = require("express");
require('dotenv').config();
const body_parser = require("body-parser");
const session = require('./session');  // Import session module
const language = require("./language");
// const netcoreRoutes = require("./netcore/routes");
const gupshupRoutes = require("./gupshup/routes");
const app = express(); // creates express http server

app.use(body_parser.json());
app.use(session.init());
language.init();

// Sets server port and logs message on success
let port = process.env.PORT || 3020;
app.listen(port, () => console.log("webhook is listening port:", port));

// Used for Netcore whatsapp integration
// app.use("/netcore", netcoreRoutes);

// Used for Gupsgup whatsapp integration
app.use("/gupshup", gupshupRoutes);

// For Health check
app.get("/health", (req, res) => {
  res.send("Bot is running");
});

app.get("/", function (req, res) {
  res.redirect("/health");
});

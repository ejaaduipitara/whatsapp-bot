"use strict";
const express = require("express");
require('dotenv').config();
const http = require('http')
const body_parser = require("body-parser");
const session = require('./session');  // Import session module
const language = require("./language");
// const netcoreRoutes = require("./netcore/routes");
const gupshupRoutes = require("./gupshup/routes");
const cookieParser = require("cookie-parser");
const loggerPino = require("./logger");

const app = express(); // creates express http server
// app.use(cors());
app.use(body_parser.json());
app.use(cookieParser());
app.use(session.init());
app.use(loggerPino.expressLogger);
language.init();

// Sets server port and logs message on success
let port = process.env.PORT || 3020;
app.listen(port, () => loggerPino.logger.info("webhook is listening port:", port));

// Used for Netcore whatsapp integration
// app.use("/netcore", netcoreRoutes);

// Used for Gupsgup whatsapp integration
app.use("/gupshup", gupshupRoutes);

// For Health check
app.get("/health", (req, res) => {
  res.send("Bot is running");
});

app.get("/", function (req, res) {
  // const ipAddress = req.socket.remoteAddress;
  // logger.info("ipAddress: ", ipAddress);
  res.redirect("/health");
});

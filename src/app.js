"use strict";
const express = require("express");
const http = require('http')
const body_parser = require("body-parser");
const dotenv = require('./dotenv');
const session = require('./session');  // Import session module
const language = require("./language");
// const netcoreRoutes = require("./netcore/routes");
const gupshupRoutes = require("./gupshup/routes");
const gupshupServ = require("./gupshup/service");
const cookieParser = require("cookie-parser");
const loggerPino = require("./logger");
const appConfig = require("./config");

const app = express(); // creates express http server
// app.use(cors());
app.use(body_parser.json());
app.use(cookieParser());
app.use(session.init());
// app.use(loggerPino.logger);
language.init();

// Sets server port and logs message on success
let port = process.env.PORT || 3010;
app.listen(port, () => loggerPino.logger.info("webhook is listening port: %s", port));

// Used for Netcore whatsapp integration
// app.use("/netcore", netcoreRoutes);

// Used for Gupsgup whatsapp integration
// app.use("/gupshup", gupshupRoutes);

/**
 * Webhook for Gupshup use case
 */
app.post("/gupshup/webhook", (req, res) => {
  if(req.body.type === "message") {
    // loggerPino.logger.debug("/webhook: \n%o ", JSON.stringify(req.body));
    gupshupServ.webhook(req, res);
  } else {
    // res.redirect("gupshup/webhook");
    loggerPino.logger.debug("/webhook: Other event !=message");
    res.sendStatus(200);
  }
});

/**
 * Webhook for generic use case
 */
app.post("/webhook", (req, res) => {
  if(req.body.type === "message") {
    // loggerPino.logger.debug("/webhook: \n%o ", JSON.stringify(req.body));
    gupshupServ.webhook(req, res);
  } else {
    // res.redirect("gupshup/webhook");
    loggerPino.logger.debug("/webhook: Other event !=message /n%o", req.body);
    res.sendStatus(200);
  }
});

// For Health check
app.get("/health", (req, res) => {
  res.send(`${appConfig.name} is running.. \n v${appConfig.version}`);
});

app.get("/", function (req, res) {
  // const ipAddress = req.socket.remoteAddress;
  // // logger.info("ipAddress: ", ipAddress);
  res.redirect("/health");
});

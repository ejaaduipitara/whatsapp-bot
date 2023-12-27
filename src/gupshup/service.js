const express = require("express");
const axios = require("axios");
const userSession = require("../session");
const messages = require('./messages');
const inBoundGP = require('./InBound');
// const telemetryService = require('../telemetryService');

let counter = 0;
var isLangSelected, isBotSelected;
// let telemetry = new telemetryService();

const webhook = async (req, res) => {
    let incomingMsg =  new inBoundGP.InBoundGupshup(req.body);
    let msg = incomingMsg;
    
     // To avoid other events coming from webhook of service provider
    // We will allow only user message events and not system geterated(Service provider) events
    if(!msg){
        console.log("XXX no message", msg);
        res.sendStatus(402);
        return;
    } 

    // TODO: Temporary solution to avoid duplicate requests coming from webhook for the same user input
    // Has to find the roor cause, why the same request is coming multiple times
    let oldMsgTs = userSession.getLatestMessageTimestamp(req, res);
    console.log("msg.timestamp:", msg.timestamp);
    if(oldMsgTs === msg.timestamp) {
    //   req.send("Request is already recieved");
      return;
    }

    console.log("Webhook - RawData: ", msg.rawData);
    // telemetry Initializing
    // telemetry.initEvent();
    let isSessionExist = userSession.createSession(req, msg);
    isLangSelected = userSession.getUserLanguage(req, msg);
    isBotSelected = userSession.getUserBot(req, msg);
    
    console.log(`\n req session: ${JSON.stringify(req.session)} `);
    console.log(`languageSelection: ${isLangSelected}, BotSelection: ${isBotSelected}`);
    // WHATSAPP_TO = msg?.from || msg?.recipient_whatsapp;

    if (!isSessionExist || msg?.input?.text === '#') {
        userSession.clearSession(req);
        console.log("👨 First time user");
        // telemetry.startEvent(req, msg);
        messages.sendLangSelection(msg);
        res.sendStatus(200);
    } else if (!isLangSelected || msg?.input?.text === '*') {
        console.log("📚 Language selected");
        userSession.clearSessionBot(req);
        userSession.setUserLanguage(req, msg);
        messages.sendBotSelection(req, msg);
        res.sendStatus(200);
    } else if (!isBotSelected){
        console.log("🤖 Bot selected");
        userSession.setUserBot(req, msg);
        messages.sendBotWelcomeMsg(req, msg);
        res.sendStatus(200);
    } else {
        // existing user & converstaion is happening
        counter++;
        console.log('User query'+ counter);
        await messages.sendBotResponse(req, msg);
        res.sendStatus(200);
    }
    // telemetry.logEvent(req, msg);
}

// For Health check
const test = (req, res) => {
    res.status(200).send('Gupshup service API testing..');
};

// To test Netcore webhook
const testWebhook = (req, res) => {

    let result =  new inBoundGP.InBoundGupshup(req.body);
    console.log("Webhook test: ", JSON.stringify(req.body));
    
     res.send(result);
  };

  module.exports = { webhook, test, testWebhook }
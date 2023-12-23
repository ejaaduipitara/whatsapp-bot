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
    // console.log("IncomingMsg", JSON.stringify(msg));
    
    if(!msg){
        console.log("XXX no message", msg);
        res.sendStatus(402);
        return;
    } 
    // telemetry Initializing
    // telemetry.initEvent();
    let isSessionExist = userSession.createSession(req, msg);
    isLangSelected = userSession.getUserLanguage(req, msg);
    isBotSelected = userSession.getUserBot(req, msg);
    
    console.log(`\n req session: ${JSON.stringify(req.session)} `);
    console.log(`languageSelection: ${isLangSelected}, BotSelection: ${isBotSelected}`);
    // WHATSAPP_TO = msg?.from || msg?.recipient_whatsapp;

    if (!isSessionExist || msg?.type == '#') {
        console.log("👨 First time user");
        // telemetry.startEvent(req, msg);
        messages.sendLangSelection(msg);
        res.sendStatus(200);
    } else if (!isLangSelected || msg?.type == '*') {
        console.log("📚 Language selected");
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
        // res.sendStatus(200);
    }
    // telemetry.logEvent(req, msg);
}

const getBotMessage = async (msg, userSelection) => {
    if (msg) {
        let userQuery = msg.text && msg.text.body ? msg.text.body : "Hi";
        let botUrl = bots[userSelection] + userQuery

        console.log('botURL', botUrl)
        try {
            const { data, status } = await axios({
                "method": "get",
                "url": botUrl
            })
            console.log("getBotMessage => Bot", botUrl, " respond sucessfully");
            return data;
        } catch (error) {
            if (error.response) {
                // The request was made, but the server responded with a status code other than 2xx
                console.error('Server Error:', error.response.status, error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response from server:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error during request setup:', error.message);
            }
        }
    }
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
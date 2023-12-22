const express = require("express");
const axios = require("axios");
const fs = require('fs');
const language = require("../language");
const userSession = require("../session");
const utils = require('./utils');
const messages = require('./messages');
const inBoundGP = require('./InBound');
const botFile = fs.readFileSync('assets/bots.json', 'utf-8');
const telemetryService = require('../telemetryService');
// const footerFile = fs.readFileSync('assets/footer.json', 'utf-8');

const NETCORE_TOKEN = process.env.WA_PROVIDER_TOKEN;

// Read JSON file
const bots = JSON.parse(botFile);
// const footer = JSON.parse(footerFile);

var isLangSelection, isBotSelection;
let telemetry = new telemetryService();

const webhook = async (req, res) => {
    let incomingMsg =  new inBoundGP.InBoundGupshup(req.body);
    console.log("webhook:tt ", incomingMsg);
    // let incomingMsg, msg, toMobile;
    // incomingMsg = req.body?.payload;
    

    // if(!incomingMsg) {
    //     // For interactive message
    //     incomingMsg = req.body?.message;
    //     toMobile = {"recipient_whatsapp": msg?.recipient_whatsapp};
    // } else {
    //    toMobile = {"to": msg?.from}
    // }
    msg = incomingMsg
    // let userSelection = await req?.session?.lang || null;
    console.log("IncomingMsg", JSON.stringify(msg));
    
    if(!msg){
        console.log("XXX no message", msg);
        res.sendStatus(402);
        return;
    } 
    // telemetry Initializing
    telemetry.initEvent()
    userSession.createSession(req, msg);

    isLangSelection = userSession.getUserLanguage(req, msg);
    isBotSelection = userSession.getUserBot(req, msg);
    
    console.log('req session', req.session);
    console.log("languageSelection: ", isLangSelection, ' BotSelection: ', isBotSelection);
    // WHATSAPP_TO = msg?.from || msg?.recipient_whatsapp;

    if (utils.isFirstTimeUser(req,msg) || msg?.type == '#') {
        console.log("First time user");
        telemetry.startEvent(req, msg)
        messages.sendLangSelection(msg);
        res.sendStatus(200);
    } else if (!isLangSelection) {
        console.log("🇮🗣 Language selected");
        userSession.setUserLanguage(req, msg);
        messages.sendBotSelection(req, msg);
        res.sendStatus(200);
    } else if (!isBotSelection){
        console.log("🤖〠 Bot selected");
        userSession.setUserBot(req, msg);
        messages.sendBotWelcomeMsg(req, msg);
        res.sendStatus(200);
    } else {
        // existing user & converstaion is happening
        console.log('User query')
        await messages.sendBotResponse(req, msg);
        
        //Bot response
        // let botResponse = await util.getBotMessage(msg, userSelection);
        // let ansStr = botResponse?.answer.substri,ng(0, 800);

        // let body = {
        //     "messaging_product": "whatsapp",
        //     "to": WHATSAPP_TO,
        //     "text": {
        //         "body": ansStr,
        //     }
        // }
        // await sendMessage(req, res, body);

        res.sendStatus(200);
    }
    telemetry.logEvent(req, msg)

    
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
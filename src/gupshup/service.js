const userSession = require("../session");
const messages = require('./messages');
const inBoundGP = require('./InBound');
const telemetryService = require('../telemetryService');
const { logger } = require("../logger");
const appConfig = require("../config");

let counter = 0;
var isLangSelected, isBotSelected;
let telemetry = new telemetryService();
telemetry.initialize();

const webhook = async (req, res) => {
    let incomingMsg =  new inBoundGP.InBoundGupshup(req.body);
    let msg = incomingMsg;
    
     // To avoid other events coming from webhook of service provider
    // We will allow only user message events and not system geterated(Service provider) events
    if(!msg){
        logger.info("XXXX no message", msg);
        res.sendStatus(402);
        return;
    } 
    logger.debug("Request session: %o", req.session);

    // TODO: Temporary solution to avoid duplicate requests coming from webhook for the same user input
    // Has to find the roor cause, why the same request is coming multiple times
    let userSess = await userSession.createSession(req, msg);

    let oldMsgTs = userSess?.lastestMsgTimestamp; //userSession.getLatestMessageTimestamp(req, res);
    logger.info("msg.timestamp: %s, oldMsgTs: %s", msg.timestamp, oldMsgTs);
    if(oldMsgTs === msg.timestamp) {
      logger.error("Request is already served.  \nmsg: %o , \n DB timestamp: %s", msg, oldMsgTs);
      return;
    }

    logger.debug("Webhook - RawData: %o", msg.rawData);
    // telemetry Initializing
    // let userSess = await userSession.createSession(req, msg);
    logger.info("Webhook - createSession resp: \n%o", userSess)
    let isNewUser = req.session.isNewUser;
    if(userSess) {
        // isLangSelected = userSession.getUserLanguage(req, msg);
        // isBotSelected = userSession.getUserBot(req, msg);
    // // } else {
        isLangSelected = userSess.lang;
        isBotSelected = userSess.bot;
    }
    
    logger.debug(`\n req session: ${JSON.stringify(req.session)} `);
    logger.info(`languageSelection: ${isLangSelected}, BotSelection: ${isBotSelected}`);
    // WHATSAPP_TO = msg?.from || msg?.recipient_whatsapp;
    telemetry.logEvent(req, msg);
    try {
        if(!isLangSelected || !isBotSelected || (msg?.input?.text === '#') || (msg?.input?.text === '*')) {
            logger.debug('msg.type %s', msg.type);
            if(!isLangSelected) { 
                msg.input.text = '#';
            } else if(!isBotSelected) {
                msg.input.text = '*';
            }
            await menuSelection(req, msg);
            if(appConfig.isLocalMode) res.sendStatus(200);
            // existing user & converstaion is happening
        } else {
            counter++;
            logger.info('User query '+ counter);
            if(msg?.type == "button_reply") {
                let selectionType = msg?.input?.context?.type;
                logger.debug('msg.type %s', selectionType);
                switch(selectionType) {
                    case 'lang': sendBotSelection(req, msg); break;
                    case 'bot': sendBotWelcomeMsg(req, msg); break;
                    default: sendLanguageSelection(req, msg);
                }
            } else {
                await messages.sendBotResponse(req, msg);
            }
            if(appConfig.isLocalMode) res.sendStatus(200);
        }
    } catch (error) {
        logger.error(error, "Webhook error:");
    }
}

const menuSelection = (req, msg) => {
    if(msg?.type == "button_reply") {
        let selectionType = msg?.input?.context?.type;
        logger.debug('msg.type %s', selectionType);
        switch(selectionType) {
            case 'lang': sendBotSelection(req, msg); break;
            case 'bot': sendBotWelcomeMsg(req, msg); break;
            default: sendLanguageSelection(req, msg);
        }
    } else if (msg?.input?.text === '#') {
        // userSession.clearSession(req);
        sendLanguageSelection(req, msg);
    } else if ( msg?.input?.text === '*') {
        sendBotSelection(req, msg);
    }  
}

const sendLanguageSelection = (req, msg) => {
    logger.info("👨 First time user");
    telemetry.startEvent(req, msg);
    messages.sendLangSelection(msg);
}

const sendBotSelection = (req, msg) => {
    logger.info("📚 Language selected");
    // userSession.clearSessionBot(req);
    userSession.setUserLanguage(req, msg);
    messages.sendBotSelection(req, msg);
}

const sendBotWelcomeMsg = (req, msg) => {
    logger.info("🤖 Bot selected");
    userSession.setUserBot(req, msg);
    messages.sendBotWelcomeMsg(req, msg);
}

// For Health check
const test = (req, res) => {
    res.status(200).send('Gupshup service Aenv testing..');
};

// To test Netcore webhook
const testWebhook = (req, res) => {

    let result =  new inBoundGP.InBoundGupshup(req.body);
    // logger.info("Webhook test: ", JSON.stringify(req.body));
     res.send(result);
  };

  module.exports = { webhook, test, testWebhook }
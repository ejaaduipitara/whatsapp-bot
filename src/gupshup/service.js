const userSession = require("../session");
const messages = require('./messages');
const inBoundGP = require('./InBound');
const telemetryService = require('../telemetryService');
const { logger } = require("../logger");
const appConfig = require("../config");
const { UserSqr } = require("../database/Models");
const { getLang } = require("../language");

let counter = 0;
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

    // TODO: Temporary solution to avoid duplicate requests coming from webhook for the same user input
    // Has to find the roor cause, why the same request is coming multiple times
    let userSess = await UserSqr.findByPk(msg?.userId);
    let oldMsgTs = userSess?.lastestMsgTimestamp;
    logger.debug("Webhook - RawData: %o", msg.rawData);
    logger.info("msg.timestamp: %s, oldMsgTs: %s", msg.timestamp, oldMsgTs);
    if(oldMsgTs && isAlreadyServed(msg.timestamp, oldMsgTs)) {
        logger.warn("Request is already served.");
        res.sendStatus(403);
        return;
    }
    
    userSess = await userSession.createSession(req, msg);
    // telemetry Initializing
    // let userSess = await userSession.createSession(req, msg);
    logger.info("Webhook - createSession resp: \n%o", userSess);
    let isNewUser = userSess ? false : true;
    let isLangSelected, isBotSelected;
    if(userSess) {
        logger.debug("isLangSelected: %s, isBotSelected: %s", userSess.lang, userSess.bot);
        isLangSelected = userSess.lang;
        isBotSelected = userSess.bot;
    }
    
    // logger.debug(`\n req session: ${JSON.stringify(req.session)} `);
    // logger.info(`languageSelection: ${isLangSelected}, BotSelection: ${isBotSelected}`);
    telemetry.logEvent(req, msg);
    try {
        var regex=/^[0-9]+$/; 
        isNumber = regex.test(msg?.input?.text);
        if(isNumber|| !isLangSelected || !isBotSelected || (msg?.input?.text === '#') || (msg?.input?.text === '*')) {
            logger.debug('msg.type %s', msg.type);
            if(!isLangSelected && !isNumber) { 
                // First time user typed "hi" or any message send him lang selection
                msg.input.text = '#';
            } else if(!isBotSelected && !isNumber) {
                // User has not selected the bot still, but user entered some message then ask him to select the bot
                msg.input.text = '*';
            }
            await menuSelection(req, msg);
            if(appConfig.isLocalMode) res.sendStatus(200);
            // existing user & converstaion is happening
        } else {
            counter++;
            // logger.info('User query '+ counter);
            if(msg?.type == "button_reply") {
                
                let selectionType = msg?.input?.context?.type;

                // TODO: Temp solution for other languages, button_reply is got giving the right "id"
                let btnPostBackText = msg?.input?.context?.id;
                if(btnPostBackText && btnPostBackText.includes("bot__")) {
                    selectionType = "bot";
                } else if(btnPostBackText == "#" || btnPostBackText == "*") {
                    selectionType = btnPostBackText;
                }

                logger.debug('msg.type %s', selectionType);
                switch(selectionType) {
                    case 'lang': sendBotSelection(req, msg); break;
                    case 'bot': sendBotWelcomeMsg(req, msg); break;
                    case '#': sendLanguageSelection(req, msg); break;
                    case '*': sendBotSelection(req, msg); break;
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

/**
 * To check the inComing message is already served & stored in the DB
 * @param {miliseconds} curMsgTs 
 * @param {miliseconds} oldMsgTs 
 * @returns {boolean} alreadyServed
 */
const isAlreadyServed = (curMsgTs, oldMsgTs) => {
    let alreadyServed = false;
    if((curMsgTs>oldMsgTs)) {
        alreadyServed = false;
    } else {
        alreadyServed = true;
    }
    // logger.info("Message is already served %s", alreadyServed.toString());
    return alreadyServed;
}

const menuSelection = (req, msg) => {
    logger.info("Menu Selection of \n%o", msg);
    if(msg?.type == "button_reply") {
        let selectionType = msg?.input?.context?.type;
        // logger.debug('msg.type %s', selectionType);
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
    } else {
        // If user is sending the language selection as seq number (text input);
        let selLang = getLang(msg?.input?.text);
        if(selLang) {
            msg.input.text = selLang.text;
            msg.input.context = {type: "lang", id: "lang__"+selLang.code };
            logger.info("User selected lang after mapping to input text: \n%o", msg);
            sendBotSelection(req, msg);
        }
        // Check the user selected lanauge "seq" optioin number
    }
}

const sendLanguageSelection = (req, msg) => {
    logger.info("👨 Show langauge selection message");
    telemetry.startEvent(req, msg);
    messages.sendLangSelection(msg);
}

const sendBotSelection = (req, msg) => {
    // logger.info("📚 Language selected");
    // userSession.clearSessionBot(req);
    userSession.setUserLanguage(req, msg);
    messages.sendBotSelection(req, msg);
}

const sendBotWelcomeMsg = (req, msg) => {
    // logger.info("🤖 Bot selected");
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
    // // logger.info("Webhook test: ", JSON.stringify(req.body));
     res.send(result);
  };

  module.exports = { webhook, test, testWebhook }
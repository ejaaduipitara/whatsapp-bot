const axios = require("axios");
const botMessage = require("./botMessage");
const util = require("./util");
const language = require("./language");
const session = require("./session");


// Read JSON file
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_VERSION = process.env.WHATSAPP_VERSION;
const WHATSAPP_PHONEID = process.env.WHATSAPP_PHONEID;
var WHATSAPP_TO = process.env.WHATSAPP_TO;

let isLangSelection, isBotSelection;

const testMessage = (req, res) => {
    console.log(req.body);
    let messageObj = req.body;
    sendMessage(req, res, messageObj);
  
}

const webhook = async (req, res) => {
    let incomingMsg = req.body.entry || {};
    let languageSelection = await req?.session?.languageSelection || null;
    let userSelection = await req?.session?.userSelection || null;
    
    
    let msg = incomingMsg && incomingMsg[0] && incomingMsg[0].changes && incomingMsg[0].changes[0].value.messages && incomingMsg[0].changes[0].value.messages[0];
    
    
    if(!msg){
      res.sendStatus(200);
      return;
    } 
  
  
     console.log("IncomingMsg", JSON.stringify(incomingMsg));
     if(msg?.type === 'interactive') {
       isLangSelection = session.getUserLanguage(req, msg);
       isBotSelection = session.getUserBot(req, msg);
     } else {
       Object.assign(msg, {context: incomingMsg[0].changes[0].value.metadata});
     }
  
    console.log('req session', req.session);
    console.log("languageSelection: ", isLangSelection, ' userSelection: ', isBotSelection);
    WHATSAPP_TO = msg?.from ;
    if (((!isLangSelection && !isBotSelection && (msg?.type === 'text')) || msg?.text?.body == '#')) {
        console.log("First time user");
        let body = language.getLangSelection(); //botMessage.getBotMessage('en', null, "lang_selection");
        body.to = WHATSAPP_TO;
        sendMessage(req, res, body)
        // req.session.languageSelection = null
        // req.session.userSelection = null

    } else if ((!isLangSelection && (msg?.type === 'interactive') || msg?.text?.body == '*')) {
         console.log("Language selection");
        session.setUserLanguage(req, msg);
        let body = botMessage.getBotSelection(req.session.languageSelection);
        body.to = WHATSAPP_TO;
        sendMessage(req, res, body)
    } else if (!isBotSelection && msg?.type === 'interactive') {
        console.log("Bot selection");
          session.setUserBot(req, msg);
          let message = botMessage.getBotWelcomeMessage(req.session.languageSelection, req.session.userSelection);

          let body = {
              "messaging_product": "whatsapp",
              "to": WHATSAPP_TO,
              "text": {
                  "body": message,
              }
          }
          sendMessage(req, res, body);
    } else {
            // existing user & converstaion is happening
            console.log('User query')
            // userSelection = util.setUserSelection(req, msg?.interactive?.button_reply?.id, userSelection)
            let langKey = session.getUserLanguage(req, msg) || 'en';

            //Loading
            let loadingBody = botMessage.getBotMessage(langKey, null, "loading_message");
            loadingBody.to = WHATSAPP_TO;
            await sendMessage(res, res, loadingBody);

            //Bot response
            let botResponse = await util.getBotMessage(msg, userSelection);
            let ansStr = botResponse?.answer.substring(0, 800);

            let body = {
                "messaging_product": "whatsapp",
                "to": WHATSAPP_TO,
                "text": {
                    "body": ansStr,
                }
            }
            await sendMessage(req, res, body);

            //Footer message
            let footerBody = botMessage.getBotMessage(langKey, null, "footer_message");
            footerBody.to = WHATSAPP_TO;
            await sendMessage(req, res, footerBody);
            // }
        // } else {
        //     let body = botMessage.getBotMessage(langKey, null, "bot_selection");
        //     body.to = WHATSAPP_TO;
        //     sendMessage(req, res, body)
        // }
    }
}

const getMessage = (req) => {
    return 
}

const sendMessage = async (req, res, body) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONEID}/messages`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                }
            }
        );
        console.log("webhook => Sent message to WhatsApp");
        res.status(response.status).send(response.statusText);
    } catch (error) {
        //  console.log("webhook => error occurred with status code:", error?.response?.status);
        res.status(error?.response?.status).send(error?.response?.statusText);
    }
}

module.exports = { sendMessage, webhook, testMessage }
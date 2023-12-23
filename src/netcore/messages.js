const language = require("../language");
const userSession = require("../session");
// const utils = require('./utils');
const axios = require("axios");
const botMessage = require('../botMessage');

const NETCORE_TOKEN = process.env.WA_PROVIDER_TOKEN;

/**
 * First message to the user
 * Welcome messsage along with Language selection
 * @param {*} incomingMsg 
 */
const sendLangSelection = (incomingMsg) => {
    let langSelecBody = language.getLangSelection();
    sendMessage(langSelecBody, incomingMsg);
}

/**
 * Send bot selction options to the user 
 * In the user selected language
 * @param {*} req 
 * @param {*} msg 
 */
const sendBotSelection = (req, msg) => {
    console.log("⭆ sendBotSelection"); 
    let body = botMessage.getBotSelection(userSession.getUserLanguage(req, msg));
    sendMessage(body, msg);
}

/**
 * Send welcome message for the selected bot 
 * In the user selected language
 * @param {*} req 
 * @param {*} msg 
 */
const sendBotWelcomeMsg = (req, msg) => {
    console.log("⭆ sendBotWelcomeMsg"); 
    let userLang = userSession.getUserLanguage(req, msg);
    let userBot = userSession.getUserBot(req, msg);
    let body = botMessage.getBotMessage(userLang, userBot, 'hi');
    sendMessage(body, msg);
}

/**
 * Send Bot response for the user query
 * @param {*} req 
 * @param {*} msg 
 */
const sendBotResponse = async (req, msg) => {
    console.log("⭆ sendBotResponse"); 
    let userLang = userSession.getUserLanguage(req, msg);
    let userBot = userSession.getUserBot(req, msg);

    await sendBotLoadingMsg(req, msg, userLang, userBot);
    await sendBotAnswer(req, msg, userLang, userBot);
    await sendBotReplyFooter(req, msg, userLang, userBot);
}

/**
 * Loading message while getting the response from the Bot
 * @param {*} userLang 
 * @param {*} userBot 
 */
const sendBotLoadingMsg = async(req, msg, userLang, userBot) => {
    let body = botMessage.getBotMessage(userLang, null, 'loading_message');
    await sendMessage(body, msg);
}

const sendBotAnswer = async (req,msg,userLang, userBot) => {
    console.log("⭆ sendBotAnswer"); 
    console.log('msgcheck',JSON.stringify(msg))
    let bodyMessage = botMessage.getBotMessage('en',null, 'bot_answer');
    console.log('botbody',JSON.stringify(bodyMessage));
    await fetchQueryRespone()
  .then(queryResponse => {
    bodyMessage.message.forEach(msg=> {
        msg.type_text.forEach(text => {
      text.content = queryResponse?.output?.text;
    })
    sendMessage(bodyMessage, msg);
    console.log('responsedata',JSON.stringify(bodyMessage))
})
  })
  .catch(err => {
    console.error('Error in fetchQueryRespone:', err);
  });
}
/**
 * Footer options for Bot response message
 * "*" to go main menu & "#" to go language selection
 * @param {*} userLang 
 * @param {*} userBot 
 */
const sendBotReplyFooter = async(req, msg, userLang, userBot) => {
    let body = botMessage.getBotMessage(userLang, null, 'footer_message');
    await sendMessage(body, msg);
}


const sendMessage = async (body, incomingMsg) => {
    body = JSON.stringify(setMessageTo(body, incomingMsg));
    console.log("SendMessage: ", body);
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://cpaaswa.netcorecloud.net/api/v2/message/nc',
            headers: { 
              'Authorization': `Bearer ${NETCORE_TOKEN}`, 
              'Content-Type': 'application/json'
            },
            data : body
          };
        const request = await axios.request(config);
        request
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log("webhook => error occurred with status code:", error.response);
    }
     
}

const setMessageTo = (body, incomingMsg) => {
    if(body.incoming_message) {
        body.incoming_message[0].to = incomingMsg.from;
    } else {
        body.message[0].recipient_whatsapp = incomingMsg.from;
    }

    return body;
}

const fetchQueryRespone = async (body, incomingMsg) => {
    console.log("⭆ fetchQueryRespone"); 
    console.log('fetchQueryRespone--invmsg', incomingMsg);
    let data = {
      "input": {
        "language": "en",
        "text": "A lion story",
        "audienceType": "any"
      },
      "output": {
        "format": "audio"
      }
    };
  
    var axiosConfig = {
      method: 'POST',
      url: 'http://144.24.130.223:7081/v1/query',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer'
      },
      data: data
    };
  
    try {
      const response = await axios(axiosConfig);
      console.log('Telemetry request successful:', response.data);
      return response.data; // Resolve the promise with response data
    } catch (error) {
      console.error('Telemetry request failed:', error);
      throw error; // Throw an error to handle it wherever the function is called
    }
};

module.exports = { sendLangSelection, sendBotSelection, sendBotWelcomeMsg, sendMessage, sendBotResponse ,fetchQueryRespone,sendBotAnswer}
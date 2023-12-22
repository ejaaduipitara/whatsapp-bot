const language = require("../language");
const userSession = require("../session");
// const utils = require('./utils');
const axios = require("axios");
const botMessage = require('../botMessage');
const qs = require('qs');


const WA_PROVIDER_TOKEN = process.env.WA_PROVIDER_TOKEN;
const BOT_SERVICE_URL = process.env.BOT_SERVICE_URL;
const BOT_API_TOKEN = process.env.BOT_API_TOKEN;
const audienceMap = {
  'bot_1': 'any',
  'bot_2': 'Teacher',
  'bot_3': 'Parent'
};
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
  let body = botMessage.getBotMessage(userLang, userBot, 'Welcome');
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
const sendBotLoadingMsg = async (req, msg, userLang, userBot) => {
  let body = botMessage.getBotMessage(userLang, userBot, 'loading_message');
  await sendMessage(body, msg);
}

const sendBotAnswer = async (req, msg, userLang, userBot) => {
  console.log("⭆ sendBotAnswer");
  console.log('msgcheck', JSON.stringify(msg))
  const messageType = msg?.type === 'text' ? 'bot_answer_text' : 'bot_answer_audio';
  const bodyMessage = botMessage.getBotMessage(userLang, userBot, messageType);
  console.log('botbody', JSON.stringify(bodyMessage));
  await fetchQueryRespone(req, msg, userLang, userBot)
    .then(queryResponse => {
      bodyMessage.message.text = queryResponse?.output?.text;
    })
  sendMessage(bodyMessage, msg);
  console.log('responsedata', JSON.stringify(bodyMessage))
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
const sendBotReplyFooter = async (req, msg, userLang, userBot) => {
  let body = botMessage.getBotMessage(userLang, userBot, 'footer_message');
  await sendMessage(body, msg);
}


const sendMessage = async (body, incomingMsg) => {
  body = setMessageTo(body, incomingMsg);
  body.message = JSON.stringify(body.message);
  // console.log('sendmsg1', body);
  let data = qs.stringify(body);
  // console.log('sendmsg', data);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.gupshup.io/wa/api/v1/msg',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'apiKey': WA_PROVIDER_TOKEN,
      'cache-control': 'no-cache'
    },
    data: data
  };

  axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      // console.log(error);
    });

}

const setMessageTo = (body, incomingMsg) => {

  if (incomingMsg.fromMobile) {
    body.destination = incomingMsg?.fromMobile;
    console.log("⭆ setMessageTo", JSON.stringify(body.destination));

  } else {
    body.destination = incomingMsg?.rawData?.payload?.sender?.phone;
    console.log("⭆ setMessageTo2", JSON.stringify(body.destination));
  }

  return body;
}
/**
 * @description Fetches query response data based on provided parameters.
 * @param {Object} req - The request object.
 * @param {Object} msg - The message object.
 * @param {string} userLang - The user language.
 * @param {string} userBot - The user bot identifier.
 * @returns {Promise<Object>} - A promise resolving to the response data.
 */
const fetchQueryRespone = async (req, msg, userLang, userBot) => {
  console.log("⭆ fetchQueryRespone");
  let audienceCheck = audienceMap[userBot] || 'any';
  // console.log('fetchQueryRespone--invmsg', incomingMsg);
  let data = {
    "input": {
      "language": userLang,
      "audienceType": audienceCheck
    },
    "output": {
      "format": "audio"
    }
  };
  if (msg?.type === "text" || msg?.type === "audio") {
    data.input[msg.type] = msg?.input?.[msg.type];
  }
  console.log('acxoios', data)
  var axiosConfig = {
    method: 'POST',
    url: BOT_SERVICE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': BOT_API_TOKEN

    },
    data: data
  };
  console.log('acxoios', axiosConfig)

  try {
    const response = await axios(axiosConfig);
    console.log('Telemetry request successful:', response.data);
    return response.data; // Resolve the promise with response data
  } catch (error) {
    // console.error('Telemetry request failed:', error);
    throw error; // Throw an error to handle it wherever the function is called
  }
};

module.exports = { sendLangSelection, sendBotSelection, sendBotWelcomeMsg, sendMessage, sendBotResponse, fetchQueryRespone, sendBotAnswer }
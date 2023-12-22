const session = require('express-session');

const inMemoryStore = {};
const sessionLangKey = "lang";
const sessionBotKey = "bot";
var isLangSelection, isBotSelection;

// const PROPERTIES = {
//   ""
// }


const init = () => {
  return session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
   // cookie: { secure: true, sameSite: true, maxAge: 60000 }
});
  
  console.log("Session init called.");
}

/**
 * Returns user session id based of incoming message data
 * @param {*} incomingMsg 
 * @returns 
 */
const getUserSessionId = (incomingMsg) => {
  return "user0623"
}

const createSession = (req, incomingMsg) => {
  // inMemoryStore[id]
  let sessionId = req?.session?.sessionId;
  if(!sessionId) {
    sessionId = getUserSessionId(incomingMsg);
    req.session.sessionId = sessionId;
    console.log("✅ new session created: ", sessionId);
  } else {
    console.log("✓ session already exist: ", sessionId);
  }
}

const setUserLanguage = (req, msg) => {
    console.log("⭆ setUserLanguage: ", msg);
    
    let userReplyBtnId = msg?.input?.context?.id;
    let selLang =  userReplyBtnId && userReplyBtnId.includes(sessionLangKey) && userReplyBtnId?.split('__')[1]
    console.log('User selected Language: ',selLang)

    if (selLang) {
        // If not present, set the default value from the incoming message
        req.session[sessionLangKey] = selLang;
        console.log(`✅ Language set ${selLang}, req session`, req.session);
    } else {
        console.log('❌ User selection lang: ', msg?.payload?.postbackText);
        // if (id && languageSelection !== id && id.includes('lan')) {
        //     req.session.languageSelection = id;
        //     console.log('Updated languageSelection:', id);
        // }
    }
    return selLang;
}

const getUserLanguage = (req, msg) => {
  let lang = req?.session[sessionLangKey];
  // if(!lang) lang = 'en';  // default lang "en"
  return lang;
} 

const setUserBot = (req, msg) => {
  console.log("⭆ setUserBot:",  msg?.input?.context?.id);
  let userReplyBtnId = msg?.input?.context?.id;

  let botId =  userReplyBtnId && userReplyBtnId.includes(sessionBotKey) && userReplyBtnId?.split('__')[1]
    
  // let botId = msg?.interactive?.button_reply?.id && msg?.interactive?.button_reply?.id.includes('bot') && msg?.interactive?.button_reply?.id?.split('__')[1]
   if (botId) {
        // If not present, set the default value from the incoming message
        // userSelection = id;
        // isBotSelection = botId;
        req.session[sessionBotKey] = botId;
     
       
        // var memUserSes = getSession(req, msg);
        // memUserSes.userSelection = botId;
        // Object.assign(inMemoryStore, memUserSes);
        // console.log("=== setSession: ", memUserSes);
       
        // console.log('Session - User selected bot: ', botId);
        // console.log('req session', req.session);
        console.log(`✅ User selected bot ${botId}, req session`, req.session);
      } else {
        console.log('❌ User selection bot: ', msg?.rawData?.payload?.postbackText);
        // if (id && userSelection !== id) {
        //     req.session.userSelection = id;
        //     console.log('Updated userSelection:', id);
        // }
    }
  return botId;
} 

const getUserBot = (req, msg) => {
  return req?.session[sessionBotKey];
} 

const getAudience = (req) => {
  return "any";
}

const getSession = (req, msg) => {
  var userSesKey = 'user'+ (msg?.context?.from || msg?.context?.display_phone_number);
  // let userSes = inMemoryStore[userSesKey];
  // if(!userSes) {
    
  //   userSes = {};
  //   userSes[userSesKey] = {}
  //   Object.assign(inMemoryStore, userSes);
  //   console.log("XXX getSession:", userSes);
  // }
  
  // console.log("=== getSession: ", inMemoryStore);
  return req.session;
}

module.exports = {init, getUserLanguage, setUserLanguage, setUserBot, getUserBot, createSession }
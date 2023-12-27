// const session = require('express-session');
// const pgSession = require('connect-pg-simple')(session);
// const Pool = require('pg');
 
// const pool = new Pool({
//   host: 'localhost',
//   user: 'postgres',
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// })

// const POSTGRES_URL = process.env.POSTGRES_URL;
// const sessionStore = new pgSession({
//   tableName : 'session',
//   conString: POSTGRES_URL,
// });
const database = require("./database");
const inMemoryStore = {};
const sessionLangKey = "lang";
const sessionBotKey = "bot";
const sessionlatestMsgTimestamp = "msgTimestamp";
var deafultSession = {};

var sampleMobile = "910000000000";
var sampleUserName= "ejpu";// ejp user

const init = () => {
  console.log("Session init called.");
  return database.init();
}

/**
 * Returns user session id based of incoming message data
 * @param {*} incomingMsg 
 * @returns 
 */
const getUserSessionId = (incomingMsg) => {
    let shortUserName, shortRandMobile;
   
    try {
      console.log(incomingMsg.userName, incomingMsg.fromMobile);
      shortUserName = incomingMsg.userName.replace(/ /g, '').toLowerCase().substr(0,4)
      let randMobile = (Number(incomingMsg.fromMobile)*2014).toString(); 
      shortRandMobile = randMobile.substring(randMobile.length-4, randMobile.length);
      // shortRandMobile = (Number(incomingMsg.fromMobile)*2014).toString().substring(0,4)
      return shortUserName+shortRandMobile;
    } catch (err) {
      console.log(`Generating default: `)
      shortUserName = sampleUserName.replace(/ /g, '').toLowerCase().substr(0,4)
      let randMobile = (Number(sampleMobile)*2014).toString(); 
      shortRandMobile = randMobile.substring(randMobile.length-4, randMobile.length);
      // shortRandMobile = (Number(sampleMobile)*2014).toString().substring(0,4)
      return shortUserName+shortRandMobile;
    }
}

const createSession = async (req, incomingMsg) => {
  // inMemoryStore[id]
  // console.log("req session:", req.session);
  let sessionId = req?.session?.sessionId || deafultSession.sessionId;

  if(!sessionId) {
    sessionId = getUserSessionId(incomingMsg);
    // TODO: temporary solution
    deafultSession.sessionId = sessionId;
    deafultSession[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    
    req.session.sessionId = sessionId;
    req.session[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    // console.log("req session:", req);
    console.log("✅ new session created: ", sessionId, ", sessionID:", req.sessionID);
    let userSess = await database.updateUid(req, sessionId);
    // console.log("User Session", userSess);
    return false;
  } else {
    // console.log("req session:", req);
    req.session[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    deafultSession[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    let getSessionQuery = {
      text: 'SELECT * from session WHERE uid = $1',
      values: [sessionId]
    }
    let userSess = await database.query(getSessionQuery);
  
    console.log("User Session", userSess);
    console.log("✓ session already exist: ", sessionId, ", sessionID:", req.sessionID);
    return true;
  }
}

const setUserLanguage = (req, msg) => {
    console.log("⭆ setUserLanguage");
    
    let userReplyBtnId = msg?.input?.context?.id;
    console.log("userReplyBtnId: ",userReplyBtnId, "btn_reply: ", msg?.input);
    let selLang =  userReplyBtnId && userReplyBtnId.includes(sessionLangKey) && userReplyBtnId?.split('__')[1]
    // console.log('User selected Language: ', selLang)

    if (selLang) {
        // If not present, set the default value from the incoming message
        req.session[sessionLangKey] = selLang;
        deafultSession[sessionLangKey] = selLang;
        console.log(`✅ Language set ${selLang}, req session`);
    } else {
        console.log('✓ User selected lang: ', req.session[sessionLangKey]);
        // if (id && languageSelection !== id && id.includes('lan')) {
        //     req.session.languageSelection = id;
        //     console.log('Updated languageSelection:', id);
        // }
    }
    return selLang;
}

const getUserLanguage = (req, msg) => {
  let lang = req?.session[sessionLangKey] || deafultSession[sessionLangKey];
  return lang;
} 

const setUserBot = (req, msg) => {
  console.log("⭆ setUserBot:",  msg?.input?.context?.id);
  let userReplyBtnId = msg?.input?.context?.id;

  let botId =  userReplyBtnId && userReplyBtnId.includes(sessionBotKey) && userReplyBtnId?.split('__')[1]
    
  if (botId) {
      req.session[sessionBotKey] = botId;
    deafultSession[sessionBotKey] = botId;
      console.log(`✅ User selected bot ${botId}, req session`, req.session);
  } else {
      console.log('✓ User selected bot: ', req.session[sessionBotKey]);
  }
  return botId;
} 

const getUserBot = (req, msg) => {
  let userSelectedBotId = req?.session[sessionBotKey] || deafultSession[sessionBotKey];
  return userSelectedBotId;
} 

/**
 * Clear session object
 * @param {*} req 
 */
const clearSession = (req) => {
  let clearLang = undefined;
  if(req?.session) req.session[sessionLangKey] = clearLang;
  deafultSession[sessionLangKey] = clearLang;

  let clearBot = undefined;
  if(req?.session) req.session[sessionBotKey] = clearBot;
  deafultSession[sessionBotKey] = clearBot;
}

const clearSessionBot = (req) => {
  let clearBot = undefined;
  if(req?.session) req.session[sessionBotKey] = clearBot;
  deafultSession[sessionBotKey] = clearBot;
}

const getSession = (req, msg) => {
  var userSesKey = 'user'+ (msg?.fromMobile);
  const query = {
    // give the query a unique name\
    text: 'SELECT * FROM session',
  }
  return req.session;
}

const getLatestMessageTimestamp = (req, res) => {
  console.log("Session ts:",deafultSession[sessionlatestMsgTimestamp]);
  return deafultSession[sessionlatestMsgTimestamp];
}

module.exports = {init, getUserLanguage, setUserLanguage, setUserBot, getUserBot, createSession, clearSession, clearSessionBot, getLatestMessageTimestamp }
const database = require("./database");
const { logger } = require("./logger");

const inMemoryStore = {};
const sessionLangKey = "lang";
const sessionBotKey = "bot";
const sessionlatestMsgTimestamp = "msgTimestamp";
var deafultSession = {};
const mobileMult = 2013;
var sampleMobile = "910000000000";
var sampleUserName= "ejpu";// ejp user

const init = () => {
  logger.info("Session init called.");
  return database.init();
}

/**
 * Returns user session id based of incoming message data
 * @param {*} incomingMsg 
 * @returns 
 */
const getUseruid = (incomingMsg) => {
    let shortUserName, shortRandMobile;
   
    try {
      logger.debug(incomingMsg.userName, incomingMsg.fromMobile);
      shortUserName = incomingMsg.userName.replace(/ /g, '').toLowerCase().substr(0,4);
      let randMobile = (Number(incomingMsg.fromMobile)*mobileMult).toString(); 
      shortRandMobile = randMobile.substring(randMobile.length-4, randMobile.length);
      return shortUserName+shortRandMobile;
    } catch (err) {
      logger.warn(`Generating default userId: `);
      shortUserName = sampleUserName.replace(/ /g, '').toLowerCase().substr(0,4);
      let randMobile = (Number(sampleMobile)*mobileMult).toString(); 
      shortRandMobile = randMobile.substring(randMobile.length-4, randMobile.length);
      return shortUserName+shortRandMobile;
    }
}

const createSession = async (req, incomingMsg) => {
  // inMemoryStore[id]
  // logger.info("req session:", req.session);
  // let uid = req?.session?.userId || deafultSession.userId;
  let uid = getUseruid(incomingMsg);
  let userSess = await database.getData(uid);
  logger.debug("User Session %o", userSess);
  if(userSess?.sid != req.sessionID) {
    // TODO: temporary solution
    deafultSession.userId = uid;
    deafultSession[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    
    req.session.userId = uid;
    req.session.isNewUser = true;
    req.session[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    // logger.info("req session:", req);
    logger.info(`✅ new session created: \n %o`, req.session);
    // let userSess = await database.updateUid(req, uid);
    // logger.debug("User Session", userSess);
    return userSess;
  } else {
    logger.info(`✓ session already exist - DB resp \n %o`, userSess);
    req.session.isNewUser = false;
    req.session[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    deafultSession[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    return userSess;
  }
}

const setUserLanguage = (req, msg) => {
    logger.debug("⭆ setUserLanguage");
    
    let userReplyBtnId = msg?.input?.context?.id;
    logger.info(`userReplyBtnId:${userReplyBtnId}, btn_reply: ${msg?.input}`);
    let selLang =  userReplyBtnId && userReplyBtnId.includes(sessionLangKey) && userReplyBtnId?.split('__')[1]
    // logger.info('User selected Language: ', selLang)

    if (selLang) {
        // If not present, set the default value from the incoming message
        req.session[sessionLangKey] = selLang;
        deafultSession[sessionLangKey] = selLang;
        logger.info(`✅ Language set ${selLang}: %o`, req.session);
    } else {
        logger.debug('✓ User selected lang: %o', req.session[sessionLangKey]);
        // if (id && languageSelection !== id && id.includes('lan')) {
        //     req.session.languageSelection = id;
        //     logger.info('Updated languageSelection:', id);
        // }
    }
    return selLang;
}

const getUserLanguage = (req, msg) => {
  let lang = req?.session[sessionLangKey] || deafultSession[sessionLangKey];
  return lang;
} 

const setUserBot = (req, msg) => {
  logger.debug("⭆ setUserBot: %s",  msg?.input?.context?.id);
  let userReplyBtnId = msg?.input?.context?.id;

  let botId =  userReplyBtnId && userReplyBtnId.includes(sessionBotKey) && userReplyBtnId?.split('__')[1]
    
  if (botId) {
      req.session[sessionBotKey] = botId;
    deafultSession[sessionBotKey] = botId;
      logger.info(`✅ User selected bot ${botId} req session %o`, req.session );
  } else {
      logger.debug('✓ User selected bot: %s', req.session[sessionBotKey]);
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
  logger.debug("Session ts:", deafultSession[sessionlatestMsgTimestamp]);
  return deafultSession[sessionlatestMsgTimestamp];
}

module.exports = {init, getUserLanguage, setUserLanguage, setUserBot, getUserBot, createSession, clearSession, clearSessionBot, getLatestMessageTimestamp }
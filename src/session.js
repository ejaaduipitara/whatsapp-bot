const { UserModel, User, UserSqr } = require("./database/Models");
const database = require("./database/database");
const { logger } = require("./logger");
const sessionLangKey = "lang";
const sessionBotKey = "bot";
const sessionlatestMsgTimestamp = "lastestMsgTimestamp";
// var deafultSession = {};
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

    if(incomingMsg?.userName){
      try {
        logger.debug("getUserId: %s %s ", incomingMsg.userName, incomingMsg.fromMobile);
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
    
}

const createSession = async (req, incomingMsg) => {
  // logger.info("req session:", req.session);
  // let uid = req?.session?.userId || deafultSession.userId;
  let uid = getUseruid(incomingMsg);
  if(!uid) return;

  // let userSess = await database.getData(uid);
  let userSess = await UserSqr.findByPk(uid);
  logger.debug("User data from DB \n %o", userSess);
  if(!(userSess?.userId)) {
    // let userData = await UserSqr.findOne({where: {userId: uid}});
    // if(!userData) {
      logger.warn("User not exist: %s", uid);
      UserSqr.create({userId: uid, [sessionlatestMsgTimestamp]: incomingMsg?.timestamp });
    // }
    
    req.session.userId = uid;
    req.session.isNewUser = true;
    req.session[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    // logger.info("req session:", req);
    logger.info(`✅ new session created: \n req.sessionID: %s \n Session: %o`, req.sessionID, req.session);
    // logger.debug("User Session", userSess);
    return userSess;
  } else {
    await UserSqr.update({ [sessionlatestMsgTimestamp]: incomingMsg?.timestamp }, {where: {userId: req.sessionID}}).then(resp => {
      logger.info("UserModel Lang Save Success %o", JSON.stringify(resp));
    });
    logger.info(`✓ session already exist - DB resp \n req.sessionID: %s \n %o`, req.sessionID, userSess);
    
    req.session.userId = userSess.userId;
    req.session.isNewUser = false;
    req.session[sessionLangKey] = userSess[sessionLangKey];
    req.session[sessionBotKey] = userSess[sessionBotKey];
    req.session[sessionlatestMsgTimestamp] = incomingMsg?.timestamp;
    
    logger.info(`Updated session data: \n %o`, req.session);
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
        // UserModel.update({[sessionLangKey]: selLang}, {userId: msg.userId});
        
        UserSqr.update({[sessionLangKey]: selLang}, {where: {userId: req.sessionID}}).then(resp => {
            logger.info("UserModel Lang Save Success %o", JSON.stringify(resp));
        });
        req.session[sessionLangKey] = selLang;
        // deafultSession[sessionLangKey] = selLang;
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
  // let lang = req?.session[sessionLangKey] || deafultSession[sessionLangKey];
  let lang = req?.session[sessionLangKey];
  return lang;
} 

const setUserBot = (req, msg) => {
  logger.debug("⭆ setUserBot: %s",  msg?.input?.context?.id);
  let userReplyBtnId = msg?.input?.context?.id;

  let botId =  userReplyBtnId && userReplyBtnId.includes(sessionBotKey) && userReplyBtnId?.split('__')[1]
    
  if (botId) {
      req.session[sessionBotKey] = botId;
      // deafultSession[sessionBotKey] = botId;
      UserSqr.update({[sessionBotKey]: botId}, {where: {userId: req.sessionID}}).then(resp => {
          logger.info("UserModel Bot Save Success %o", resp);
      });
      logger.info(`✅ User selected bot ${botId} req session %o`, req.session );
  } else {
      logger.debug('✓ User selected bot: %s', req.session[sessionBotKey]);
  }
  return botId;
} 

const getUserBot = (req, msg) => {
  // let userSelectedBotId = req?.session[sessionBotKey] || deafultSession[sessionBotKey];
  let userSelectedBotId = req?.session[sessionBotKey];
  return userSelectedBotId;
} 

/**
 * Clear session object
 * @param {*} req 
 */
const clearSession = (req) => {
  let clearLang = undefined;
  // if(req?.session) req.session[sessionLangKey] = clearLang;
  // deafultSession[sessionLangKey] = clearLang;

  let clearBot = undefined;
  // if(req?.session) req.session[sessionBotKey] = clearBot;
  // deafultSession[sessionBotKey] = clearBot;
}

const clearSessionBot = (req) => {
  let clearBot = undefined;
  // if(req?.session) req.session[sessionBotKey] = clearBot;
  // deafultSession[sessionBotKey] = clearBot;
}

const getSession = (req, msg) => {
  var userSesKey = 'user'+ (msg?.fromMobile);
  const query = {
    // give the query a unique name\
    text: 'SELECT * FROM session',
  }
  return req.session;
}

module.exports = {init, getUserLanguage, setUserLanguage, setUserBot, getUserBot, createSession, clearSession, clearSessionBot }
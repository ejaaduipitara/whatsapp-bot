/**
 * Check user is visiting first time
 * @param {*} incomingMsg 
 */
const { logger } = require("../logger");
const userSession = require("../session");

const isFirstTimeUser = (req,incomingMsg) => {
    if(!userSession?.getUserLanguage(req,incomingMsg)) {
        logger.info("❌ isFirstTimeUser");
        return false;
    } else {
        logger.info("✅ isFirstTimeUser");
        return true;
    }
}

module.exports = {isFirstTimeUser}
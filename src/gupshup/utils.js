/**
 * Check user is visiting first time
 * @param {*} incomingMsg 
 */
const { logger } = require("../logger");
const userSession = require("../session");

const isFirstTimeUser = (req,incomingMsg) => {
    if(!userSession?.getUserLanguage(req,incomingMsg)) {
        logger.log("❌ isFirstTimeUser");
        return false;
    } else {
        logger.log("✅ isFirstTimeUser");
        return true;
    }
}

module.exports = {isFirstTimeUser}
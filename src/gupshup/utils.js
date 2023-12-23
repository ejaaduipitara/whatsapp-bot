/**
 * Check user is visiting first time
 * @param {*} incomingMsg 
 */
const userSession = require("../session");

const isFirstTimeUser = (req,incomingMsg) => {
    if(!userSession?.getUserLanguage(req,incomingMsg)) {
        console.log("❌ isFirstTimeUser");
        return false;
    } else {
        console.log("✅ isFirstTimeUser");
        return true;
    }
}

module.exports = {isFirstTimeUser}
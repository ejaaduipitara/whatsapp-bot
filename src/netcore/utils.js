/**
 * Check user is visiting first time
 * @param {*} incomingMsg 
 */
const isFirstTimeUser = (incomingMsg) => {
    if(incomingMsg?.context?.message_id) {
        console.log("❌ isFirstTimeUser");
        return false;
    } else {
        console.log("✅ isFirstTimeUser");
        return true;
    }
}

module.exports = {isFirstTimeUser}
const fs = require('fs');
const {language_dict} = require("./language");

const getBotMessage = (language = 'en', botId, key) => { 
    console.log("getBotMessage: ", language, botId, key);
    return botId ? language_dict[language][botId][key] : language_dict[language][key]
}

const getBotWelcomeMessage = (language,botId) => {
    return getBotMessage(language, botId, "Welcome");
}

const getBotSelection = (lang) => {
  return getBotMessage(lang, null, "bot_selection");
}

module.exports = { }
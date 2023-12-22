const fs = require('fs');
const {language_dict} = require("./language");


const getBotMessage = (language, botId, key) => { 
    console.log("getBotMessage: ", language, botId, key);
    console.log('message',botId ?language_dict[language][botId][key] : language_dict[language][key])
    // console.log('bid',botId)
    // console.log('key',key)
    return botId ? language_dict[language][botId][key] : language_dict[language][key]
}

const getBotWelcomeMessage = (language='en',botId) => {
    return getBotMessage(language,botId, "Welcome");
}

const getBotSelection = (lang ='en') => {
  console.log("Bot - Lang: ", lang);
  console.log(language_dict[lang]["bot_selection"]);
  return getBotMessage(lang, null, "bot_selection");
}

module.exports = { getBotMessage, getBotWelcomeMessage, getBotSelection }
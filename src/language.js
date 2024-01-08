const fs = require('fs');
const glob = require( 'glob' );
const { logger } = require('./logger');

var language_dict = {};
const defaultLang = 'en';
var languagesArray = [];

const init = () => {
  // logger.info("loading lang files");
  glob.sync( './assets/language/*.json' ).forEach( function( file ) {
    logger.info("loading lang files");
    
      let dash = file.split("/");
      if(dash.length == 3) {
          let dot = dash[2].split(".");
        if(dot.length == 2) {
          let lang = dot[0];
          fs.readFile(file, function(err, data) {
            // // logger.info(lang, JSON.parse(data.toString()));
            let dataJson = JSON.parse(data.toString());
            language_dict[lang] = dataJson;
            if(lang == defaultLang) {
              setLanguages(dataJson);
            }
          });
        }
      }
    });
}

const getMessage = (language = defaultLang, botId, key) => {
  // logger.info("⭆ getMessage: ", language, botId, key);
  let msg = botId ? language_dict[language][botId][key] : language_dict[language][key]
  let result
  if(msg) {
    result = JSON.parse(JSON.stringify(msg));
  } else {
    logger.info(`❌ Object doesn't exist for ${language}.${botId}.${key}`);
  }
  // logger.info("getMessage Output\n", msg);
  
  return result;
}

const setLanguages = (data) => {
  if(data) languagesArray = data["languages"];
}
const getLanguages = () => {
  // let languagesArray = language_dict[defaultLang]["languages"];
  return languagesArray;
}

const getLang = (seqNum) => {
  let languagesArray = getLanguages();
  let selLang = languagesArray.find(lang => lang.index == seqNum);
  return selLang;
}

module.exports = {init, defaultLang, language_dict, getMessage, getLanguages, getLang}
